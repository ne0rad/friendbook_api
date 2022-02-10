var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationsSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    alerts: [{ type: Schema.Types.ObjectId, ref: 'Alert' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

module.exports = mongoose.model('Notifications', NotificationsSchema, 'notifications');
