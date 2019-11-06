const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport');
const https = require('https');
const router = express.Router();
const fs = require('fs');
const formidable = require('formidable');

const keys = require('../config/keys');

require('../models/User');
const User = mongoose.model('user')

router.get('/profile', (req, res) => {
    renderProfile(req, res);
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

        User.findOne({
            email: req.body.email
        }).then(user => {
            if (user){
                req.flash('error_msg', 'There is already an account registered for that email address');
                res.redirect('/auth/register');
            }
            else {
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
        })
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
            if (user.details.birthday){
                var str = user.details.birthday.toDateString().split(' ');
                console.log(str);
                var birthdayString = `${str[2]} ${str[1]},${str[3]}`;
            }
            res.render('user/forms/info', {
                firstName: user.firstName,
                lastName: user.lastName,
                country: user.details.country,
                birthday: birthdayString,
                gender: user.details.gender,
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

        if(!req.body.firstName || !req.body.lastName || !req.body.country || !req.body.birthday
            || !req.body.gender || !req.body.orientation || !req.body.ethnicity || !req.body.height 
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
                country: req.body.country,
                birthday: req.body.birthday,
                gender: req.body.gender,
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
                    country: req.body.country,
                    gender: req.body.gender,
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

router.post('/upload/image', (req, res) => {
    if (!res.locals.user){
        req.flash('prompt', 'You must be logged in to access Matcha');
        res.redirect('/auth/login');
    } else {
        User.findOne({email: res.locals.user.email})
        .then(user => {
            const form = new formidable.IncomingForm();
            form.parse(req);

            form.on('fileBegin', (name, file) => {
                var dir = __dirname + `/../uploads/images/${res.locals.user.id}`

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                file.name = Date.now();
                file.path = `${dir}/${file.name}.jpg`;
            })

            form.on('file', (name, file) => {
                console.log("Uploaded File: " + file.name);
                user.images.push({permalink: `/images/${user.id}/${file.name}.jpg`, caption: ""});
                user.save()
                .then(user => {
                    renderProfile(req, res);
                })
            })
        })
    }
})

router.post('/update/profileImage', (req, res) => {
    if(!res.locals.user){
        req.flash('prompt', 'You must be logged in to access Matcha');
        res.redirect('/auth/login');
    } else {
        User.findOne({
            email: res.locals.user.email
        })
        .then(user => {
            user.image = req.body.profileImage
            user.save()
            .then(user => {
                renderProfile(req, res);
            });
        })
    }
})

function renderProfile(req, res){
    errors = [];
    if(!res.locals.user){
        req.flash('prompt', 'You must be logged in to access Matcha');
        res.redirect('/auth/login');
    } else {
        User.findOne({
            email: res.locals.user.email
        })
        .then(user => {
            if (!user.firstName || !user.lastName || !user.details.birthday || !user.details.country || !user.details.gender 
                || !user.details.orientation || !user.details.ethnicity || !user.details.height 
                || !user.details.bodyType || !user.details.diet){
                    req.flash('prompt', 'We\'re missing a few details about you');
                    res.redirect('/user/info/update');
                }
            else{
                var birthdayString = user.details.birthday.toDateString().split(' ');
                var media = req.query.media;
                if (typeof media !== undefined && media){
                    media = JSON.parse(media);
                    console.log(media);

                    var dup = false;
                    var currentImages = user.images;

                    for (var i = 0; i < media.length; i++){
                        for (var j = 0; j < currentImages.length; j++){
                            if (currentImages[j].permalink ==  `${media[i].permalink}media/?size=l` || media[i].media_type != 'IMAGE'){
                                dup = true;
                                j = 0;
                                i++;
                            }
                        }
                        if (dup == false){
                            var newMedia= {
                                permalink: `${media[i].permalink}media/?size=l`,
                                caption: media[i].caption
                            }
                            currentImages.push(newMedia);
                        } else {0
                            dup = false;
                        }
                    }
                    user.images = currentImages;
                    user.save();
                }

                res.render('user/profile', {
                    fame: user.fame,
                    media: user.images,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    country: user.details.country,
                    birthday: `${birthdayString[2]} ${birthdayString[1]},${birthdayString[3]}`,
                    gender: user.details.gender,
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
}

module.exports = router;