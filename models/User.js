const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    role: String,
    preferences: {
        emailNotifications: Boolean,
        dashboardAlerts: Boolean,
        keywordAlerts: Boolean,
        monitoringFrequency: Number,
        categories: [String]
    }
});

module.exports = mongoose.model('User', userSchema);