const router = require("express").Router();
const Product = require("../models/product");
const {verifyAdminWithToken} = require("./tokenVerify")

//add new product req: login

router.post("/", verifyAdminWithToken, async (req, res) => {
    const newProduct = new Product(req.body);
          //BUG
    //crate index of product no work left to do
    try {
      const savedProduct = await newProduct.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  });

//update products
router.put("/:id", verifyAdminWithToken, async (req,res) => {

    try {
        const uodateProduct = await Product.findByIdAndUpdate(req.params.id, {
            $set: req.body
        },{new: true})
        res.status(200).json(uodateProduct);
    } catch (error) {
        res.status(400).json(error);
    }
    
})

//delete product req:login
router.delete("/:id", verifyAdminWithToken, async (req, res) => {
  
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json("product deleted")
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  
  
  //get specific product info
  router.get("/info/:id", async (req, res) => {

    try {
      const savedProducts = await Product.findById(req.params.id);
      res.status(200).json(savedProducts)
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  //get app product info or pass query to get newest added specific ammount of products 
  //req:admin login
  //
  //GET ALL PRODUCTS
router.get("/allinfo", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
      let products;
  
      if (qNew) {
        products = await Product.find().sort({ createdAt: -1 }).limit(qNew);
      } else if (qCategory) {
        products = await Product.find({
          categories: {
            $in: [qCategory],
          },
        });
      } else {
        products = await Product.find();
      }
  
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

module.exports = router;