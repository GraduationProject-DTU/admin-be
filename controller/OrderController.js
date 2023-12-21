const User = require('../model/User')
const Order = require('../model/Order')
const Coupon = require('../model/Coupon')
const Product = require('../model/Product')

class OrderController {
    async getOrders(req, res) {
        try {
            const order = await Order.find({})
                .populate({
                    path: 'products',
                    populate: {
                        path: 'product',
                        select: 'title price image'
                    }
                })
                .populate({ path: 'orderBy', select: 'firstname lastname email phone adress avatar' })
            return res.status(200).json({ order })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    //[GET]/brand/id
    async getOrderById(req, res) {
        try {
            const _id = req.params.id
            const order = await Order.findById({ _id })
                .populate({
                    path: 'products',
                    populate: {
                        path: 'product',
                        select: 'title price image'
                    }
                })
                .populate({ path: 'orderBy', select: 'firstname lastname email phone address' })
            return res.status(200).json({ order })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    async placeOrders(req, res) {
        try {
            const orders = req.body
            // const payment = req.body.payment
            const { _id } = req.user
            let productContain = []
            let price = 0

            // tao code bill
            let characters = '0123456789'
            let code = 'INV-'

            for (let i = 0; i < 8; i++) {
                var randomIndex = Math.floor(Math.random() * characters.length)
                code += characters.charAt(randomIndex)
            }

            const orderPromises = orders.map(async (order) => {
                const { pid, quatity } = order


                //update lại sold
                const product = await Product.findByIdAndUpdate(
                    { _id: pid },
                    { $inc: { sold: quatity, quantity: -quatity } },
                )

                productContain.push({ product: pid, quatity })
                price = price + product.price * quatity
            })

            await Promise.all(orderPromises)

            if (orders[0].address) {
                await User.findByIdAndUpdate(
                    { _id },
                    {
                        $set: { address: orders[0].address }
                    }
                )
            }

            if (orders[0].coupon) {
                price = price - (price * orders[0].coupon)
            }

            const newOrder = new Order({ products: productContain, codeBill: code, payments: orders[0].payment, orderBy: _id, total: price })
            await newOrder.save()

            return res.status(200).json({ mess: 'Create successfully' })
        } catch (error) {
            return res.status(500).json({ mess: error })
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
            const checkUserOrder = getOrders?.find((e) => e.orderBy.toString() === _id)
            if (checkUserOrder) {
                return res.status(403).json({ mess: 'You have ordered this item, please check again in the order' })
            }

            user.cart.forEach((e) => {
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

            const products = await Product.find({})
            const order = await Order.findById({ _id: oid })

            // const demo = 

            await Promise.all(order.products.map(async (orderItem) => {
                const foundProduct = products.find(prod => prod?._id.toString() === orderItem?.product.toString());

                if (foundProduct) {

                    await Product.findByIdAndUpdate({ _id: foundProduct?._id }, { $inc: { sold: -orderItem.quatity, quantity: orderItem.quatity } })
                }
            }));



            await Order.findByIdAndDelete({ _id: oid })
            return res.status(200).json({ mess: 'Delete Successfully' })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }
}

module.exports = new OrderController()
