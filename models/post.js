var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, minlength: 1, maxlength: 100 },
    content: { type: String, required: true },
    date: { type: Date, required: true }
});

module.exports = mongoose.model('Post', PostSchema, 'posts');
