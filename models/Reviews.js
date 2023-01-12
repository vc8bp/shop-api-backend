const mongoose = require("mongoose")
const product = require("./product")
const {Schema} = mongoose


const ReviewSchema = new Schema(
    {
        review: {
          type: String,
          required: [true, 'Review cannot be empty!']
        },
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        product: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Review must belong to a product']
        },
        user: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
          required: [true, 'Review must belong to a user']
        },
        upVotes: [
            {userID: {type: mongoose.Types.ObjectId, ref: 'User',}}
        ],
        abuseReports: [
            {userID: {type: mongoose.Types.ObjectId, ref: 'User',}}
        ],
    },
    { 
      timestamps: true,
    }                                 

)

ReviewSchema.post('save', function() {
  ReviewSchema.static.calcAvgRating(this.product)
})

const Reviews = mongoose.model("Reviews", ReviewSchema)


//calculating avg
ReviewSchema.static.calcAvgRating = async function(productID) {
  console.log("calc runed")
  const stats = await Reviews.aggregate([
    {$match: {product: productID}},
    {
      $group: {
        _id: "$product",
        numberOfRating: {$sum: 1},
        avg: {$avg: "$rating"}
      }
    }
  ])

  //updating products based on any action on reviews
  if(stats.length > 0) {
    await product.findByIdAndUpdate(productID, {
      ratingsQuantity : stats[0].numberOfRating,
      ratingsAverage: stats[0].avg
    })
  }else {
    await product.findByIdAndUpdate(productID, {
      ratingsQuantity : 0,
      ratingsAverage: 4.5
    })
  }
}


module.exports = Reviews;