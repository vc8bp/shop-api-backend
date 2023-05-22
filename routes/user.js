const router = require("express").Router();
const User = require("../models/user");
const { verifyUserWithToken, verifyAdminWithToken } = require("./tokenVerify")
const CryptoJS = require("crypto-js");
const { default: mongoose } = require("mongoose");
const { decreptPass, encreptPass } = require("../utils/pass");



//UPDATE req: login
router.put("/:id", verifyUserWithToken, async (req, res) => {
    try {
        console.log("me hit")
        if (req.body.password) {
            if(!req.body.currentPass) return res.status(400).json({ error: "Old password Is Reuired!!" });
            const oldDbPass = await User.findById(req.user.id, {password: 1, _id: 0})
            const decreptedOldPass = decreptPass(oldDbPass.password)

            if(decreptedOldPass !== req.body.currentPass) return res.status(401).json({ error: "Old password dosent matched!!" });
            req.body.password = encreptPass(req.body.password)
        }
        const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        console.log("me hit3")
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: "failed to update user" });
        console.log(err)
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

//get all user info, req:admin login
router.get("/allinfo", verifyAdminWithToken, async (req, res) => {
  limit = req.query.limit;
  search = req.query.s;
  try {
    let query = User.find({}, { password: 0 })
    let filters = []

    if (search) {
      if (mongoose.isValidObjectId(search)) {
        
        filters.push({ _id: mongoose.Types.ObjectId(search) })

      } else if(isNaN(search)) {
        filters.push({
          $or: [
            { "firstName": { $regex: search, $options: "i" } },
            { "lastName": { $regex: search, $options: "i" } },
            { "email": { $regex: search, $options: "i" } },
          ]
        })
      } else filters.push({ "number": { $eq: Number(search) } })

    }
    if (filters.length > 0) query = User.find({ $and: filters }, { password: 0 })

    resUsers = await query.exec();

    res.status(200).json(resUsers)
  } catch (err) {
    console.log(err)
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

