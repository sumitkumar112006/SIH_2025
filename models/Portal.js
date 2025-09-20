const mongoose = require('mongoose');

const portalSchema = new mongoose.Schema({
    id: String,
    name: String,
    url: String,
    type: String,
    active: Boolean,
    searchEndpoint: String,
    lastScanned: Date,
    totalTenders: Number,
    newTenders: Number
});

module.exports = mongoose.model('Portal', portalSchema);