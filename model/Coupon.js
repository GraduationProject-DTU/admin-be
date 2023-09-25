const mongoose = require('mongoose')

var Coupon = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },

    disCount: {
        type: Number,
        require: true
    },

    expiresIn: {
        type: Date
    }

}, { timestamps: true })

//Export the model
module.exports = mongoose.model('Coupon', Coupon);