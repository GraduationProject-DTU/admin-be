const ProductCategory = require('../model/ProductCategory')
const Product = require("../model/Product")
const Order = require("../model/Order")
class ProductCategoryController {

    //[GET] /category-products/
    async getCategoryProducts(req, res) {
        try {
            const category = await ProductCategory.find()
            res.status(200).json({ category })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[GET]/category-products/:pid
    async getCategoryProductById(req, res) {
        try {
            const _id = req.params.pid
            const category = await ProductCategory.findById({ _id })

            return res.status(200).json({ category })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[GET] /statistic
    async statisticCategory(req, res) {
        try {
            const categories = await ProductCategory.find({})
            const orders = await Order.find({}).populate({ path: 'products', populate: { path: 'product', select: 'price sold category title' } })

            let result = []
            for (let cate = 0; cate < categories.length; cate++) {
                for (let i = 0; i < orders.length; i++) {
                    orders[i].products.filter(e => {
                        if (e?.product?.category.toString() === categories[cate]._id.toString()) {
                            result.push({ category: categories[cate]._id, date: orders[i]?.createdAt, sold: e?.product?.sold, price: e?.product?.price })
                        }
                    })
                }
            }


            const report = categories.map(e => {
                return {
                    [e.title]: [result.filter((value,) => {
                        if (value.category === e._id) {
                            return value
                        } else {
                            return undefined
                        }
                    })]
                }
            })

            res.status(200).json({ report })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[POST] /category-products/create-category
    async createCategoryProduct(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            const category = new ProductCategory(req.body)
            await category.save()

            return res.status(200).json({ mess: 'Create successfully', category })

        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    //[PUT]//category-products//update-category/:id
    async updateCategoryProduct(req, res) {
        try {
            const { id } = req.params
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            await ProductCategory.findByIdAndUpdate({ _id: req.params.id }, req.body)

            res.status(200).json({ mess: 'Update successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[DELETE] /category-products//delete-category/:id
    async deleteCategoryProduct(req, res) {
        try {
            await ProductCategory.findByIdAndDelete(req.params.id)

            res.status(200).json({ mess: 'Delete successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }
}

module.exports = new ProductCategoryController