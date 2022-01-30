var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: { type: String, required: true, minlength: 1, maxlength: 100 },
    password: { type: String, required: true, minlength: 1, maxlength: 100 },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String },
    role: { type: Number, required: true },
    token: { type: String }
});

module.exports = mongoose.model('User', UserSchema, 'users');
