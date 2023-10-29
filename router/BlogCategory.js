const BlogCategoryController = require('../controller/BlogCategoryController')
const { verifyToken, isAdmin } = require('../middleware/verifyToken')
const router = require('express').Router()

router.get('/', BlogCategoryController.getCategoryBlogs)
router.get('/:pid', BlogCategoryController.getCategoryBlogById)
router.post('/create-category', [verifyToken, isAdmin], BlogCategoryController.createCategoryBlog)
router.put('/update-category/:id', [verifyToken, isAdmin], BlogCategoryController.updateCategoryBlog)
router.delete('/delete-category/:id', [verifyToken, isAdmin], BlogCategoryController.deleteCategoryBlog)

module.exports = router
