const route = require("express").Router()
const Address = require("../models/UserAddress")
const { verifyToken } = require("./tokenVerify")

//get user address
route.get("/", verifyToken ,async (req, res) => {
    try {
        const address = await Address.findOne({userID: req.user.id})
        console.log(address)
        if(address?.address){
            return res.status(200).json({ok: true, address: address.address})
        }
        return res.status(200).json({ok: false, message: "no address found"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ok: false, message: "internal server error"})
    }
})

route.post("/", verifyToken ,async (req, res) => {

    const {street, city, state, zip, country, mobile} = req.body;

    if(!street && !city && !state && !zip && !country && !mobile){
        return res.status(400).json({ok: false, message: "all fields are required"})
    }
    const payload = { userID: req.user.id, address: req.body}

    const isUpdate = req.query.update;


    try {
        const address = isUpdate ?  await Address.findOneAndUpdate({userID: req.user.id}, payload)  :  await Address.create(payload)

        return res.status(200).json({ok: true, address})
    } catch (error) {
        if(error.code === 11000){
            return res.status(500).json({ok: false, message: "We already have your Address in our system"})
        }
        console.log(error)
        return res.status(500).json({ok: false, message: "internal server error"})
    }
    
})

module.exports = route