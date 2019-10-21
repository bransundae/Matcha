const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

module.exports = function(passport){
  passport.use(
    new GoogleStrategy({
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: keys.googleCallbackURI,
      proxy: true
    }, (accessToken, refreshToken, profile, done) => {
      console.log(`access token: ${accessToken}`);
      console.log(`profile: ${profile}`)
    })
  )
}