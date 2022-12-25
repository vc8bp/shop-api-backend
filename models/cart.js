const mongoose = require('mongoose');
const { Schema } = mongoose;

  const CartSchema = new Schema({
 
    userID: { type: String, required: true, unique: true },
    products: [
        {
            productID: {type: String},
            size: { type: String},
            color: { type: String },
            quantity: {type: Number},
        }
    ]   
  },{timestamps: true}
  ); 
 

  const Cart = mongoose.model('Cart', CartSchema)
  module.exports = Cart