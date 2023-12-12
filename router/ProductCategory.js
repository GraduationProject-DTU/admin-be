const ProductCategoryController = require('../controller/ProductCategoryController')
const { verifyToken, isAdmin } = require('../middleware/verifyToken')
const router = require('express').Router()

router.get('/', ProductCategoryController.getCategoryProducts)
router.get('/:pid', ProductCategoryController.getCategoryProductById)
router.post('/statistic', ProductCategoryController.statisticCategory)
router.post('/create-category', [verifyToken], ProductCategoryController.createCategoryProduct)
router.put('/update-category/:id', [verifyToken, isAdmin], ProductCategoryController.updateCategoryProduct)
router.delete('/delete-category/:id', [verifyToken, isAdmin], ProductCategoryController.deleteCategoryProduct)

module.exports = router