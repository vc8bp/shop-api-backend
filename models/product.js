const mongoose = require('mongoose');
const { Schema } = mongoose;

  const ProductSchema = new Schema({
 
    title: { type: String, required: true },
    productno: {type: String, required: true, unique: true, index:true},
    desc: { type: String, required: true },
    img: { type: Schema.Types.Mixed, required: true},
    categories: { type: Array, default: "kurti"},
    size: { type: Array},
    color: { type: Array },
    price: { type: Number, required: true},
    quantity: { type: Number, required: true},
    purchasedCount: { type: Number, default: 0},
    ratingsQuantity: {type: Number, default: 0},
    ratingsAverage: { type: Number, default: 0,
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10
    },
  },{timestamps: true}
  );
  
  
  module.exports = mongoose.model('products', ProductSchema);