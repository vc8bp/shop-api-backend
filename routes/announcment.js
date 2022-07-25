const router = require("express").Router();
const Announcments = require("../models/announcment");
const { verifyAdminWithToken } = require("./tokenVerify");


//get announcment
router.get("/", async (req,res) => {
    try {

        const title = await Announcments.findOne();
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
    const titlelength = req.body.title.length;
    
    try {
        if (titlelength > 140) {return res.status(400).json({error: "text length can not be more then 140 charactors"})} //checking if tital length not more then 140 charectors
        const dbtitle = await Announcments.findOne(); //

        if(dbtitle) {
            // const savedTitle = await Announcments.updateOne({}, {Title: req.body.title}, {new: true})
            console.log(dbtitle)
            if(dbtitle.Title === req.body.title) {return res.status(400).json({error: "the announcment you entered is alredy in db"})};//checking if this same title osent exist in db

            dbtitle.Title = req.body.title; //seting title
            await dbtitle.save(); //saving title to mongodb
            return res.status(200).json("title updated sucessfully")
        } else {  
            await title.save();
            return res.status(200).json("title saved ssuccessfully");
            
        }
        
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