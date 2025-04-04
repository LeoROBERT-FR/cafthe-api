const express = require('express');
const router = express.Router();

router.use('/', require('./products'));
router.use('/', require('./clients'));

module.exports = router;
