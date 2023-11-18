const mongoose = require('mongoose')

var Product = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'ProductCategory'
    },
    quantity: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        require: true
    },
    file_name: {
        type: String
    },
    ratings: [
        {
            postedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
            star: { type: Number },
            comment: { type: String }
        }
    ],
    totalRatings: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Product', Product);