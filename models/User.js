const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    googleID:{
        type: String,
        required: false
    },
    instagramID: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    details: {
        location: {
            type: String
        },
        birthday: {
            type: Date
        },
        orientation: {
            type: String
        },
        ethnicity: {
            type: String
        },
        height: {
            type: Number
        },
        bodyType: {
            type: String
        },
        diet: {
            type: String
        }
    },
    image: {
        type: String
    },
    fame: {
        type: Number,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now
    }
});

//Create collection and Add Schema
mongoose.model('user', UserSchema);