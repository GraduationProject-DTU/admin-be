const mongoose = require('mongoose')

// Declare the Schema of the Mongo model
var Order = new mongoose.Schema({
    status: {
        type: String,
        default: 'Processing',
        enum: ['Cancelled ', 'Processing', 'Succeeded']
    },

    total: {
        type: Number,
        default: 0
    },

    products: [{
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }],

    orderBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Order', Order);