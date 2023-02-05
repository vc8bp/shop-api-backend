const router = require("express").Router();
const mongoose  = require("mongoose");
const { count } = require("../models/product");
const Product = require("../models/product");
const {verifyAdminWithToken} = require("./tokenVerify")
const uploadImage = require('../utils/uploadImage.js')

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

  // const image = await uploadImage(req.body.img);
  // console.log(image)
  // if(image.success){
  //   return res.status(200).json(image.url);
  // }
  // res.status(200).json(image.message);
    try {
        const uodateProduct = await Product.findByIdAndUpdate(req.params.id, {
            $set: req.body
        },{new: true})
        
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

    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json("Invalid Product ID");
    }

    try {
      const savedProducts = await Product.findById(req.params.id);
      if(!savedProducts) {
        return res.status(404).json("Product not Foundd");
      }
        res.status(200).json(savedProducts)
    } catch (err) {
      console.log("/info/:id Errorrrrrr")
      if(err.name === "CastError"){
        return res.status(404).json("Product not Found");
      }
      console.log("/info/:id Errorrrrrr")
      console.log(err)
      res.status(500).json({message: "internal server Error"});
    }
  });

  //GET ALL PRODUCTS
router.get("/allinfo",async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const startIndex = (page - 1) * limit;
    const qCategory = req.query.category;
    const qsort = req.query.sort;
    const qColor = req.query.color;
    const qSize = req.query.size;
    const qs = req.query.s;

    try {
      let query = Product.find()

      const filterArr = [];
      if(qs) filterArr.push({$or: [
                            {"title": {$regex: qs, $options: "i"}},
                            {"productno": {$regex: qs, $options: "i"}},
                            {"desc": {$regex: qs, $options: "i"}},
                            {"categories": {$in: [qs]}}
                          ]})

      if (qCategory) filterArr.push({ categories: { $in: [qCategory] } });
      if (qColor) filterArr.push({ color: { $in: [qColor] } });
      if (qSize) filterArr.push({ size: { $in: [qSize] } }); 
      if (filterArr.length !== 0) {
          query = query.find({ $and: filterArr });
      }

      if(qsort === "Newest") { 
        query.sort({ createdAt: -1})
      } else if (qsort === "price-asc") {  
        query.sort({ price : 1})
      } else if (qsort === "price-desc") {
        query.sort({ price : -1})
      }
      query.skip(startIndex).limit(limit)
      const products = await query.exec()
      
      res.status(200).json(products);
      

    } catch (error) {
      res.status(500).json({message: "failed to get Product" });
    }

  });


  router.get("/search/:s", async (req, res) => {
    const s = req.params.s;
    if(!s) {
      return res.status(400).json("not found")
    }
    try {
      const products = await Product.find(
        {$or: [
          {"title": {$regex: s, $options: "i"}},
          {"productno": {$regex: s, $options: "i"}},
          {"desc": {$regex: s, $options: "i"}},
          {"categories": {$in: [s]}}
        ]},
        {
          title: 1,
          _id: 1
        }
      ).limit(5)
  
      return res.status(200).json(products)
    } catch (error) {
      console.log(error)
      return res.status(500).json("internal server error")
    }
  })
  

module.exports = router;