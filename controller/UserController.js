const User = require('../model/User')
class UserController {

    // [Get] / users/ 
    async getAllUsers(req, res) {
        try {
            const page = req.query.page
            const users = await User.find({}).select('-password -role')

            return res.status(200).json({ users })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[GET]/users/:uid
    async getUser(req, res) {
        try {
            const _id = req.params.uid

            const user = await User.findById({ _id })

            return res.status(200).json({ user })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[GET]/users/history-like
    async getHistoryLikeOfUser(req, res) {
        try {
            const { _id } = req.user
            const user = await User.findById({ _id })
                .select('historyLiked')
                .populate({ path: 'historyLiked.blogId', select: 'title' })
            return res.status(200).json({ mess: user })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[GET]/users/wishlist
    async getWishList(req, res) {
        try {
            const { _id } = req.user
            const user = await User.findById({ _id })
                .select('wishlist')
                .populate({ path: 'wishlist', select: 'title price description brand' })
            return res.status(200).json({ mess: user })

        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[POST]/users/wishlist
    async addWishList(req, res) {
        try {
            const { pid } = req.body
            const { _id } = req.user
            //check user đã yêu thích sản phẩm hay chưa
            const user = await User.findById({ _id })
            const wishList = user?.wishlist.find(e => e.toString() === pid)

            if (wishList) {
                return res.status(403).json({ mess: 'This Product Has Been Favourite' })
            } else {
                await User.findByIdAndUpdate({ _id }, { $push: { wishlist: pid } })
            }

            return res.status(200).json({ mess: 'Add Wish Product Successfully !' })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[PUT] /update-user
    async updateUser(req, res) {
        try {
            const { _id } = req.user

            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            await User.findByIdAndUpdate(_id, req.body)
            res.status(200).json({ mess: 'update user successfully !' })

        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[PUT] /update-user/:id
    async updateUserByAdmin(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            await User.findByIdAndUpdate(req.params.id, req.body)
            res.status(200).json({ mess: 'update user successfully !' })

        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    // [DELETE]/delete/:id
    async deleteUserByAdmin(req, res) {
        try {
            await User.deleteOne({ _id: req.params.id })
            res.status(200).json({ mess: 'Delete user successfully !' })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    // [PUT] /users/cart
    async updateCart(req, res) {
        try {
            const { _id } = req.user
            const { pid, quatity, color } = req.body

            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            const user = await User.findById({ _id }).select('cart')
            // check xem có sản phẩm trong giỏ hàng chưa
            const readyProduct = user?.cart?.find(e => e.product.toString() === pid)

            if (readyProduct) {
                return res.status(200).json({ mess: 'This product is already in the cart!' })
            } else {
                await User.findByIdAndUpdate(
                    _id,
                    { $push: { cart: { product: pid, quatity, color } } }
                )
                return res.status(200).json({ mess: ' add to cart successfully !' })
            }

        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[PUT] /users/delete-cart
    async deleteCart(req, res) {
        try {
            const { _id } = req.user
            const { pid } = req.body

            //Tiến hành remove product
            await User.findByIdAndUpdate(_id, { $pull: { cart: { product: pid } } })
            res.status(200).json({ mess: 'remove product successfully!' })


        } catch (error) {
            return res.status(500).json({ error })
        }
    }



}

module.exports = new UserController