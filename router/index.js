const auth = require('./auth')
const user = require('./user')
const product = require('./product')
const productCategory = require('./productCategory')
const blog = require('./Blog')
const blogCategory = require('./blogCategory')
const brand = require('./brand')
const order = require('./order')
const coupon = require('./coupon')


const route = (app) => {
    app.use('/auth', auth)
    app.use('/users', user)
    app.use('/products', product)
    app.use('/category-products', productCategory)
    app.use('/blogs', blog)
    app.use('/category-blogs', blogCategory)
    app.use('/brands', brand)
    app.use('/orders', order)
    app.use('/coupons', coupon)

}

module.exports = route