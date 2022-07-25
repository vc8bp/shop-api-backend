const mongoose= require("mongoose")
const { Schema } = mongoose;

const announcmentSchma = new Schema({
    Title: { type:String, required: true, }
},{timestamps: true})

const Announcments = mongoose.model("Announcment", announcmentSchma);
module.exports = Announcments;
