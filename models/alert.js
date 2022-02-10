var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AlertSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Alert', AlertSchema, 'alerts');
