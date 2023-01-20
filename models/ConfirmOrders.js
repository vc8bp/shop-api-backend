const mongoose = require('mongoose');
const { Schema } = mongoose;

  const ConfirmOrderSchema = new Schema({
 
    userID: { type: String, required: true },
    products: [
        {
            title: {type: String},
            img: {type: String},
            price: {type: Number},
            productID: {type: String},
            quantity: {type: Number, default: 1},
            size: {type: String},
            color: {type: String}
        }
    ],
    price: {type: Number, required: true},
    address: {type: Object, required: true},
    order: {type: Object, required: true},
    paymentStatus: {type: Boolean, default: false},
    paymentInfo: {type: Object, default: false},
    orderStatus: {type: String, default: "Processing"},
    ExpectedDelevery: {type: Date, default: function() {
                                              let date = new Date();
                                              date.setDate(date.getDate() + 5);
                                              return date;
                                            }}
  },{timestamps: true}
  );



  module.exports = mongoose.model('PaidOrder',ConfirmOrderSchema);