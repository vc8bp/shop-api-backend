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
            let productItem = cart.products[itemIndex];
            const newQuantity = parseInt(productItem.quantity) + parseInt(req.body.products[0].quantity);
            productItem.quantity = newQuantity;
            cart.products[itemIndex] = productItem;

            await cart.save();
            
            console.log("cart updated");
            return res.status(200).json({status: "success", productExisted: true})
            
        // if user cart dosent have that product
        } else {
          console.log("product is not dublicate")
          await Cart.findOneAndUpdate({userID: req.user.id}, { //pushing new product to array
            $push: {
              products: req.body.products
            }
          },{new: true})

          return res.status(200).json({status: "success", productExisted: false})
        }
 
      } else {
        console.log("product added")
        const newCart = Cart({...req.body, userID: req.user.id});
        const savedCart = await newCart.save();
        console.log("product added")
        return res.status(200).json({status: "success", productExisted: false})

      }
    } catch (err) {
      res.status(500).json(err);
      console.log(err)
    }
  });

//get cart size
router.get('/size',verifyUserWithToken,async (req, res)=>{
    try {
      const cartSize = await Cart.aggregate([
        {$match: {userID: req.user.id}},
        {$addFields: {
            size : {$size: "$products"}
        }},
        {$project: {size: 1, _id: 0}}
      ]);
      const [ removedArrayBrackets ] = cartSize
      res.status(200).json(removedArrayBrackets)

      
    } catch (error) {
      console.log(error)
      res.status(500).json("internal server error")
    }
    


})

//update products Quantity in cart
router.put("/updatequantity/:productNumber/:newQuantity", verifyUserWithToken, async (req,res) => {
    try {
      const cart = await Cart.update(
        {userID: req.user.id, "products.productID": req.params.productNumber},
        {$set: {"products.$.quantity": req.params.newQuantity}}
      )
      res.status(200).json(cart)
    } catch (error) {
      console.log(error)
    }
})


router.delete("/:id", verifyUserWithToken, async (req, res) => {
    console.log(req.params.id)
    try {
      await Cart.updateOne({userID: req.user.id},{ $pull: { 'products': {productID: req.params.id}}})
      res.status(200).json("cart deleted");
      
    } catch (err) {
      console.log(err)
      res.status(500).json(err);
    }
  });
  
  
  
  //get user cart
  router.get("/info/:userId", verifyUserWithToken, async (req, res) => {
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
              _id: 1,
              desc: 1,
              img: 1,
              price: 1,
            }
          }
        },
        
      ]);
      if(!cart.length) {
        return res.status(200).json({success: true, message: "no proucts foound", productFound: false})
      }
      const [cartt] = cart; //removing array brackets
      const margedProducts = []        
      cartt.products.forEach(product => { //murgind user cart product with db product info like price n all whic are dynamic
        const productInfo = cartt.productInfo.find(info => info.productno === product.productID);
        margedProducts.push({ ...product, ...productInfo });
      })
  
      res.status(200).json({userID: req.user.id, cartID: cartt._id, products: margedProducts, productFound: true})
      
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