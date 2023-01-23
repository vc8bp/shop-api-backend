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

    try {
        const address = await Address.create({
            userID: req.user.id,
            address: req.body
        })
        return res.status(200).json({ok: true, address})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ok: false, message: "internal server error"})
    }
    
})

module.exports = route