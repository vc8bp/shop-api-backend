const mongoose= require("mongoose")
const { Schema } = mongoose;

const announcmentSchma = new Schema({
    Title: { type:String, required: true, },
    active: {type: Boolean, default: false}
},{timestamps: true})

const Announcments = mongoose.model("Announcment", announcmentSchma);
module.exports = Announcments;
