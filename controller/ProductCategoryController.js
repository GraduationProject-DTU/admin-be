const ProductCategory = require('../model/ProductCategory')

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

    //[DELETE] / /category-products//delete-category/:id
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