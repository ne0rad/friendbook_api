var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    author: { type: String, required: true, minlength: 1, maxlength: 100 },
    title: { type: String, required: true, minlength: 1, maxlength: 100 },
    content: { type: String, required: true },
    date: { type: Date, required: true }
});

PostSchema.virtual('url')
    .get(function () {
        return '/posts/' + this._id;
    });

module.exports = mongoose.model('Post', PostSchema, 'posts');
