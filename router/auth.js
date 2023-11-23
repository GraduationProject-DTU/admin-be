const AuthController = require('../controller/AuthController')

const router = require('express').Router()


router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/refresh-token', AuthController.requestRefreshToken)
router.post('/logout', AuthController.logout)
router.post('/forgot-password', AuthController.forgotPassword)
router.put('/reset-password', AuthController.resetPassword)

module.exports = router