//Dependencies
const exphbs = require('express-handlebars');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const https = require('https');
const fs = require('fs');

//Application
const app = express();

//Load Models
require('./models/User');

//Load Configs
const {
    strcmp,
    indexStep,
    years,
    dateStringify
} = require('./config/hbs');
const keys = require('./config/keys');
require('./config/passport')(passport);

//Load Middleware
app.engine('handlebars', exphbs({
    helpers: {
        strcmp : strcmp,
        indexStep: indexStep,
        years: years,
        dateStringify: dateStringify
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
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
    res.locals.gps = req.gps || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.prompt = req.flash('prompt');
    next();
}); 

//Load Routes
const matcha = require('./routes/matcha');
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
app.use(express.static(__dirname + '/uploads'));

//Use Routes
app.use('/matcha', matcha);
app.use('/auth', auth);
app.use('/user', user);
app.use('/', index);

//Create and Initialise the Server

const port = process.env.PORT || 5000;

const credentials = {
    key: fs.readFileSync('./config/key.pem', 'utf8'),
    cert: fs.readFileSync('./config/server.crt', 'utf8')
  };

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

/*app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
})*/

module.exports = httpsServer;