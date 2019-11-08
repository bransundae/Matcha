const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const router = express.Router();
const https = require('https');
const keys = require('../config/keys');

require('../models/User');
const User = mongoose.model('user');

router.get('/', (req, res) => {
    res.render('user/forms/login');
});

router.get('/login', (req, res) => {
    res.render('user/forms//login');
});

router.get('/register', (req, res) => {
    res.render('user/forms/register');
});

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']}));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth'}), (req, res) => {
        res.redirect('/user/profile');
});

router.post('/google/gps', (req, res) => {
    const gps = JSON.parse(req.body.gps);
    const options = {
        hostname: `maps.googleapis.com`,
        path: `/maps/api/geocode/json?latlng=${gps.location.lat},${gps.location.lng}&key=${keys.googlePlacesAPIKEY}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }

    const request = https.request(options, (response) => {
        var body = "";

        response.on('data', (chunk) => {
            body += chunk;
        })

        
        response.on('end', () => {
            const result = JSON.parse(body);
            var neighbourhood = "";
            for (var i = 0; i < result.results[0].address_components.length; i++){
                for (var j = 0; j < result.results[0].address_components[i].types.length; j++){
                    if (result.results[0].address_components[i].types[j] == "sublocality"){
                        neighbourhood = result.results[0].address_components[i].short_name;
                        break ;
                    }
                }
                if (neighbourhood){
                    break ;
                }
            }

            if (!neighbourhood){
                for (var i = 0; i < result.results[0].address_components.length; i++){
                    for (var j = 0; j < result.results[0].address_components[i].types.length; j++){
                        if (result.results[0].address_components[i].types[j] == "locality"){
                            neighbourhood = result.results[0].address_components[i].short_name;
                            break ;
                        }
                    }
                    if (neighbourhood){
                        break ;
                    }
                }
            }

            if (neighbourhood){
                User.findOne({
                    email: res.locals.user.email
                })
                .then(user => {
                    user.gps = {
                        lat: gps.location.lat,
                        lng: gps.location.lng,
                        locality: neighbourhood 
                    }
                    user.save()
                    .then(user => {
                        res.redirect('/user/profile');
                    })
                })
            }

        })
    })
    request.end();
})

router.get('/instagram', (req, res) => {
    res.redirect(keys.instagramWindow);
})

router.get('/instagram/redirect', (req, res) => {
    const data = `app_id=${keys.instagramAppID}&app_secret=${keys.instagramClientSecret}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=${keys.instagramRedirectURI}`;
    
    const options = {
        hostname: 'api.instagram.com',
        path: '/oauth/access_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    }

    const request = https.request(options, (response) => {
        var body = "";
        console.log('Server exchanging Instagram Code for Access Token');
        console.log(`Server: ${response.statusCode}`);
    
        response.on('data', (chunk) => {
            body += chunk;
        })
        
        response.on('end', () => {
            body = body.replace(/[",:{}]/g, '');
            const stringBody = body.split(' ');
            const accessToken = stringBody[1];
            const userID = stringBody[3];            
            const data1 = `?fields=id,caption,media_type,timestamp,permalink&access_token=${accessToken}`;
    
            console.log(`userID: ${userID}`);
            console.log(userID.length);
            console.log(`access_token: ${accessToken}`);
            console.log(accessToken.length);
            console.log(data1)
    
            const options1 = {
                hostname: 'graph.instagram.com',
                path: `/me/media/${data1}`,
                method: 'GET',
            }

            const request1 = https.request(options1, (response) => {
                var body1 = '';
                console.log('Server Fetching User Object');
                console.log(`Server: ${response.statusCode}`);
    
                response.on('data', (chunk) => {
                    body1 += chunk;
                })
    
                response.on('end', () => {
                    const media = encodeURIComponent(JSON.stringify(JSON.parse(body1).data));
                    res.redirect(`/user/profile/?media=${media}`);
                })
            })
    
            request1.on('error', (e) => {
                console.error(e);
            })
            request1.end();
        })
    })

    request.on('error', (e) => {
        console.error(e);
    })
    request.write(data);
    request.end();
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;