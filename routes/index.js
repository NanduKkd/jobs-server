const router = require('express').Router()

router.use('/auth', require('./auth'))
router.use('/jobs', require('./jobs'))
router.use('/posts', require('./posts'))
router.use('/messages', require('./messages'))

module.exports = router;
