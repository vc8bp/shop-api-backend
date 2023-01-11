const { default: mongoose } = require("mongoose");
const Reviews = require("../models/reviews");
const { route } = require("./product");
const { verifyToken } = require("./tokenVerify");

const router = require("express").Router()

router.post("/:productid", verifyToken ,async (req, res) => {
    const {review, rating} = req.body;

      // 1) Check if user entered all fields
    if(!review && !rating) {
        return res.status(400).json({success: false, message: "fieldsRequired"})
    }
    
    if (rating < 1) {
        return res.status(400).json({success: false, message: 'ratingLessThanOne'});
    }

    try {
        // 2) Check if the user make a review before on that product
        let checkUser = await Reviews.find({user: req.user.id, product: req.params.productid})
        console.log(checkUser.length)
        if (checkUser.length !== 0) {
            return res.status(400).json({success: 'Error',message: 'onlyOneReview'});
        }

        //create review
        const newReview = await Reviews.create({
            user: req.user.id, 
            product: req.params.productid,
            rating,
            review
        })
        res.status(201).json({success: true, message: "successfulReviewCreate"})

    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "internal server error"})
    }   
    
    
})

//GET REVIEWS

router.get("/:id", async (req, res) => {
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
        {$sort: {"upVotes.users": -1}},
        {$project: {"user._id": 1, "user.firstName": 1, "user.lastName": 1, "user.avatar": 1 ,review: 1, rating: 1, createdAt: 1}},
        {$unwind: "$user"}
        
    ])
    res.status(200).json(review)
})

router.put("/abuse/:id", verifyToken , async (req, res) => {
    const checkUser = await Reviews.findOne({
        _id: mongoose.Types.ObjectId(req.params.id), 
        "abuseReports.users": {$elemMatch: {userID: mongoose.Types.ObjectId(req.user.id)}}
    })

    //if user tryes to report his own review
    if(checkUser.user.toString() === req.user.id) {
        return res.status(400).json({success: true, message: "you can not report your own review"})
    }

    //if user already have reported
    if(checkUser.length !== 0){
        return res.status(400).json({success: true, message: "you can not report more then once"})
    } 
    const ress = await Reviews.findByIdAndUpdate(req.params.id, {$push: {"abuseReports.users": {userID : req.user.id}}}, {new: true})
    res.status(200).json({success: true, message: "Thankyou for your contribution, your responce has ben recorded"})
})

router.put("/upvote/:id", verifyToken , async (req, res) => {
    const checkUser = await Reviews.findOne({
        _id: mongoose.Types.ObjectId(req.params.id), 
        "upVotes.users": {$elemMatch: {userID: mongoose.Types.ObjectId(req.user.id)}}
    })
    //if user tryes to upvote his own review
    if(checkUser.user.toString() === req.user.id){     
        console.log("i am true")   
        return res.status(400).json({success: true, message: "you can not upvote your own review"})
    }

    //if user already have upvoted
    if(checkUser.length !== 0){
        return res.status(400).json({success: true, message: "you can not upvote more then once"})
    } 
    const ress = await Reviews.findByIdAndUpdate(req.params.id, {$push: {"upVotes.users": {userID : req.user.id}}}, {new: true})
    res.status(200).json({success: true, message: "Thankyou for your contribution, your responce has ben recorded"})
})
 
module.exports = router