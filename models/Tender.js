const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
    id: String,
    title: String,
    organization: String,
    description: String,
    value: Number,
    publishDate: Date,
    submissionDeadline: Date,
    location: String,
    category: String,
    keywords: [String],
    source: String,
    sourceUrl: String,
    portalId: String,
    discovered: Date,
    priority: String,
    status: String,
    addedDate: Date
});

module.exports = mongoose.model('Tender', tenderSchema);