const { name } = require('ejs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/miniproject')

const userSchema =  mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    age : { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilepic: { type: String, default: 'default.png' },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }],
    
     // Profile picture filename
    
});

module.exports = mongoose.model('user', userSchema);
