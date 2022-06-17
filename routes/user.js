const router = require("express").Router();
const User = require("../models/user");
const {verifyUserWithToken, verifyAdminWithToken} = require("./tokenVerify")
const CryptoJS = require("crypto-js")

//UPDATE req: login
router.put("/:id", verifyUserWithToken, async (req, res) => {
  if (req.body.password) {
    req.body.password = await CryptoJS.AES.encrypt(req.body.password,process.env.CRYPTOJS_SECRET_KEY).toString();
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id,{ $set: req.body},{new: true});
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete user req:login
router.delete("/:id", verifyUserWithToken, async (req, res) => {
  
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("user deleted")
  } catch (err) {
    res.status(500).json(err);
  }
});



//get specific user info, req:admin login
router.get("/info/:id", verifyAdminWithToken, async (req, res) => {
  
  try {
    const suser = await User.findById(req.params.id);
    res.status(200).json(suser)
  } catch (err) {
    res.status(500).json(err);
  }
});

//get specific user info, req:admin login
router.get("/allinfo", verifyAdminWithToken, async (req, res) => {
  query = req.query.limit
  try {
    //.sort({ _id: -1}) used to fetch data from last bcz last is new data in mongodb 
    const suser = query ? await User.find().sort({ _id: -1}).limit(query) : await User.find();
    res.status(200).json(suser)
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS
router.get("/stats", verifyAdminWithToken, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  //very confusing about dates
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;

