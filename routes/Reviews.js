const { default: mongoose } = require("mongoose");
const Reviews = require("../models/Reviews");
const { verifyToken } = require("./tokenVerify");

const router = require("express").Router()

router.post("/:productid", verifyToken ,async (req, res) => {
    const {review, rating} = req.body;
      // 1) Check if user entered all fields
    if(!review && !rating) {
        return res.status(400).json({success: false, message: "All fields ae Required"})
    }
    
    if (rating < 1) {
        return res.status(400).json({success: false, message: 'Rating cant be less then One'});
    }

    try {
        // 2) Check if the user make a review before on that product
        let checkUser = await Reviews.find({user: req.user.id, product: req.params.productid})
        console.log(checkUser.length)
        if (checkUser.length !== 0) {
            return res.status(400).json({success: 'Error',message: 'Only One Review is allowed Per user'});
        }

        //create review
        const newReview = await Reviews.create({
            user: req.user.id, 
            product: req.params.productid,
            rating,
            review
        })
        res.status(201).json({success: true, message: "your Review is Successfully added"})

    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "internal server error"})
    }   
    
    
})

//GET REVIEWS

router.get("/:id", async (req, res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json("Invalid Product ID");
        }
        const review = await Reviews.aggregate([
            {
                $match: {product: mongoose.Types.ObjectId(req.params.id)}
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $addFields: { //adding this field to get the size of upvotex an rank it based on the upVotes
                    upVotesLength: {$size: "$upVotes"}
                }
            },
            {$sort: {"upVotesLength": -1}},
            {$project: {"user._id": 1, "user.firstName": 1, "user.lastName": 1, "user.avatar": 1 ,review: 1, rating: 1, createdAt: 1, upVotesLength: 1}},
            {$unwind: "$user"}
            
        ])
        res.status(200).json(review)
    } catch (error) {
        res.status(500).json({message: "internal server error"})
    }
    
})

router.put("/abuse/:id", verifyToken , async (req, res) => {
    try {
        // Find the review with the matching id 
        const dbreview = await Reviews.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        });
        if (!dbreview) {
            return res.status(404).json({ success: false, message: "review not found" });
        }
        // If the user has already repored the review, return error message
        if (dbreview.abuseReports.some(vote => vote.userID.toString() === req.user.id)) {
            return res.status(400).json({ success: false, message: "you can not report more then once" });
        }
        // If the user is trying to reports his own review, return error message
        if (dbreview.user.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: "you can not report your own review" });
        }
        // Update the review and add the user's report
        await Reviews.findByIdAndUpdate(req.params.id, { $push: { "abuseReports": { userID: req.user.id } } }, { new: true });
        return res.status(200).json({ success: true, message: "Thank you for your contribution, your responce has been recorded" });

    } catch (err) {
        return res.status(500).json({ success: false, message: "something went wrong" });
    }
})


router.put("/upvote/:id", verifyToken , async (req, res) => {
    try {
        // Find the review with the matching id 
        const dbreview = await Reviews.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        });
        console.log(dbreview)
        if (!dbreview) {
            return res.status(404).json({ success: false, message: "review not found" });
        }
        // If the user has already upvoted the review, return error message

        if (dbreview.upVotes.some(vote => vote.userID.toString() === req.user.id)) {
            return res.status(400).json({ success: false, message: "you can not upvote more then once" });
        }
        // If the user is trying to upvote his own review, return error message
        if (dbreview.user.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: "you can not upvote your own review" });
        }
        // Update the review and add the user's upvote
        await Reviews.findByIdAndUpdate(req.params.id, { $push: { "upVotes": { userID: req.user.id } } }, { new: true });
        return res.status(200).json({ success: true, message: "Thank you for your contribution, your responce has been recorded" });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: "something went wrong" });
    }
});

 
module.exports = router