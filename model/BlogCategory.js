const mongoose = require('mongoose')

var BlogCategory = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true })

//Export the model
module.exports = mongoose.model('BlogCategory', BlogCategory);
