const BlogController = require('../controller/BlogController')
const uploadCloudinary = require('../middleware/uploader')
const { verifyToken, isAdmin } = require('../middleware/verifyToken')
const router = require('express').Router()

router.get('/', BlogController.getBlogs)
router.get('/get-view/:id', BlogController.getViewBlog)
router.get('/blog/:id', BlogController.getBlog)
router.post('/create-blog', [verifyToken, uploadCloudinary.array('images')], BlogController.createBlog)
router.put('/update-blog/:id', [verifyToken, isAdmin, uploadCloudinary.array('images')], BlogController.updateBlog)
router.delete('/delete-blog/:id', [verifyToken, isAdmin], BlogController.deleteBlog)
router.post('/like-blog', verifyToken, BlogController.likeBlog)
router.post('/dislike-blog', verifyToken, BlogController.disLikeBlog)
router.post('/comment-blog', verifyToken, BlogController.commentBlog)


module.exports = router