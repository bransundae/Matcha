const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const keys = require('./keys');

//Load User Model
const User = mongoose.model('user');

//Google Strategy
module.exports =
  function(passport){
    passport.use(
      new GoogleStrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: keys.googleCallbackURI,
        proxy: true
      }, (accessToken, refreshToken, profile, done) => {
        User.findOne({
          googleID: profile.id
        }).then(user => {
          if (user){
            user.lastOnline = Date.now();
            user.save()
            .then(user => done(null, user));
          } else {
            //Create New User
            const newUser = {
              googleID: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
              image: profile.photos[0].value,
              lastOnline: Date.now()
            }
            new User(newUser)
            .save()
            .then(user => done(null, user));
          }
        })
      })
    )

    passport.use(new LocalStrategy({
      usernameField: 'email'},
      (email, password, done) => {
        //Match User by Email
        User.findOne({
          email: email
        }).then(user => {
          if (!user){
            return done(null, false, {message: 'No User Found'});
          }
          // Match password 
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch){
              return done(null, user);
            } else {
              return done(null, false, {message: 'Password Incorrect'})
            }
          })
        })
      }))

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      User.findById(id).then(user => done(null, user));
    });
}