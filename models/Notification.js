const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: String,
    title: String,
    message: String,
    category: String,
    priority: String,
    data: Object,
    channels: [String],
    created: Date,
    read: Boolean
});

module.exports = mongoose.model('Notification', notificationSchema);