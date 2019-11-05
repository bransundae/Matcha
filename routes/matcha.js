const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('matcha/matcha');
})

module.exports = router;