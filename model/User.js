const mongoose = require('mongoose')
const crypto = require('crypto')

var User = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true
        },

        avatar: {
            type: String,
            default: 'https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg'
        },

        lastname: {
            type: String,
            required: true
        },

        email: {
            type: String,
            unique: true,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String
        },

        role: {
            type: String,
            default: 'user'

        },

        cart: [
            {
                product: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Product'
                },
                quatity: Number,
                color: String
            }
        ],

        address: {
            type: String,
            default: ''
        },

        historyLiked: [
            {
                blogId: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Blog'
                }
            }
        ],

        wishlist: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'Product'
            }
        ],

        purchased: {
            pid: {
                type: mongoose.Types.ObjectId,
                ref: 'Product'
            }
        },

        refresh_token: {
            type: String
        },

        passwordChangeAt: {
            type: String
        },

        passwordResetToken: {
            type: String
        },

        passwordResetExpires: {
            type: String
        }
    },
    { timestamps: true }
)

User.methods.createPasswordChangeToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000

    return resetToken
}

module.exports = mongoose.model('User', User)
