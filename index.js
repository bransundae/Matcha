//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');

const app = express();

//Load Routes

//Index Route
app.get('/', (req, res) => {
    res.send('INDEX');
})

//Create and Initialise the Server

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on ${port}`);
})

//Create Server HTTPS Credentials and Initialise Server
/*const credentials = {
    key: fs.readFileSync('./config/key.pem', 'utf8'),
    cert: fs.readFileSync('./config/server.crt', 'utf8')
}

const port = process.env.PORT || 5000;
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log(`Server started on port ${port}`);
});*/