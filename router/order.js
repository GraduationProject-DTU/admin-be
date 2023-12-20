const OrderController = require('../controller/OrderController')
const { verifyToken, isAdmin } = require('../middleware/verifyToken')
const router = require('express').Router()

router.get('/', verifyToken, OrderController.getOrders)
router.post('/', verifyToken, OrderController.createOrder)
router.get('/detail-order/:id', OrderController.getOrderById)
router.post('/placeOrders', verifyToken, OrderController.placeOrders)
router.delete('/:oid', [verifyToken], OrderController.deleteOrder)
router.put('/update-status/:oid', [verifyToken, isAdmin], OrderController.updateStatus)

module.exports = router
