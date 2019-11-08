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
        country: {
            type: String
        },
        gender: {
            type: String
        },
        birthday: {
            type: Date
        },
        orientation: [],
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
        },
        about : {
            type: String,
            default: "Hey there I'm new to Matcha!"
        }
    },
    images: [{permalink : {type : String}, caption : {type : String}}],
    image: {
        type: String
    },
    fame: {
        type: Number,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now()
    },
    lastOnline: {
        type: Date
    },
    gps:{
        lat: {
            type: String
        },
        lng: {
            type: String
        },
        locality: {
            type: String
        }
    }
});

//Create collection and Add Schema
mongoose.model('user', UserSchema);