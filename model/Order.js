const mongoose = require('mongoose')

// Declare the Schema of the Mongo model
var Order = new mongoose.Schema({
    products: [],
    status: {
        type: String,
        default: 'Processing',
        enum: ['Cancelled ', 'Processing', 'Succeeded']
    },

    total: {
        type: Number,
        default: 0

    },

    orderBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
});

//Export the model
module.exports = mongoose.model('Order', Order);