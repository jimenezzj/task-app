const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        required: true,
        type: String
    },
    description: {
        required: true,
        type: String
    },
    dateDelivery: {
        required: true,
        type: Date
    },
    userAssigned: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    priority: {
        enum: ['B', 'A', 'M'],
        type: String,
        required: true
    },
    status: Boolean
});

module.exports = mongoose.model('Task', taskSchema, 'Tasks');