const router = require("express").Router();
const Razorpay = require("razorpay")
const dotenv = require("dotenv").config();
const crypto = require("crypto")
const Product = require("../models/product");
const Order = require("../models/order");
const Cart = require('../models/cart.js')
const User = require('../models/user.js')
const ConfirmOrders = require("../models/ConfirmOrders");
const { verifyToken } = require("./tokenVerify");
const { default: mongoose } = require("mongoose");
const sendEmail = require("../helpers/sendEmail");
const { createOrderTemplate } = require("../helpers/orderConfrimation");



const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


router.post("/checkout", verifyToken , async (req,res) => {
    let price = undefined
    let cart = undefined
    const margedProducts = []   

    if(req.body.type === "product"){ //if req is for single product
      const dbproduct = await Product.findById(req.body.product.productID,{price: 1, img: 1, title: 1,_id: 0,quantity: 1});

      if(!dbproduct) return res.status(404).json({success: false, message: "Sorry! Unable to find this product."})
      if(dbproduct.quantity < 1) return res.status(404).json({success: false, message: "Sorry! This products is currently out of stock"})
      

      price = dbproduct.price * req.body.product.quantity;
      req.finalProduct = {...dbproduct._doc, ...req.body.product} //appending dbProduct info with user product info so that i can store the value in db

    } else if(req.body.type === "cart"){ //if req is for whole cart
      cart = await Cart.aggregate([
        {$match: {userID: req.user.id}},
        {
          $lookup: {
            from: "products",
            localField: "products.productID",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        {
          $project: {
            userID: 1,
            products: { productID: 1,size: 1, color: 1, quantity: 1},
            productInfo: {
              productno: 1,
              _id: 1,
              price: 1,
              title: 1,
              img: 1
            }
          }
        },
        
      ]);

      const [cartt] = cart;//removing array brackets

      if(!cartt) {
        return res.status(404).json({message: "no products found on your cart"})
      }
  
      
      cartt.products.forEach(product => { //murgind user cart product with db product info like price n all whic are dynamic
        const productInfo = cartt.productInfo.find(info => `${info._id}` === `${product.productID}`); //converted to string because when i was checking === it was cheecking the refrence on the memory not value bcz its an Objectid is an refrence ty[e]
        margedProducts.push({ ...product, ...productInfo });
      })
      
      //calculationg total price
      price = await margedProducts.reduce((total, item) => {
        return total + (item.price * item.quantity)
      },0)
    }

    const options = {
        amount: Number((price * 100).toFixed(2)),  // amount in the smallest currency unit && toFIxef: it will only allow two decemal values ater .
        currency: "INR",
        receipt: crypto.randomBytes(15).toString('hex')
      };
    try {
      const response = await instance.orders.create(options) //razorpay SDK call

      const dbOrder = await Order.create({ // Saving to db
        userID: req.user.id,
        type: req.body.type,  // is it cart payment or a single product payment
        products: req.finalProduct || margedProducts,
        price: Number(price.toFixed(2)),
        userInfo: {
          address: req.body.userInfo.address,
          name: req.body.userInfo.name,
          email: req.body.userInfo.email,
        },
        order: response,
      })
      res.json({
        order:{
          id: response.id,
          amount: response.amount
        }
      })

      const emailTemplate = createOrderTemplate(dbOrder)
      sendEmail({
        to: dbOrder.userInfo.email,
        subject: "Order Confirmation",
        emailhtml : emailTemplate
      })
    } catch (error) {
      console.log(error)
    }

    
})

router.post("/paymentVerify", async (req,res) => {
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature  } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const crypto = require("crypto");
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                  .update(body.toString())
                                  .digest('hex');
  if(expectedSignature === razorpay_signature) {
    try {
      const dborder = await Order.findOneAndDelete({"order.id": razorpay_order_id})
      if(!dborder) return res.status(400).json({error: "sesson timeout"})
      const data = {...dborder._doc, paymentStatus: true,paymentInfo: req.body }

      await ConfirmOrders.create(data)

      if(dborder.type === "cart"){

        const updateProduct = dborder.products.map(product => ({
          updateOne: {
            filter: {_id : product.id},
            update: {
              $inc: { purchasedCount: product.quantity, quantity : -product.quantity }
            }
          }
        }))
        await Product.bulkWrite(updateProduct)
        

        await User.updateOne({_id: dborder.userID}, {$addToSet: { purchasedProducts : { $each : dborder.products.map(p => p._id)}}}) // map used to get only id's of product which are available on order 
        await Cart.deleteOne({userID: dborder.userID})   
      } else {
        const idObject = mongoose.Types.ObjectId(dborder.products[0].productID) //converting in ObjectID
        await User.updateOne({_id: dborder.userID}, {$addToSet: { purchasedProducts :  idObject}})

        await Product.findByIdAndUpdate(dborder.products[0].productID, {$inc: {purchasedCount: dborder.products[0].quantity, quantity: -dborder.products[0].quantity}})
      }

    } catch (error) {
      console.log(error)
      return res.status(400).json({success: false, message: "failed to process your information"});       
    }
    return res.redirect(`${process.env.BACE_FRONTEND_URL}/paymentsuccess?refrence=${razorpay_payment_id}`);
  } else {
    return res.status(400).json({success: false, signatureIsValid: false});  
  }
      
})

router.get("/getKey", async (req,res) =>{
  return res.status(200).json({key:process.env.RAZORPAY_KEY_ID})
})

module.exports = router
