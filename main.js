const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const upload = require('./config/multerconfig');

const userModel = require('./models/user');
const postModel = require('./models/post');
const multer = require('./config/multerconfig');
const crypto = require('crypto');




app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/images/uploads', express.static(path.join(__dirname, 'public/images/uploads')));


// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/profile/upload', (req, res) => {
    res.render('profileupload');
});


app.post('/upload', isLoggedIn, upload.single('image'), async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    user.profilepic = req.file.filename; // Use correct field name
    await user.save();
    console.log(user); // Log the updated user
    res.redirect('/profile');
});



app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/profile', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate('posts') ;
    
    res.render('profile', { user });
});

app.get('/like/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id }).populate('user') ;
    if(post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid);
       
    }
    else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
   
    await post.save();
    res.redirect('/profile');
    
  
});



app.get('/edit/:id', isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id }).populate('user') ;
   
    res.render('edit', { post });
    
  
});



app.post('/update/:id', isLoggedIn, async (req, res) => {
    console.log("Post Content:", req.body.postContent); // Debugging

    let updatedPost = await postModel.findByIdAndUpdate(
        req.params.id,
        { content: req.body.postContent },
        { new: true } // Returns the updated document
    );

    // console.log("Updated Post:", updatedPost); // Debugging
    res.redirect('/profile');
});







app.post('/post', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    let { content } = req.body;
    let post = await postModel.create({   
        user: user._id,
        content,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');
});

app.post('/register', async (req, res) => {
    let { username, email, password, name, age } = req.body;

    let user = await userModel.findOne({ email });
    if (user) return res.status(400).send('User already exists');

    bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).send('Error generating salt');
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) return res.status(500).send('Error hashing password');

            let user = await userModel.create({ username, email, name, age, password: hash });
            let token = jwt.sign({ email: email, userid: user._id }, 'shhhh');
            res.cookie('token', token);
            res.send('User created successfully');
        });
    });
});

app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) return res.status(400).send('Sorry, User does not exist');

    bcrypt.compare(password, user.password, (err, result) => {
        if (err) return res.status(500).send('Error comparing passwords');
        if (result) {
            let token = jwt.sign({ email: email, userid: user }, 'shhhh');
            res.cookie('token', token);
            return res.redirect('/profile');
        } else {
            return res.redirect('/login');
        }
    });
});

app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.redirect('/login');
});

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (!req.cookies.token) {
        return res.send('You are not logged in');
    } else {
        let data = jwt.verify(req.cookies.token, 'shhhh');
        req.user = data;
    }
    next();
}



const port = 3001;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

