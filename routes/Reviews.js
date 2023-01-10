const Reviews = require("../models/reviews");
const { verifyUserWithToken } = require("./tokenVerify");

const router = require("express").Router()

router.post("/:productid", verifyUserWithToken ,async (req, res) => {
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
        let checkUser = await Reviews.find({user: req.body.id, product: req.params.productid})
        console.log(checkUser.length)
        if (checkUser.length !== 0) {
            return res.status(400).json({success: 'Error',message: 'onlyOneReview'});
        }

        //create review
        const newReview = await Reviews.create({
            user: req.body.id, 
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
    const review = await Reviews.find({product: req.params.id})
    res.status(200).json(review)
})

module.exports = router