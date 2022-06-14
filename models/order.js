const mongoose = require('mongoose');
const { Schema } = mongoose;

  const OrderSchema = new Schema({
 
    userID: { type: String, required: true },
    products: [
        {
            productID: {type: String},
            quantity: {type: Number, default: 1}
        }
    ],
    price: {type: Number, required: true},
    address: {type: Object, required: true},
    status: {type: String, default: "panding"},
  },{timestamps: true}
  );



  module.exports = mongoose.model('Order',OrderSchema);
  