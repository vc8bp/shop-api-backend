const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const { required } = require("nodemon/lib/config");
const connectToMongo = require("./db");
var cors = require('cors');
const app = express();
connectToMongo();
const appPort = process.env.PORT || 5000;


const server = app.listen(appPort, () => {
    console.log(`backend server is up on ${appPort}`)
})

//unexpected error handling
process.on("uncaughtException", (err, promis) => {
  console.log(`Logged Error from index js: ${err}`);
  server.close(() => process.exit(1));
})


//with use of this our appliction will be abel to accept json inputs
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

//api routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/products", require("./routes/product"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/order"));
app.use("/api/checkout", require("./routes/stripe"));




  


