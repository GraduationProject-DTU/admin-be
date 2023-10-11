const Brand = require('../model/Brand')

class BlogCategoryController {
    //[GET] /
    async getBrands(req, res) {
        try {
            const brand = await Brand.find()
            res.status(200).json({ brand })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[GET]/brand/id
    async getBrandById(req, res) {
        try {
            const _id = req.params.id
            const brand = await Brand.findById({ _id })
            return res.status(200).json({ brand })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[POST] /brand/create-brand
    async createBrand(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            const brand = await new Brand(req.body)
            await brand.save()
            res.status(200).json({ brand })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[PUT]/brands/update-brand/:id
    async updateBrand(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            await Brand.findByIdAndUpdate({ _id: req.params.id }, req.body)

            res.status(200).json({ mess: 'Update successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[DELETE] /brands/delete-brand/:id
    async deleteBrand(req, res) {
        try {
            await Brand.findByIdAndDelete(req.params.id)
            res.status(200).json({ mess: 'Delete successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }
}

module.exports = new BlogCategoryController()
