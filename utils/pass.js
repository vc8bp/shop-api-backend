require("dotenv").config()
const cryptoJS = require("crypto-js")

const decreptPass = (pass) => cryptoJS.AES.decrypt(pass, process.env.CRYPTOJS_SECRET_KEY).toString(cryptoJS.enc.Utf8)

const encreptPass = (pass) => cryptoJS.AES.encrypt(pass, process.env.CRYPTOJS_SECRET_KEY).toString()


module.exports =  { decreptPass, encreptPass }