const cloudinary = require('cloudinary').v2;
require('dotenv').config()
const crypto = require('crypto')

cloudinary.config({
  cloud_name: "dofvasjfs",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadImageToCloudinary = async (image, name) => {
  try {
    const result = await cloudinary.uploader.upload(image, {
      public_id: name
    });
    
    return {
      success: true,
      url: result.secure_url
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = uploadImageToCloudinary;





