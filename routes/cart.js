const router = require("express").Router();
const Cart = require("../models/cart");
const {verifyAdminWithToken, verifyToken, verifyUserWithToken} = require("./tokenVerify")

//add new product to cart req: login

router.post("/:id", verifyUserWithToken, async (req, res) => {
    //const newCart = new cart(req.body);
    try {
      const cart = await Cart.findOne({userID: req.user.id})

        //if that user cart exist
        if(cart) {
          console.log("user cart exist")
          
          let itemIndex = cart.products.findIndex(p => p.productID === req.body.products[0].productID);
          console.log(`dublicate index : ${itemIndex}`)
          
          //if that product axist on cart.
          if(itemIndex > -1) {
            console.log("product is dublicate")

            let productItem = cart.products[itemIndex];
            const newQuantity = parseInt(productItem.quantity) + parseInt(req.body.products[0].quantity);
            productItem.quantity = newQuantity;
            cart.products[itemIndex] = productItem;

            savedCart = await cart.save();
            
            console.log("cart updated");
            return res.status(200).json(savedCart)
            
        // if user cart dosent have that product
        } else {
          console.log("product is not dublicate")
          const updatedCart = await Cart.findOneAndUpdate({userID: req.user.id}, { //pushing new product to array
            $push: {
              products: req.body.products
            }
          },{new: true})

          return res.status(200).json(updatedCart)
        }
 
      } else {
        console.log("product added")
        const newCart = Cart({...req.body, userID: req.user.id});
        const savedCart = await newCart.save();
        console.log("product added")
        return res.status(200).json(savedCart);

      }
    } catch (err) {
      res.status(500).json(err);
      console.log(err)
    }
  });

//get cart size
router.get('/size/:id',verifyUserWithToken,async (req, res)=>{
    
    const cart = await Cart.findOne({userID: req.user.id});
    if(!cart) return res.status(200).json(0)

    const cartLength = cart.products?.length;  
    return res.status(200).json(cartLength);

})

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
router.delete("/:id/:productID", verifyUserWithToken, async (req, res) => {
  
    try {
      await Cart.updateOne({userID: req.user.id},{ $pull: { 'products': {productID: req.params.productID}}})
      res.status(200).json("cart deleted");
      
    } catch (err) {
      console.log(err)
      res.status(500).json(err);
    }
  });
  
  
  
  //get user cart
  router.get("/info/:userId", verifyUserWithToken, async (req, res) => {
    console.log(req.user.id)
    try {
      const cart = await Cart.aggregate([
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
            products: 1,
            productInfo: {
              title: 1,
              productno: 1,
              desc: 1,
              img: 1,
              price: 1,
            }
          }
        },
        
      ]);
      const [cartt] = cart; //removing array brackets

      const margedProducts = []        
      cartt.products.forEach(product => { //murgind user cart product with db product info like price n all whic are dynamic
        const productInfo = cartt.productInfo.find(info => info.productno === product.productID);
        margedProducts.push({ ...product, ...productInfo });
      })
  
      res.status(200).json({userID: req.user.id, cartID: cartt._id, products: margedProducts})
      
    } catch (err) {
      console.log(err)
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