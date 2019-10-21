//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const app = express();

//Globals
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

//Load Models
require('./models/User');

//Load Middleware
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Load Configs
const keys = require('./config/keys');
require('./config/passport')(passport); 

//Load Routes
const auth = require('./routes/auth');

//Mongoose Connect
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected')
})
.catch(err => console.log(err));

//Index Route
app.get('/', (req, res) => {
    res.send('INDEX');
})

//Use Routes
app.use('/auth', auth);

//Create and Initialise the Server

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on ${port}`);
})