const BrandController = require('../controller/BrandController')
const { verifyToken, isAdmin } = require('../middleware/verifyToken')
const router = require('express').Router()

router.get('/', BrandController.getBrands)
router.get('/detail-brand/:id', BrandController.getBrandById)
router.post('/create-brand', [verifyToken, isAdmin], BrandController.createBrand)
router.put('/update-brand/:id', [verifyToken, isAdmin], BrandController.updateBrand)
router.delete('/delete-brand/:id', [verifyToken, isAdmin], BrandController.deleteBrand)

module.exports = router
