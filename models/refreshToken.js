const mongoose = require('mongoose')

const refreshTokenSchema = mongoose.Schema({
    
    token: {type: String, required: true},
    userID: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}

},{timestamps: true})

module.exports = new mongoose.model('refreshTken', refreshTokenSchema, "refToken")