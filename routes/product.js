const router = require("express").Router();
const mongoose  = require("mongoose");
const { count } = require("../models/product");
const Product = require("../models/product");
const {verifyAdminWithToken} = require("./tokenVerify")
const {uploadImageToCloudinary, deleteImageFromCloudinary} = require('../utils/cloudinaryMethods.js')

//add new product req: login
router.post("/", verifyAdminWithToken, async (req, res) => {
    const id = mongoose.Types.ObjectId()
    console.log(id)
    try {
      const image = await uploadImageToCloudinary(req.body.img, id);
      req.body.img = image.url;
      const savedProduct = await Product.create({...req.body, _id: id})
      res.status(200).json(savedProduct);
    } catch (err) {
      if (err.name === "ValidationError") {
        if (err.name == 'ValidationError') {
          for (field in err.errors) {
            return res.status(400).json({sucess: false,message: err.errors[field].message}); 
          }
        }
      } 
      if(err.code === 11000){
        const dublicate = Object.keys(err.keyPattern)[0];
        return res.status(400).json({message: `A product already exist with the same ${dublicate}`}); 
      }
      return res.status(500).json({message: "internal server Error"});
    }
  });

//update products
router.put("/:id", verifyAdminWithToken, async (req,res) => {
    try {
        const image = await uploadImageToCloudinary(req.body.img, req.body._id);
        req.body.img = image.url;
        const uodateProduct = await Product.findByIdAndUpdate(req.params.id, {
            $set: req.body
        },{new: true})
        res.status(200).json(uodateProduct)
    } catch (error) {
      console.log(error)
        res.status(400).json(error);
    }    
})

//delete product req:login
router.delete("/:id", verifyAdminWithToken, async (req, res) => {
  const id = req.params.id;
  if(!mongoose.isValidObjectId(id)) return res.status(403).json({message: "The product you provided is not a vaid id"})
    try {
      await Product.findByIdAndDelete(id);
      const result = await deleteImageFromCloudinary(id)
      res.status(200).json({message: "product deleted Succesfully"})
    } catch (err) {
      res.status(500).json({message: "failed to delete product"});
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
        return res.status(404).json({message: "Product not Foundd"});
      }
        res.status(200).json(savedProducts)
    } catch (err) {
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
      } else if (qsort === "toppurchased") {
        query.sort({ purchasedCount : -1})
      } else if (qsort === "topRated") {
        query.sort({ ratingsAverage : -1, ratingsQuantity: -1 })
      } else if (qsort === "topreviewed"){
        query.sort({ ratingsQuantity: -1 })
      }
      query.skip(startIndex).limit(limit)

      const products = await query.exec()

      if(products.length < 1) return res.status(404).json({message: "No more product Found!" });
      
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