const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var Blog = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    category: {
        type: mongoose.Types.ObjectId,
        ref: 'BlogCategory',
        require: true
    },

    numberViews: {
        type: Number,
        default: 0,
    },

    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],

    disLikes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],

    comments: [
        {
            userId: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
            content: String,
            date: String
        }
    ],

    images: {
        type: Array,
        default: []
        // default: 'https://th.bing.com/th/id/R.5f50d860e5f82462d3655d238dec4d18?rik=AUIfoBxInwYlsw&pid=ImgRaw&r=0'
    },

    author: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }

}, {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true }
})

//Export the model
module.exports = mongoose.model('Blog', Blog);