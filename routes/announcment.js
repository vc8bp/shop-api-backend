const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const { findByIdAndUpdate } = require("../models/announcment");
const Announcments = require("../models/announcment");
const { verifyAdminWithToken } = require("./tokenVerify");


//get announcment
router.get("/", async (req,res) => {
    try {
        const title = await Announcments.findOne({active: true}).sort({updatedAt: -1});
        res.status(200).json(title); 
    } catch (error) {
        console.log(error)
        res.status(400).json({error: "internal servr error"}) 
    }
    
})

//add Annoucment
router.post('/', verifyAdminWithToken, async (req, res) => {
    const title = new Announcments({
        title: req.body.title
    })
    try {
        if (req.body.title?.length > 140) {return res.status(400).json({error: "text length can not be more then 140 charactors"})} 
        title.save()    
        res.status(200).json("announcment successfully added!")
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal erver error"})
    }
    
});
//Edit annoucment Status
router.put('/:id', verifyAdminWithToken, async (req, res) => {
    const { id } = req.params;
    const { title, active} = req.body;
    console.log(title)
    if(!JSON.stringify(active) || !title) return res.status(400).json({message: "all feild is requires!"})
    if(!mongoose.isValidObjectId(id)) return res.status(400).json({message: "this is not an valid ID that you provided!"})

    try {
        if(active) {
            await Announcments.updateMany({$set: {active: false}})
        }
        const ress = await Announcments.findByIdAndUpdate(id, { $set: { title, active } });
        res.status(200).json({message: `announcment successfully Updated!`})
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal erver error"})
    }
    
});


//Disabel all Announcments
router.delete('/active', verifyAdminWithToken, async (req, res) => {  
    try {
        const ress = await Announcments.updateMany({active: true}, {$set: {active: false}})
        res.status(200).json({message: `${ress.modifiedCount} annoucment Deactivated successfully!`})
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal erver error"})
    }
    
});

//get all annoucments
router.get("/all", verifyAdminWithToken, async (req,res) => {
    try {
        const dbAnnouncment = await Announcments.find();
        return res.status(200).json(dbAnnouncment)
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal erver error"}) 
    }
})

module.exports = router;