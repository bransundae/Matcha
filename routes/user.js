const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

require('../models/User');
const User = mongoose.model('user')

router.get('/profile', (req, res) => {
    res.render('user/profile');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/user/profile',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

router.post('/register', (req, res) => {
    let errors = [];

    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

    if (!strongRegex.test(req.body.password) && !mediumRegex.test(req.body.password)){
        errors.push({text: "Password is too weak"});
    }

    if (errors.length > 0){
        res.render('auth/register', {
            errors: errors,
            email: req.body.email,
            password: req.body.password
        });
    } else {
        const newUser = new User({
            email: req.body.email,
            password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser.save()
                .then(user => {
                    req.flash('success_msg', 'You are now registered');
                    res.redirect('/user/login');
                })
                .catch(err => {
                    console.log(err);
                    return;
                })
            });
        });
    }

});

module.exports = router;