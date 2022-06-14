const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URL;

const connectToMongo = () => {
    mongoose
    .connect(mongoURI, {
        //useUnifiedTopology: true,
        //useNewUrlParser: true,
        autoIndex: true, //make this also true
    })
    .then(() => {
      console.log("successfully db connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectToMongo;
