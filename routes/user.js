const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
    res.render('user/profile');
})

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
        res.send('passed');
    }

});

module.exports = router;