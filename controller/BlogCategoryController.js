const BlogCategory = require('../model/BlogCategory')

class BlogCategoryController {
    //[GET] /category-bogs
    async getCategoryBlogs(req, res) {
        try {
            const category = await BlogCategory.find()
            res.status(200).json({ category })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[GET]/category-blog/:pid
    async getCategoryBlogById(req, res) {
        try {
            const _id = req.params.pid
            const category = await BlogCategory.findById({ _id })

            return res.status(200).json({ category })
        } catch (error) {
            return res.status(500).json({ error })
        }
    }

    //[POST] /category-bogs/create-category
    async createCategoryBlog(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            const category = await new BlogCategory(req.body)
            await category.save()
            res.status(200).json({ category })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[PUT]/category-bogs/update-category/:id
    async updateCategoryBlog(req, res) {
        try {
            if (Object.keys(req.body).length === 0) {
                return res.status(400).json('Missing inputs')
            }

            await BlogCategory.findByIdAndUpdate({ _id: req.params.id }, req.body)

            res.status(200).json({ mess: 'Update successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[DELETE] /category-bogs/delete-category/:id
    async deleteCategoryBlog(req, res) {
        try {
            await BlogCategory.findByIdAndDelete(req.params.id)
            res.status(200).json({ mess: 'Delete successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }
}

module.exports = new BlogCategoryController()
