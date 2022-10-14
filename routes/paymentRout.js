const router = require("express").Router();
const Razorpay = require("razorpay")
const dotenv = require("dotenv");
const crypto = require("crypto")
dotenv.config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

router.post("/checkout", async (req,res) => {
    const options = {
        amount: Number(req.body.ammount * 100),  // amount in the smallest currency unit
        currency: "INR",
        receipt: crypto.randomBytes(15).toString('hex')
      };
      const order = await instance.orders.create(options, (err, order) => {
        console.log(order);
        return res.json({success: true, order});
      });
})

router.post("/paymentVerify", async (req,res) => {
  //ERRORRRRRRRRRRRRRRRRRRRRRRRRRRRRR
  //payment veefy giving nothng 
      console.log(req.body)
      return res.json({success: true,body: req.body});  
})

router.get("/getKey", async (req,res) =>{
      return res.status(200).json({key:process.env.RAZORPAY_KEY_ID})
})

module.exports = router
