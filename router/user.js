const UserController = require('../controller/UserController')
const { verifyToken, isAdmin } = require('../middleware/verifyToken')
const router = require('express').Router()

router.get('/', [verifyToken, isAdmin], UserController.getAllUsers)
router.get('/detail-user/:id', verifyToken, UserController.getUserById)
router.get('/history-like', [verifyToken], UserController.getHistoryLikeOfUser)
router.get('/wish-list', verifyToken, UserController.getWishList)
router.post('/contact', UserController.contact)
router.post('/wish-list', verifyToken, UserController.addWishList)
router.delete('/wish-list/:pid', verifyToken, UserController.deleteWishList)
router.put('/update-user/', verifyToken, UserController.updateUser)
router.put('/update-user/:id', [verifyToken, isAdmin], UserController.updateUserByAdmin)
// router.post('/add-cart/:id', verifyToken, UserController.addCart)
router.put('/cart', verifyToken, UserController.updateCart)
router.put('/delete-cart', verifyToken, UserController.deleteCart)
router.delete('/delete-user/:id', [verifyToken, isAdmin], UserController.deleteUserByAdmin)

module.exports = router
