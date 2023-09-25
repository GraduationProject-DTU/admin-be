const mongoose = require('mongoose')

var Brand = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true })

//Export the model
module.exports = mongoose.model('Brand', Brand);
