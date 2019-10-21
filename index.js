//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

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