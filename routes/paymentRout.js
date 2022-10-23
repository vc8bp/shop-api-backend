const router = require("express").Router();
const Razorpay = require("razorpay")
const dotenv = require("dotenv");
const crypto = require("crypto")
const product = require("../models/product");
const order = require("../models/order");
const ConfirmOrders = require("../models/ConfirmOrders");

dotenv.config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

router.post("/checkout", async (req,res) => {
    const dbproduct = await product.findById(req.body.productID);
    price = dbproduct.price * req.body.quantity;
    console.log(dbproduct)

    const options = {
        amount: Number(price * 100),  // amount in the smallest currency unit
        currency: "INR",
        receipt: crypto.randomBytes(15).toString('hex')
      };

    try {
      const response = await instance.orders.create(options)
      console.log(response)
      const dbOrder = order.create({
        userID: req.body.user,
        products: {
          productID :req.body.productID,
          quantity: req.body.quantity,
          size: req.body.size,
          color: req.body.color
        },
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
  const body=razorpay_order_id + "|" + razorpay_payment_id;

  const crypto = require("crypto");
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                  .update(body.toString())
                                  .digest('hex');
                                  console.log("sig received " ,razorpay_signature);
                                  console.log("sig generated " ,expectedSignature);
  if(expectedSignature === "hemlooo") {
    //return res.status(200).json({success: true});  
    try {
      const dborder = await order.findOneAndDelete({"order.id": razorpay_order_id})
      if(!dborder) return res.status(400).json({error: "sesson timeout"})
      const data = {...dborder._doc, paymentStatus: true, }
      await ConfirmOrders.create(data)
      console.log("saved successfuly")
    } catch (error) {
      console.log(error)
    }
    return res.redirect(`${process.env.BACE_FRONTEND_URL}/paymentsuccess?refrence=${razorpay_payment_id}`);
  } else {
    return res.status(400).json({success: false, signatureIsValid: false});  
  }
      
})

router.get("/getKey", async (req,res) =>{
      console.log("get key runed")
      return res.status(200).json({key:process.env.RAZORPAY_KEY_ID})
})

module.exports = router
