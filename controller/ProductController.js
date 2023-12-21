const slugify = require('slugify')
const Product = require('../model/Product')
const cloudinary = require('cloudinary')
const tesseract = require('tesseract.js')
const Order = require('../model/Order')
require('dotenv').config()

class ProductController {
    //[GET]/products/:pid
    async getProduct(req, res) {
        try {
            const _id = req.params.pid
            const product = await Product.findById({ _id })
                .populate({
                    path: 'ratings',
                    populate: { path: 'postedBy', select: 'firstname lastname avatar' }
                })


            return res.status(200).json({ product })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    // [GET] /
    async getAllProducts(req, res) {
        try {
            const queries = { ...req.query }
            const sortName = req.query.sort
            const type = req.query.type

            let product

            //PAGINATION
            const page = req.query.page
            const limit = 9
            const skip = page * limit - limit

            // Trừ 2 query page và sort
            const excludedFields = ['page', 'sort']
            excludedFields.forEach((el) => delete queries[el])
            let queryString = JSON.stringify(queries)
            queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
            const queryObject = JSON.parse(queryString)



            if (!queryObject.length && !sortName && !type && !page) {
                product = await Product.find()
                    .populate({ path: 'category', select: 'title' })

                return res.status(200).json({
                    record: product.length,
                    mess: product
                })
            }

            // filter price
            if (queryObject) {
                product = await Product.find(queryObject)
                    .populate({ path: 'category', select: 'title' })
                    .skip(skip)
                    .limit(limit)
            }

            // sort 
            if (sortName && type) {
                product = await Product
                    .find({})
                    .sort({ [sortName]: type })
                    .skip(skip).limit(limit)
                    .populate({ path: 'category', select: 'title' })
            }
            const productLength = await Product.find({})


            res.status(200).json({
                record: product.length,
                pageTotal: Math.ceil(productLength.length / limit),
                page: page,
                mess: product
            })

        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    //[POST] /create-product
    async createProduct(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                if (req.file?.path) {
                    cloudinary.uploader.destroy(req.file.filename, (err, result) => {
                        if (err) {
                            console.log({ err: err })
                        }
                    })
                }
                return res.status(400).json({ mess: 'Missing Inputs' })
            }

            if (req.body.title) {
                req.body.slug = slugify(req.body.title)
            }

            const product = await new Product({ ...req.body, image: req.file?.path })
            await product.save()
            res.status(200).json(product)
        } catch (error) {
            if (req.file?.path) {
                cloudinary.uploader.destroy(req.file.filename, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
            }
            return res.status(500).json({ mess: error })
        }
    }

    // [PUT] /update-product/:id
    async updateProduct(req, res) {
        try {
            if (Object.keys(req.body).length === 0 && !req.file) {
                cloudinary.uploader.destroy(req.file.filename, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })

                return res.status(400).json({ mess: 'Missing Inputs' })
            }

            if (req.body.title) {
                req.body.slug = slugify(req.body.title)
            }

            if (req.file != undefined) {
                if (req.file.path) {
                    req.body.image = req.file.path
                }
            }
            await Product.findByIdAndUpdate({ _id: req.params.id }, req.body)
            res.status(200).json({ mess: 'update successfully', Product })
        } catch (error) {
            if (req.file?.path) {
                cloudinary.uploader.destroy(req.file.filename, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
            }
            return res.status(500).json({ mess: error })
        }
    }

    // [DELETE] /delete-product/:id
    async deleteProduct(req, res) {
        try {
            await Product.deleteOne({ _id: req.params.id })
            res.status(200).json({ mess: 'delete successfully' })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    //[POST]/products/rating-product
    async rateProduct(req, res) {
        try {
            const { postId, star, comment } = req.body
            const { _id } = req.user


            // Check người dùng mua mới được rate
            const orders = await Order.find({})

            const userPurchased = orders?.find(e => e?.products.find(e => e?.product?._id.toString() === postId))
            const userOrdered = userPurchased?.orderBy?._id.toString() === _id && userPurchased?.status === 'Succeeded'



            const product = await Product.findById({ _id: postId })

            const readyRating = product?.ratings?.find((e) => e?.postedBy.toString() === _id)

            if (!userOrdered || !userPurchased) {
                return res.status(400).json({
                    mess: 'You are not allowed to rate',
                })
            }


            if (readyRating) {
                // Update star and comment
                await Product.updateOne(
                    { ratings: { $elemMatch: readyRating } },
                    { $set: { 'ratings.$.star': star, 'ratings.$.comment': comment } }
                    // { $set: { ratings: { postedBy: _id, star, comment } }}
                )
            } else {
                // add new star and comment
                await Product.findByIdAndUpdate(
                    postId,
                    { $push: { ratings: { postedBy: _id, star, comment } } }
                )
            }

            // sum star
            const postCurrent = await Product.findById({ _id: postId })
            const len = postCurrent.ratings.length
            const count = postCurrent.ratings.reduce((sum, e) => sum + e.star, 0)
            postCurrent.totalRatings = (count / len).toFixed(1)

            await postCurrent.save()

            res.status(200).json({
                mess: 'rating successfully !!',
                product
            })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    //[POST]/products/find
    async findProduct(req, res) {
        try {
            const { productName } = req.body
            const product = await Product.find({ title: { $regex: productName, $options: 'i' } })
                .populate({ path: 'category', select: 'title' })
            // option 'i' => không phân biệt hoa thường

            if (Object.keys(product).length === 0) {
                return res.status(200).json({ mess: 'Không tìm thấy sản phẩm' })
            }

            return res.status(200).json({ product })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    //[POST]/products/find-image
    async findProductByImage(req, res) {
        try {
            const {
                data: { text }
            } = await tesseract.recognize(req.file.path, 'eng')

            const clearText = text.replace(/[^\w\s]/gi, '')
            let productName = ''
            for (let i = 0; i < 10; i++) {
                if (clearText[i] !== '\n' && clearText[i] !== ' ') {
                    productName += clearText[i]
                } else {
                    break
                }
            }

            const product = await Product.find({ title: { $regex: productName.trim(), $options: 'i' } })
                .populate({ path: 'category', select: 'title' })

            if (Object.keys(product).length === 0) {
                return res.status(200).json({ mess: 'Không tìm thấy sản phẩm' })
            }

            res.status(200).json({ product })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }
}

module.exports = new ProductController()
