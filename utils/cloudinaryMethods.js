const cloudinary = require('cloudinary').v2;
require('dotenv').config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
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

const deleteImageFromCloudinary = async (name) => {
  try {
    const result = await cloudinary.uploader.destroy(name)
    console.log(result)
    return {success: true}
  } catch (error) {
    console.log(error)
    return {success: false, error: error}
  }
}

module.exports = {uploadImageToCloudinary, deleteImageFromCloudinary};





