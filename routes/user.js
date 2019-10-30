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
                    res.redirect('/auth/login');
                })
                .catch(err => {
                    console.log(err);
                    return;
                })
            });
        });
    }

});

router.get('/forms/info/update', (req, res) => {
    res.render('user/forms/info/update');
});

router.post('/forms/info/update', (req, res) => {

    errors = [];

    if(Date.now() < Date.parse(req.body.birthday)){
        errors.push({text: 'You must have been born before now'})
    } else if (Date.now() - Date.parse(req.body.birthday) < (568025136000 / 1)){
        errors.push({text: 'You must be older than 18'})
    }

    if (errors.length > 0){
        res.render('user/forms/info/update', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            birthday: req.body.lastName,
            orientation: req.body.orientation,
            ethnicity: req.body.ethnicity,
            height: req.body.height,
            diet: req.body.diet
        });
    }


   /*User.findOne({
       email: res.locals.user.email
   }).then(user => {
       user.firstName = req.body.firstName;
       user.lastName = req.body.lastName;
       user.details = {
           orientation: req.body.orientation,
           height: req.body.height,
           bodyType: req.body.bodyType,
           diet: req.body.diet
       };
       user.birthday = req.body.birthday;
       user.save()
       .then(user => {
           req.flash('success_msg', 'Your info has been updated');
           res.redirect('/user/profile');
       })
       console.log(user);
   })*/
});

module.exports = router;