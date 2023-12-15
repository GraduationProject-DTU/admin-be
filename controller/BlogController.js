const Blog = require('../model/Blog')
const User = require('../model/User')
const cloudinary = require('cloudinary')
require('dotenv').config()

class BlogController {
    //skip , limit
    //[GET] /blogs/
    async getBlogs(req, res) {
        try {
            //PAGINATION
            const page = req.query.page
            const limit = 6
            const skip = page * limit - limit
            let blogs

            if (page) {
                const totalPage = await Blog.find()
                blogs = await Blog.find().skip(skip).limit(limit)
                    .populate({ path: 'category', select: 'title' })
                    .populate({ path: 'author', select: 'firstname lastname avatar' })


                return res.status(200).json({
                    pageTotal: Math.ceil(totalPage.length / limit),
                    recordTotal: blogs.length,
                    blogs
                })
            } else {
                blogs = await Blog.find()
                    .populate({ path: 'category', select: 'title' })
                    .populate({ path: 'author', select: 'firstname lastname avatar' })


                return res.status(200).json({
                    recordTotal: blogs.length,
                    blogs
                })
            }
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    async getBlog(req, res) {
        try {
            const blogId = req.params.id

            const blog = await Blog.findByIdAndUpdate({ _id: blogId }, { $inc: { numberViews: 1 } })
                .populate({ path: 'likes', select: 'lastname' })
                .populate({ path: 'disLikes', select: 'lastname' })
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'userId',
                        select: 'firstname lastname avatar'
                    }
                })
                .populate({ path: 'author', select: 'firstname lastname avatar' })



            res.status(200).json({ blog })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[POST]/blogs/find
    async findBlog(req, res) {
        try {
            const { blogName } = req.body

            //pagination
            const page = req.query.page
            const limit = 6
            const skip = page * limit - limit

            const blog = await Blog.find({ title: { $regex: blogName, $options: 'i' } })
                .limit(limit)
                .skip(skip)
            // option 'i' => không phân biệt hoa thường

            if (Object.keys(blog).length === 0) {
                return res.status(200).json({ mess: 'Không tìm thấy bài viết' })
            }

            return res.status(200).json({
                recordTotal: blog.length,
                blog
            })
        } catch (error) {
            return res.status(500).json({ mess: error })
        }
    }

    //[GET] /blogs/get-view/:id
    async getViewBlog(req, res) {
        // inc view
        try {
            //Gọi API => numberView + 1
            const blog = await Blog.findByIdAndUpdate({ _id: req.params.id }, { $inc: { numberViews: 1 } })
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'userId',
                        select: 'firstname lastname avatar'
                    }
                })
                .populate({ path: 'category', select: 'title' })
                .populate({ path: 'author', select: 'firstname lastname avatar email' })


