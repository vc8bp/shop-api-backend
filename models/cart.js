const mongoose = require('mongoose');
const { Schema } = mongoose;

  const CartSchema = new Schema({
 
    userID: { type: String, required: true },
    products: [
        {
            productID: {type: String},
            quantity: {type: Number, default: 1}
        }
    ]
    
  },{timestamps: true}
  ); 


  const Cart = mongoose.model('Cart', CartSchema)
  module.exports = Cart