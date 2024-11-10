const mongoose = require('mongoose');
const user = require('./user');

const postSchema =  mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});



module.exports = mongoose.model('post', postSchema);
