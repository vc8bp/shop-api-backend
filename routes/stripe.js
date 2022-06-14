const router = require ("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

router.post("/payment", async (req,res) => {
    console.log("api hied")
    await stripe.paymentIntents.create({
        source: req.body.tokenID,
        amount: req.body.amount,
        currency: "INR",
    }, (strpErr, stripRes)=>{
        if(strpErr){
            res.status(500).json(strpErr);
        } else {
            res.status(200).json(stripRes); 
        }
    });
});


module.exports = router;