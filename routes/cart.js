const router = require("express").Router();
const Cart = require("../models/cart");
const cart = require("../models/cart");
const {verifyAdminWithToken, verifyToken, verifyUserWithToken} = require("./tokenVerify")

//add new product to cart req: login

router.post("/", verifyToken, async (req, res) => {
    const newCart = new cart(req.body);

    try {
      const savedCart = await newCart.save();
      res.status(200).json(savedCart);
      console.log("product added")
    } catch (err) {
      res.status(500).json(err);
    }
  });

//update products cart
router.put("/:id", verifyUserWithToken, async (req,res) => {

    try {
        const uodatecart = await cart.findByIdAndUpdate(req.params.id, {
            $set: req.body
        },{new: true})
        res.status(200).json(uodatecart);
    } catch (error) {
        res.status(400).json(error);
    }
    
})

//delete product from cart req:login
router.delete("/:id", verifyUserWithToken, async (req, res) => {
  
    try {
      await cart.findByIdAndDelete(req.params.id);
      res.status(200).json("cart deleted")
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  
  
  //get user cart
  router.get("/info/:userId", async (req, res) => {

    try {
      const cart = await Cart.findOne({userId: req.params.userId});
      res.status(200).json(cart)
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  //GET ALL carts
router.get("/allinfo", verifyAdminWithToken, async (req, res) => {
    
    try {
      const cart = await Cart.find();
  
      res.status(200).json(cart);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

module.exports = router;