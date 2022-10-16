const router = require("express").Router();
const Razorpay = require("razorpay")
const dotenv = require("dotenv");
const crypto = require("crypto")
const product = require("../models/product")

dotenv.config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

router.post("/checkout", async (req,res) => {
    const dbproduct = await product.findById(req.body.productID);
    price = dbproduct.price * req.body.quentity;
    const options = {
        amount: Number(price * 100),  // amount in the smallest currency unit
        currency: "INR",
        receipt: crypto.randomBytes(15).toString('hex')
      };

    try {
      const response = await instance.orders.create(options)
      console.log(response)
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
  const response = {"signatureIsValid":"false"}

  if(expectedSignature === razorpay_signature) {
    //return res.status(200).json({success: true});  
    return res.redirect(`${process.env.BACE_FRONTEND_URL}/paymentsuccess?refrence=${razorpay_payment_id}`);
  } else {
    return res.status(400).json({success: false});  

  }
      
})

router.get("/getKey", async (req,res) =>{
      console.log("get key runed")
      return res.status(200).json({key:process.env.RAZORPAY_KEY_ID})
})

module.exports = router
