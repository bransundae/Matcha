const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('AUTH');
})

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']}));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth'}), () => {
        res.redirect('/dashboard');
    });

module.exports = router;