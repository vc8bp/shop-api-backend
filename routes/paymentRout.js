const router = require("express").Router();
const Razorpay = require("razorpay")
const dotenv = require("dotenv");
const crypto = require("crypto")
const Product = require("../models/product");
const Order = require("../models/order");
const Cart = require('../models/cart.js')
const User = require('../models/user.js')
const ConfirmOrders = require("../models/ConfirmOrders");
const { verifyUserWithToken } = require("./tokenVerify");
const { default: mongoose } = require("mongoose");

dotenv.config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

router.post("/checkout", verifyUserWithToken , async (req,res) => {
    let price = undefined
    let cart = undefined
    const margedProducts = []   


    if(req.body.type === "product"){ //if req is for single product
      const dbproduct = await Product.findById(req.body.product.productID);
      price = dbproduct.price * req.body.product.quantity;
    

    } else if(req.body.type === "cart"){ //if req is for whole cart
      cart = await Cart.aggregate([
        {$match: {userID: req.user.id}},
        {
          $lookup: {
            from: "products",
            localField: "products.productID",
            foreignField: "productno",
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
            }
          }
        },
        
      ]);

      const [cartt] = cart; //removing array brackets
  
      
      cartt.products.forEach(product => { //murgind user cart product with db product info like price n all whic are dynamic
        const productInfo = cartt.productInfo.find(info => info.productno === product.productID);
        margedProducts.push({ ...product, ...productInfo });
      })
      
      //calculationg total price
      price = await margedProducts?.reduce((total, item) => {
        return total + (item.price * item.quantity)
      },0)
      console.log({price})
    }
    

    const options = {
        amount: Number(price * 100),  // amount in the smallest currency unit
        currency: "INR",
        receipt: crypto.randomBytes(15).toString('hex')
      };

    try {
      const response = await instance.orders.create(options)
      console.log(response)
      const dbOrder = await Order.create({
        userID: req.user.id,
        type: req.body.type,  // is it cart payment or a single product payment
        products: req.body.product || margedProducts,
        price: price,
        address: {address: "empty"},
        order: response,
      })
      res.json({
        order:{
          id: response.id,
          currency: response.currency,
          amount: response.amount
        }
      })
    } catch (error) {
      console.log(error)
    }
})

router.post("/paymentVerify", async (req,res) => {
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature  } = req.body;
  console.log(req.body)
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const crypto = require("crypto");
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                  .update(body.toString())
                                  .digest('hex');
                                  console.log("sig received " ,razorpay_signature);
                                  console.log("sig generated " ,expectedSignature);
  if(expectedSignature === razorpay_signature) {
    //return res.status(200).json({success: true});  
    try {
      const dborder = await Order.findOneAndDelete({"order.id": razorpay_order_id})
      if(!dborder) return res.status(400).json({error: "sesson timeout"})
      const data = {...dborder._doc, paymentStatus: true, }

      await ConfirmOrders.create(data)

      if(dborder.type === "cart"){
        const productIDS = await dborder.products.reduce((neww, current) => { // to get only id's of product which are available on order 
          return [...neww, current._id]
        },[])
        console.log(productIDS)
        await Product.updateMany({_id :{$in: productIDS}}, {$inc: {purchasedCount: 1}}) //adding 1 to the purchasedCount in quantity
        await User.updateOne({_id: dborder.userID}, {$addToSet: { purchasedProducts : { $each : productIDS}}})
        await Cart.deleteOne({userID: dborder.userID})   
      } else {
        const idObject = mongoose.Types.ObjectId(dborder.products[0].productID) //converting in ObjectID
        await User.updateOne({_id: dborder.userID}, {$addToSet: { purchasedProducts :  idObject}})
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
