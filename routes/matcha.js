const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

require('../models/User');
const User = mongoose.model('user')

router.get('/', (req, res) => {
    if(!res.locals.user){
        req.flash('prompt', 'You must be logged in to access Matcha');
        res.redirect('/auth/login');
    } else {
        User.find({
            'details.gender': res.locals.user.details.orientation,
            'gps.locality' : res.locals.user.gps.locality
        })
        .then(users => {
            res.render('matcha/matcha', {
                users : users
            });  
        })
    }
})

module.exports = router;