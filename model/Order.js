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

    payments: {
        type: String,
        default: 'Thanh Toán Khi Nhận Hàng',
        enum: ['Thanh Toán Khi Nhận Hàng', 'Chuyển khoản',]
    },

    codeBill: {
        type: String,
    },


    products: [{
        product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
        },
        quatity: String,
        address: String
    }],


    orderBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Order', Order);