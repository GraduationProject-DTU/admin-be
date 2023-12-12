const Coupon = require('../model/Coupon')
const cron = require('node-cron');


const cronJobDeleteCoupon = () => {
    cron.schedule('*/10 * * * *', async () => {
        try {
            // Lấy danh sách các mã coupon hết hạn
            const expiredCoupons = await Coupon.find({ expiresIn: { $lt: new Date() } })
            if (expiredCoupons.length !== 0) {
                await Coupon.findByIdAndDelete({ _id: expiredCoupons.map(coupon => coupon._id) })
                // return res.status(200).json({ mess: 'CronJob Delete successfully' })
                console.log('CronJob Delete successfully')
            } else {
                console.log('Not expiresIn ')
                // return res.status(200).json({ mess: 'Not expiresIn' })
            }

        } catch (error) {
            console.log('Error CronJob ', error)
        }
    });

}

module.exports = cronJobDeleteCoupon