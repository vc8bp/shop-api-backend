const router = require("express").Router();
const User = require("../models/user");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const crypto = require('crypto')
const sendEmail = require('../helpers/sendEmail')



//Register
router.post("/register", async (req, res) => {
  if (req.body.password.length < 5 || req.body.password.length > 10 ) {
      return res.status(400).json({ error: "password length should be in range of 5 to 10 charecter"})
  };
  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    number: req.body.number,
    password: cryptoJS.AES.encrypt(req.body.password, process.env.CRYPTOJS_SECRET_KEY.toString()),
  });
  try {
    const saveduser = await newUser.save();
    const {password, ...others} = saveduser._doc; 

    const accessToken = jwt.sign({
      id:saveduser._id, 
      isAdmin: saveduser.isAdmin,

    }, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_SECRET_EXPIRE || "3d"});


    res.status(201).json({...others, accessToken}); 
    
  } catch (err) {
      console.log(err)
      if(err.code === 11000) { 
        return res.status(400).json({error: "account with this email already exist"}) 
      } else if (err.name === "ValidationError") { //this is some googled stuff
          if (err.name == 'ValidationError') {
            for (field in err.errors) {
              return res.status(400).json({error: err.errors[field].message}); 
            }
          }
      } else {
      console.log(`Logged Error from register user : ${err}`)
      return res.status(500).json({error: "internal server error"})
      }
  }
  
});

//login
router.post("/login", async (req, res) => {

  
  if(!req.body.email || !req.body.password) {
    return res.status(400).json({error: "please provide email and password"})
  }

  try {
    const user = await User.findOne({email: req.body.email});
      if (!user) {
        return res.status(401).json({error: "wrong credentials"})
      } 
      //matching pass
      const hashedpass = await cryptoJS.AES.decrypt(user.password, process.env.CRYPTOJS_SECRET_KEY);
      const pass = await hashedpass.toString(cryptoJS.enc.Utf8);
      if(pass !== req.body.password) {
        return res.status(401).json({error: "wrong credentials"}) 
      }

      const accessToken = jwt.sign({
        id:user._id, 
        isAdmin: user.isAdmin,

      }, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_SECRET_EXPIRE || "3d"});

      const {password, ...others} = user._doc
      res.status(200).json({...others, accessToken})
    
  } catch (err) {
    console.log(`Logged Error from login user : ${err}`)
    return res.status(500).json({ // Worked
      error: "Internal server error",
    });
    
  }
})


router.put("/forgotpass/:id", async (req, res)=> {
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedresetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expireDate = Date.now() + (10 * 6000);
  const email = req.body.email;

  if(!email) {
    return res.status(400).json({error: "please provide a email"});
  }
  try {
    

    //finding if user and updating it
    const user = await User.findOneAndUpdate({email: email}, {
      resetPasswordToken: hashedresetPasswordToken,
      resetPasswordExpire: expireDate
    });

    console.log(`user: ${user}`)
    if(!user) {
      return res.status(401).json({ error: "user with this email not exist"});
    };
    

    //sending email thing
    const resetURl = `https://localhost:5000/${hashedresetPasswordToken}`
    const emailhtml = `
      <h1>you have requested a password reset</h1>
      <p>please go tho this link to reset password</p>
      <a href=${resetURl}>${resetURl}</a>
    `
    const emailtext = `
      you have requested a password reset
      please go tho this link to reset password
      ${resetURl}
    `
    try {
      sendEmail({
        to: user.email,
        subject: "Forgot Password",
        emailhtml: emailhtml,
        emailtext: emailtext
      })


    } catch (error) {
      //removing users reset token if its not valid
      await User.findOneAndUpdate({email: email}, {
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      });
      console.log(error)
      return res.status(401).json({error: "Failed to send email"})
    }
    res.status(200).json("Email send Sucessfully")


  } catch (error) {
    res.status(500).json(error)
  }
})



module.exports = router;
