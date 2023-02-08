const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const Announcments = require("../models/announcment");
const { verifyAdminWithToken } = require("./tokenVerify");


//get announcment
router.get("/", async (req,res) => {
    try {

        const title = await Announcments.findOne({status: true}).sort({updatedAt: -1});
        res.status(200).json(title); 

    } catch (error) {
        console.log(error)
        res.status(400).json({error: "internal servr error"}) 
    }
    
})

//add if there is no title or update it
router.post('/', verifyAdminWithToken, async (req, res) => {
    const title = new Announcments({
        Title: req.body.title
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
//update Status
router.put('/active/:id', verifyAdminWithToken, async (req, res) => {

    const { id } = req.params;
    console.log(id)
    if(!req.body?.active) return res.status(400).json({message: "active is requires!"})
    if(!mongoose.isValidObjectId(id)) return res.status(400).json({message: "this is not an valid ID that you provided!"})

    try {
        if(req.body.active === true){ //if req is for activating announcment then check that is there any other active announcment!
            const checkAlreadyActive = await Announcments.findOne({active: true}, {_id: 1});
            if(checkAlreadyActive) return res.status(401).json({message: `Already 1 announcment is activated with this ID: ${checkAlreadyActive._id}!`})
        }

        await Announcments.findByIdAndUpdate(id, {$set :{status: req.body.active}})
        res.status(200).json({message: `announcment status successfully Updated to ${req.body.active}!`})
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal erver error"})
    }
    
});

//Disabel all Announcments
router.delete('/active', verifyAdminWithToken, async (req, res) => {

    
    try {
        const ress = await Announcments.updateMany({active: true}, {$set: {active: false}})
        res.status(200).json({message: `${ress.modifiedCount} Deactivated successfully!`})
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal erver error"})
    }
    
});

router.delete("/", verifyAdminWithToken, async (req,res) => {
    try {

        const dbAnnouncment = await Announcments.find();
        if(dbAnnouncment.length === 0) {return res.status(400).json({error: "there is no announcment in db"})};

        await Announcments.deleteOne();

        return res.status(200).json("announcment deleted successfully")
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "internal erver error"}) 
    }
})

module.exports = router;