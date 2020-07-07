const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    fLastName: String,
    sLastName: String
});

module.exports = mongoose.model('User', userSchema, 'Users');