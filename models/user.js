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

  },{timestamps: true});
  const User = mongoose.model('user', UserSchema)
  module.exports = User