const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

require('../models/User');
const User = mongoose.model('user')

router.get('/profile', (req, res) => {
    errors = [];
    if(!res.locals.user){
        req.flash('prompt', 'You must be logged in to access Matcha');
        res.redirect('/auth/login');
    } else {
        User.findOne({
            email: res.locals.user.email
        })
        .then(user => {
            if (!user.firstName || !user.lastName || !user.details.birthday || !user.details.orientation || !user.details.ethnicity 
                || !user.details.height || !user.details.bodyType || !user.details.diet){
                    req.flash('prompt', 'We\'re missing a few details about you');
                    res.redirect('/user/info/update');
                }
            else{
                var birthdayString = user.details.birthday.toDateString().split(' ');
                res.render('user/profile', {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    birthday: `${birthdayString[2]} ${birthdayString[1]},${birthdayString[3]}`,
                    orientation: user.details.orientation,
                    ethnicity: user.details.ethnicity,
                    height: user.details.height,
                    bodyType: user.details.bodyType,
                    diet: user.details.diet,
                    profileImage: user.image
                })
            }
        })
    }
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
        res.render('user/forms/register', {
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

router.get('/info/update', (req, res) => {

    if(!res.locals.user){
        req.flash('prompt', 'You must be logged in to access Matcha');
        res.redirect('/auth/login');
    } else {
        User.findOne({
            email: res.locals.user.email
        })
        .then(user => {
            var birthdayString = user.details.birthday.toDateString().split(' ');
            res.render('user/forms/info', {
                firstName: user.firstName,
                lastName: user.lastName,
                birthday: `${birthdayString[2]} ${birthdayString[1]},${birthdayString[3]}`,
                orientation: user.details.orientation,
                ethnicity: user.details.ethnicity,
                height: user.details.height,
                bodyType: user.details.bodyType,
                diet: user.details.diet
        });
        })
    }
});

router.post('/info/update', (req, res) => {

    if(!res.locals.user){
        res.redirect('/auth/login');
    } else {
        errors = [];

        if(Date.now() < Date.parse(req.body.birthday)){
            errors.push({text: 'Your birthday must have happened before today'})
        } 
        
        else if(Date.now() - Date.parse(req.body.birthday) < (568025136000 / 1)){
            errors.push({text: 'You must be older than 18'})
        }

        if(!req.body.firstName || !req.body.lastName || !req.body.birthday 
            || !req.body.orientation || !req.body.ethnicity || !req.body.height 
            || !req.body.bodyType || !req.body.diet){
            errors.push({text: 'Please Fill All Fields'})
        }

        if (!isNaN(parseFloat(req.body.height)) && isFinite(req.body.height)){
        }
        else {
            errors.push({text:'Height must be a valid a number accurate to at most 4 decimal places'});
        }

        if (errors.length > 0){
            res.render('user/forms/info', {
                errors: errors,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                birthday: req.body.birthday,
                orientation: req.body.orientation,
                ethnicity: req.body.ethnicity,
                height: req.body.height,
                bodyType: req.body.bodyType,
                diet: req.body.diet
            });
        } else {
            User.findOne({
                email: res.locals.user.email
            }).then(user => {
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.details = {
                    birthday: req.body.birthday,
                    orientation: req.body.orientation,
                    ethnicity: req.body.ethnicity,
                    height: req.body.height,
                    bodyType: req.body.bodyType,
                    diet: req.body.diet
                };
                console.log(user);
                user.save()
                .then(user => {
                    req.flash('success_msg', 'Your info has been updated');
                    res.redirect('/user/profile');
                })
            })
        }
    }
});

module.exports = router;