            res.status(200).json({ blog })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[POST] /blogs/create-blog
    async createBlog(req, res) {
        try {
            req.body.images = []
            const { _id } = req.user
            if (Object.keys(req.body).length === 0) {
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        cloudinary.uploader.destroy(req.files[i].filename, (err, result) => {
                            if (err) {
                                console.log({ err: err })
                            }
                        })
                    }
                }
                return res.status(400).json('Missing inputs')
            }

            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    req.body.images.push(req.files[i].path)
                }
            }

            const blog = new Blog({ ...req.body, author: _id })
            await blog.save()

            return res.status(200).json({ mess: 'Create successfully', blog })
        } catch (error) {
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    cloudinary.uploader.destroy(req.files[i].filename, (err, result) => {
                        if (err) {
                            console.log({ err: err })
                        }
                    })
                }
            }
            return res.status(500).json({ mess: error })
        }
    }

    // [POST]/blogs/upload-cke
    async uploadCke(req, res) {
        try {
            if (req.file) {
                return res.status(200).json({ path: req.file?.path })
            } else {
                cloudinary.uploader.destroy(req.files.filename, (err, result) => {
                    if (err) {
                        console.log({ err: err })
                    }
                })
                return res.status(500).json({ mess: 'missing file image' })
            }
        } catch (error) {
            cloudinary.uploader.destroy(req.file.filename, (err, result) => {
                if (err) {
                    console.log({ err: err })
                }
            })
            return res.status(500).json({ mess: error })
        }
    }

    //[PUT]/blogs//update-blog/:id
    async updateBlog(req, res) {
        try {
            req.body.images = []

            if (Object.keys(req.body).length === 0 && !req.file) {
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        console.log(req.files[i].filename)
                        cloudinary.uploader.destroy(req.files[i].filename, (err, result) => {
                            if (err) {
                                console.log({ err: err })
                            }
                        })
                    }
                }

                return res.status(400).json('Missing inputs')
            }

            // if (req.files) {
            //     req.body.image = req.file.path
            // }

            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    req.body.images.push(req.files[i].path)
                }
            }

            await Blog.findByIdAndUpdate({ _id: req.params.id }, req.body)

            res.status(200).json({ mess: 'Update successfully' })
        } catch (error) {
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    console.log(req.files[i].filename)
                    cloudinary.uploader.destroy(req.files[i].filename, (err, result) => {
                        if (err) {
                            console.log({ err: err })
                        }
                    })
                }
            }
            res.status(500).json({ mess: error })
        }
    }

    //[DELETE] /blogs/delete-blog/:id
    async deleteBlog(req, res) {
        try {
            await Blog.findByIdAndDelete(req.params.id)

            res.status(200).json({ mess: 'Delete successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[POST] /blogs/like-blog
    async likeBlog(req, res) {
        try {
            const { blogId } = req.body
            const { _id } = req.user
            console.log(_id)
            const blog = await Blog.findById({ _id: blogId })

            //check user đã like hay chưa
            const userLiked = blog?.likes.find((e) => e.toString() === _id)
            //check user disliked hay chưa
            const userDisliked = blog?.disLikes.find((e) => e.toString() === _id)

            if (userDisliked) {
                // Nếu có dislike thì hủy dislike => like
                await Blog.findByIdAndUpdate(blogId, { $pull: { disLikes: _id } })
            }

            if (userLiked) {
                // Hủy like
                await Blog.findByIdAndUpdate(blogId, { $pull: { likes: _id } })
                // xóa history like của user
                await User.findByIdAndUpdate({ _id }, { $pull: { historyLiked: { blogId } } })
            } else {
                // thêm like
                await Blog.findByIdAndUpdate(blogId, { $push: { likes: _id } })
                // thêm vào history like của user
                await User.findByIdAndUpdate({ _id }, { $push: { historyLiked: { blogId } } })
            }

            res.status(200).json({ mess: 'Like successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    //[POST] /blogs/dislike-blog
    async disLikeBlog(req, res) {
        try {
            const { blogId } = req.body
            const { _id } = req.user
            const blog = await Blog.findById({ _id: blogId })

            //check user đã like hay chưa
            const userLiked = blog?.likes.find((e) => e.toString() === _id)
            //check user disliked hay chưa
            const userDisliked = blog?.disLikes.find((e) => e.toString() === _id)

            if (userLiked) {
                // hủy like rồi mới dislike
                await Blog.findByIdAndUpdate(blogId, { $pull: { likes: _id } })
            }

            if (userDisliked) {
                // Hủy dislike
                await Blog.findByIdAndUpdate(blogId, { $pull: { disLikes: _id } })
            } else {
                // thêm dislike
                await Blog.findByIdAndUpdate(blogId, { $push: { disLikes: _id } })
            }

            res.status(200).json({ mess: 'Dislike successfully' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    // [POST]/blogs/comment-blog
    async commentBlog(req, res) {
        try {
            const { bid, comment } = req.body
            const { _id } = req.user

            let date = new Date()
            let day = date.getDate()
            let month = date.getMonth() + 1
            let year = date.getFullYear()
            let formattedDate = day + '/' + month + '/' + year

            const blog = await Blog.findByIdAndUpdate({ _id: bid }, { $push: { comments: { userId: _id, content: comment, date: formattedDate } } })
                .populate({
                    path: 'comments',
                    populate: {
                        path: 'userId',
                        select: 'firstname lastname'
                    }
                })
                .select('comments')

            console.log(blog)
            res.status(200).json({ mess: 'comment successfully!!', data: blog })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    // [DELETE] /comment-blog
    async deleteCommentBlog(req, res) {
        const { commentId, blogId } = req.body
        try {
            const blog = await Blog.findById({ _id: blogId })
            const updatedArr = blog?.comments.filter((obj) => obj._id.toString() !== commentId)

            await Blog.findByIdAndUpdate({ _id: blogId }, { $set: { comments: updatedArr } })

            return res.status(200).json({ mess: 'Delete Comment Successfully!!' })
        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }

    // [DELETE] /comment-blog
    async deleteCommentBlogByUser(req, res) {
        try {
            const { _id } = req.user
            const { bid, commentId } = req.params

            const blog = await Blog.findById({ _id: bid })
            const checkRole = blog?.comments.find(e => e._id.toString() === commentId && e.userId.toString() === _id)

            if (checkRole) {
                const updatedArr = blog?.comments.filter((e) => {
                    return e._id.toString() !== commentId

                })
                await Blog.findByIdAndUpdate({ _id: bid }, { $set: { comments: updatedArr } })
                return res.status(200).json({ mess: 'Delete Comment Successfully!!' })
            } else {
                return res.status(400).json({ mess: 'Bạn không có quyền xóa !!' })
            }

        } catch (error) {
            res.status(500).json({ mess: error })
        }
    }
}

module.exports = new BlogController()
