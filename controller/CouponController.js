const Coupon = require('../model/Coupon')
const Product = require('../model/Product')

class CouponController {

    //[GET] /
    async getCoupons(req, res) {
        try {
            const coupon = await Coupon.find()
            res.status(200).json({ coupon })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //post
    async applyCoupon(req, res) {
        try {
            const { coupon, pid } = req.body
            const coupons = await Coupon.find()
            if (coupons && coupon) {
                var string = coupon.split(' ')[1]
                var number = parseInt(string)
                let couponPrice = number / 100
                return res.status(200).json({ couponPrice })
            } else {
                return res.status(200).json({ mess: 'Mã giảm giá không hợp lệ' })
            }
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[POST] /coupons/create-coupon
    async createCoupon(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            req.body.expiresIn = Date.now() + Number(req.body.expiresIn) * 24 * 60 * 60 * 1000
            const coupon = await new Coupon(req.body)
            await coupon.save()
            res.status(200).json({ mess: 'create successfully', coupon })

        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[PUT]/coupons/update-coupon/:id
    async updateCoupon(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            if (req.body.expiresIn) {
                req.body.expiresIn = Date.now() + Number(req.body.expiresIn) * 24 * 60 * 60 * 1000
            }

            await Coupon.findByIdAndUpdate({ _id: req.params.id }, req.body)

            res.status(200).json({ mess: 'Update successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[DELETE] /coupons/update-coupon/:id
    async deleteCoupon(req, res) {
        try {
            await Coupon.findByIdAndDelete(req.params.id)
            res.status(200).json({ mess: 'Delete successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }
}

module.exports = new CouponController