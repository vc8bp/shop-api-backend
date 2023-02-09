const Order = require("../models/order");
const { verifyAdminWithToken, verifyToken, verifyUserWithToken} = require("./tokenVerify");
const ConfirmOrders = require('../models/ConfirmOrders.js');
const { default: mongoose } = require("mongoose");
const product = require("../models/product");
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

//DELETE
router.delete("/:id", verifyAdminWithToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});


// GET MONTHLY INCOME

router.get("/income", verifyAdminWithToken, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});



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
  let query = ConfirmOrders.find()
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
  else if (qsort === "newest") query.sort({createdAt: -1})

  try {
    const orders = await query.exec()
    res.status(200).json(orders);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

router.put("/status/:id", verifyAdminWithToken, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if(!mongoose.isValidObjectId(id)) return res.status(402).json({message: "order id is not valid"})
  if(!status) return res.status(402).json({message: "status is requires"})

  try {
    await ConfirmOrders.findByIdAndUpdate(id, {
      orderStatus: status
    });
    res.status(200).json({message: `order status is successfully updated to ${status}`});
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;