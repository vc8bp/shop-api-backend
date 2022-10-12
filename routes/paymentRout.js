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
        amount: 50000,  // amount in the smallest currency unit
        currency: "INR",
        receipt: crypto.randomBytes(15).toString('hex')
      };
      const order = await instance.orders.create(options, (err, order) => {
        console.log(order);
        return res.json(order);
      });
})

module.exports = router
