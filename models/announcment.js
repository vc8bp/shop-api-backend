const mongoose= require("mongoose")
const { Schema } = mongoose;

const announcmentSchma = new Schema({
    title: { type:String, required: true },
    active: {type: Boolean, default: false}
},{timestamps: true})

const Announcments = mongoose.model("Announcment", announcmentSchma);
module.exports = Announcments;
