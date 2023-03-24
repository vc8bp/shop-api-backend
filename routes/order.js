const Order = require("../models/order");
const { verifyAdminWithToken, verifyToken, verifyUserWithToken} = require("./tokenVerify");
const ConfirmOrders = require('../models/ConfirmOrders.js');
const { default: mongoose, mongo } = require("mongoose");
const product = require("../models/product");
const {createOrderTemplate} = require("../helpers/orderConfrimation");
const sendEmail = require("../helpers/sendEmail");
const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});
 
//UPDATE
router.put("/:id", verifyAdminWithToken, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// //DELETE
// router.delete("/:id", verifyAdminWithToken, async (req, res) => {
//   try {
//     await Order.findByIdAndDelete(req.params.id);
//     res.status(200).json("Order has been deleted...");
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });




//////////////            CONFIRMED ORDERS         //////////////////////////////////

//GET USER ORDERS
router.get("/find/:id", verifyUserWithToken, async (req, res) => {
  try {
    const orders = await ConfirmOrders.find({ userID: req.user.id }).sort({createdAt: -1});
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});
 
// //GET ALL

router.get("/", verifyAdminWithToken, async (req, res) => {
  const {page = 1, limit = 10} = req.query;
  const startIndex = (page - 1) * limit;
  const FeildsIWant = {createdAt: 1, userInfo: 1, price: 1, orderStatus: 1}
  let query = ConfirmOrders.find({},FeildsIWant)
  const filters = []

  const qsort = req.query.sort;
  const qstatus= req.query.status;
  const qsearch = req.query.search;
  

  if(qsearch && !isNaN(Number(qsearch))) filters.push({"userInfo.address.mobile" : {$eq: Number(qsearch)}})
  if(qstatus) filters.push({orderStatus: qstatus})

  if(filters.length) query = query.find({$and: filters})

  if (qsort === "price-asc") query.sort({price: 1})
  else if (qsort === "price-desc") query.sort({price: -1})
  else if (qsort === "oldest") query.sort({createdAt: 1})
  else if (qsort === "newest" ) query.sort({createdAt: -1})

  try {
    const orders = await query.skip(startIndex).limit(limit).exec()
    if(orders.length < 1) return res.status(404).json({message: "No Products Found"});
    res.status(200).json(orders);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: "internal server error"});
  }
});

router.put("/status/:id", verifyAdminWithToken, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if(!mongoose.isValidObjectId(id)) return res.status(402).json({message: "order id is not valid"})
  if(!status) return res.status(402).json({message: "status is requires"})

  try {
    const order = await ConfirmOrders.findByIdAndUpdate(id, {orderStatus: status}, {new: true});
    const emailHTML = createOrderTemplate(order)

    sendEmail({
      to: order.userInfo.email,
      subject: "Order Confirmation",
      emailhtml: emailHTML,
      emailtext: emailHTML
    })

    res.status(200).json({message: `order status is successfully updated to ${status}`});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: "internal server error"});
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if(!id) return res.status(401).json({message: "ID required"})

  if(!mongoose.isValidObjectId(id)) return res.status(401).json({message: "ID is not valid"})

  try {
    const order = await ConfirmOrders.findById(id);
    res.status(200).json(order);
  } catch (error) {
    console.log(error)
    res.status(500).json({message: "internal server error"});
  }
})


module.exports = router;