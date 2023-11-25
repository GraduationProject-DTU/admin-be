const CouponController = require('../controller/CouponController')
const { verifyToken, isAdmin } = require('../middleware/verifyToken')
const router = require('express').Router()

router.get('/', CouponController.getCoupons)
router.post('/create-coupon', [verifyToken, isAdmin], CouponController.createCoupon)
router.post('/apply-coupon', verifyToken, CouponController.applyCoupon)
router.put('/update-coupon/:id', [verifyToken, isAdmin], CouponController.updateCoupon)
router.delete('/delete-coupon/:id', [verifyToken, isAdmin], CouponController.deleteCoupon)

module.exports = router