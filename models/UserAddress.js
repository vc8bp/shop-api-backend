const mongoose = require("mongoose")

const AddressSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true, 
        unique: true
    },
    address: {
        street: {
            type: String, 
            required: [true, "street cannot be empty!"]
        },
        city: {
            type: String, 
            required: [true, "City cannot be empty!"]
        },
        state: {
            type: String, 
            required: [true, "State cannot be empty!"]
        },
        zip: {
            type: String, 
            required: [true, "Zip cannot be empty!"]
        },
        country: {
            type: String, 
            required: [true, "Country cannot be empty!"]
        },
        mobile: {
            type: Number, 
            required: [true, "Mobile cannot be empty!"]
        }
    }
})

const Address = mongoose.model("address", AddressSchema)
module.exports = Address