const mongoose = require('mongoose');
  const { Schema } = mongoose;

  const UserSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "First name is eequired"],
        minlength: [2, "frist name minimum length should be 2 char"],
        maxlength: [10, "frist name maximum length should be 10 char"],
    },
    lastName: {
      type: String,
      required: true,
      minlength: [2, "Last name minimum length should be 2 char"],
      maxlength: [10, "Last name maximum length should be 10 char"],
    },
    avatar: {
      type: String,
      default: "https://w7.pngwing.com/pngs/867/694/png-transparent-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text-logo.png"
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "this email is not valid email type"] 
    },
    number: {
      type: Number,
      required: true,
  },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    userIP: {
      type: String,
    },

    //2fa
    mfa: { type: Boolean, default: false},
    otp: Number,
    otpExpire: Date,

    //reset password things
    resetPasswordToken: String,
    resetPasswordExpire: Date,

  },{timestamps: true});
  const User = mongoose.model('user', UserSchema)
  module.exports = User