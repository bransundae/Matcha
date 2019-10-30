//Dependencies
const exphbs = require('express-handlebars');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

//Application
const app = express();

//Load Models
require('./models/User');

//Load Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Globals
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.eeror_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//Load Configs
const keys = require('./config/keys');
require('./config/passport')(passport); 

//Load Routes
const auth = require('./routes/auth');
const user = require('./routes/user');
const index = require('./routes/index');

//Mongoose Connect
mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected')
})
.catch(err => console.log(err));

//Load Resource Directory
app.use(express.static(__dirname + '/res'));

//Use Routes
app.use('/auth', auth);
app.use('/user', user);
app.use('/', index);

//Create and Initialise the Server

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on ${port}`);
})