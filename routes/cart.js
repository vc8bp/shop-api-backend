const router = require("express").Router();
const Cart = require("../models/cart");
const {verifyAdminWithToken, verifyToken, verifyUserWithToken} = require("./tokenVerify")

//add new product to cart req: login

router.post("/", verifyToken, async (req, res) => {
    //const newCart = new cart(req.body);

    try {
      const cart = await Cart.findOne({userID: req.body.userID})
      console.log(`userID : ${req.body.userID}`)
      console.log(cart)
      
      
        if(cart?.userID === req.body.userID) {
          console.log("user cart exist")
          // for(let i in cart.products) {
          //   if(cart.products[i].productID === req.body.products[0].productID){
          //         dublicate = true
          //       }
          // }
          let itemIndex = cart.products.findIndex(p => p.productID === req.body.products[0].productID);
          console.log(`dublicate index : ${itemIndex}`)
          
      
        if(itemIndex > -1) {
          console.log("product is dublicate")
          console.log(req.body.products[0].productID)

          // const updatedCart = await Cart.findOneAndUpdate({userID: req.body.userID, "products.$.productID": req.body.products[0].productID },
          // {$set: {"products.$.quantity" : 100}}
          // )
          // console.log(updatedCart)


          let productItem = cart.products[itemIndex];
          const newQuantity = parseInt(productItem.quantity) + parseInt(req.body.products[0].quantity);
          productItem.quantity = newQuantity;
          cart.products[itemIndex] = productItem;

          savedCart = await cart.save();
          

          res.status(200).json(savedCart)
          console.log("cart updated");
          
        } else {
          console.log("product is not dublicate")
          console.log(req.body.products[0].productID)
          const updatedCart = await Cart.findOneAndUpdate({userID: req.body.userID}, {
            
            $push: {
              products: {
                productID: req.body.products[0].productID,
                title: req.body.products[0].title,
                img: req.body.products[0].img,
                size: req.body.products[0].size,
                color: req.body.products[0].color,
                price: req.body.products[0].price,
                quantity: req.body.products[0].quantity
              }
            }
          })

          res.status(200).json(updatedCart)
        }
 
      } else {
        console.log("product added")
        const newCart = Cart(req.body);
        const savedCart = await newCart.save();
        res.status(200).json(savedCart);
        console.log("product added")

      }
    } catch (err) {
      res.status(500).json(err);
      console.log(err)
    }
  });


//update products cart
router.put("/:id", verifyUserWithToken, async (req,res) => {

    try {
        const uodatecart = await Cart.findByIdAndUpdate(req.params.id, {
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