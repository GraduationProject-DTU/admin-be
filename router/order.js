const OrderController = require('../controller/OrderController')
const { verifyToken, isAdmin } = require('../middleware/verifyToken')
const router = require('express').Router()

router.get('/', verifyToken, OrderController.getOrders)
router.post('/', verifyToken, OrderController.createOrder)
router.put('/update-status/:oid', [verifyToken, isAdmin], OrderController.updateStatus)



module.exports = router