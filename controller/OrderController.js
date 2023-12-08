const User = require("../model/User")
const Order = require("../model/Order")
const Coupon = require("../model/Coupon")
const Product = require("../model/Product")


class OrderController {

    async getOrders(req, res) {
        try {
            const order = await Order.find({})
                .populate({
                    path: 'products',
                    populate: {
                        path: 'product', select: 'title price'
                    }
                })
                .populate({ path: 'orderBy', select: 'firstname lastname email phone adress' })
            return res.status(200).json({ order })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    // [POST]/order/placeOrders
    // async placeOrders(req, res) {
    //     try {
    //         const { pid, total } = req.body
    //         const { _id } = req.user

    //         const product = await Product.findById({ _id: pid })

    //         const order = new Order({ products: product._id, orderBy: _id })
    //         await order.save()

    //         return res.status(200).json({ mess: 'Create successfully' })
    //     } catch (error) {
    //         return res.status(500).json({ mess: error })
    //     }
    // }

    async placeOrders(req, res) {
        try {
            const orders = req.body
            const { _id } = req.user
            let productContain = []
            let price = 0

            const orderPromises = orders.map(async (order) => {
                const { pid, quatity } = order

                const product = await Product.findById({ _id: pid })
                productContain.push({ product: pid, quatity })
                price = price + product.price

            });


            await Promise.all(orderPromises)
            console.log(productContain);

            const newOrder = new Order({ products: productContain, orderBy: _id, total: price })
            await newOrder.save()


            return res.status(200).json({ mess: 'Create successfully' })
        } catch (error) {
            return res.status(500).json({ mess: error });
        }
    }

    // Đơn hàng và tổng tiền
    //[POST] /
    async createOrder(req, res) {
        try {
            const { _id } = req.user
            const { coupon } = req.body

            const user = await User.findById({ _id }).populate('cart.product', 'title price')
            let total = user?.cart?.reduce((sum, e) => sum + e?.product.price * e.quatity, 0)
            let titles = []

            //check user order hay chưa
            const getOrders = await Order.find({}).select('orderBy')
            const checkUserOrder = getOrders?.find(e => e.orderBy.toString() === _id)
            if (checkUserOrder) {
                return res.status(403).json({ mess: 'You have ordered this item, please check again in the order' })
            }

            user.cart.forEach(e => {
                titles.push(e.product.title)
            })

            if (coupon) {
                const selectCoupon = await Coupon.findById(coupon)
                total = Math.round(total * ((1 - Number(selectCoupon?.disCount) / 100) / 1000) * 1000) || total
            }


            const order = await new Order({ products: titles, orderBy: _id, total })
            await order.save()

            return res.status(200).json({ mess: 'Create successfully' })

        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }


    //[PUT] /update-status
    async updateStatus(req, res) {
        try {
            const { oid } = req.params
            const { status } = req.body

            if (!status) {
                return res.status(400).json({ mess: 'Missing Inputs' })
            }

            await Order.findByIdAndUpdate({ _id: oid }, { $set: { status } })
            return res.status(200).json({ mess: 'Update successfully' })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    //[DELETE] 
    async deleteOrder(req, res) {
        try {
            const { oid } = req.params

            await Order.findByIdAndDelete({ _id: oid })
            return res.status(200).json({ mess: 'Delete Successfully' })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }
}

module.exports = new OrderController

