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
        type: String,
        required: true,
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
            content: String
        }
    ],

    image: {
        type: String,
        default: 'https://scontent.fhan14-3.fna.fbcdn.net/v/t39.30808-6/354608660_5965369353573224_4477435290304714523_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=8bfeb9&_nc_ohc=jK_2Ae9WxwcAX9Mcldj&_nc_ht=scontent.fhan14-3.fna&oh=00_AfCd5tCuZ3_-pAz0kToS4hwSLM5UNk3rTB6L2H7D0aq2UA&oe=6497F4C5'
    },

    author: {
        type: String,
        default: 'admin'
    }

}, {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true }
})

//Export the model
module.exports = mongoose.model('Blog', Blog);