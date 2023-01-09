const mongoose = require("mongoose")
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
        }
    },
    { timestamps: true }
)
const Reviews = mongoose.model("Reviews", ReviewSchema)
module.exports = Reviews;