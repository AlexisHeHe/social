const express  = require('express');
const mongoose = require('mongoose');
const {NewSchema, PostSchema} = require('./modal');
const { ObjectId } = require('mongodb');
const app = express();
let token = {
  loggedIn: false,
  userID: "",
  username: "",
  password: ""
};
mongoose.connect('mongodb+srv://gameryeet09:alexismm@nodeweb.vda3s0q.mongodb.net/nodeweb?retryWrites=true&w=majority')
.then(result => app.listen(3000)).catch(err => console.error(err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

// Get requests

app.get('/', (req,res) => {
  if(token.loggedIn = true){
    let page = req.query.page || 0;
    PostSchema.find().sort({createdAt: -1}).skip(page * 10).limit(10).then(result => res.render('main', {info: token, title: "Home", posts: result}));
  }else{res.render('main', {info: token, title: "Home"});}
})

app.get('/login', (req,res) => {
  res.render('login', {title: "Login", info: token});
})
app.get('/signup', (req,res) => {
  res.render('signup', {title: "Sign Up", info: token});
})

app.get('/create', (req,res) => {
  res.render('create', {info: token, title: "Create"});
})

app.get('/profile', (req,res) => {
  res.render('profile', {title: "Profile", info: token});
})

app.get('/filtered', (req, res) => {
  res.render('filtered', {title: "Home F", info: token, posts: result});
})

app.get('/profile/:id', async (req, res) => {
  let id = req.params.id;
  let authorPosts = await PostSchema.find({authorID: id});
  await NewSchema.findById(id).then(result => res.render('author', {info: token, title: "Author Details", posts: result, ap: authorPosts})).catch(err => console.error(err));
})

app.get('/following', async (req, res) => {
  try{
    if(token.username){
      let followingPosts = await NewSchema.findOne({username: token.username});
      let posts = await PostSchema.find({author: {$in: followingPosts.following}});
      await res.render('following', {info: token, title: "Following", posts});
    }else{
      await res.render('following', {info: token, title: "Following", posts: []});
    }
  }catch(err){
     console.log(err);
  }
})

// Post requests

app.post('/sign', async (req,res) => {
  let user = new NewSchema(req.body);
  let exist = await NewSchema.findOne({username: user.username});
  if(exist){
    res.send('User already exists');
  }else{user.save().then(result => res.render('login', {info: token, title: "Login", posts: ""}));}
  
})

app.post('/login', async (req,res) => {
  let user = new NewSchema(req.body);
  let exist = await NewSchema.findOne({username: user.username});
  if(!exist){
    res.send('Account not found!');
  }else{
    token = {
      loggedIn: true,
      userID: exist._id,
      username: user.username,
      password: user.password
    };
    res.render('profile', {info: token, title: "Profile", posts: ""});
  }
})

app.post('/signout', async (req,res) => {
    token = {
      loggedIn: false,
      userID: "",
      username: "",
      password: ""
    };
    res.render('login', {info: token, title: "Log In", posts: ""});
  
})

app.post('/createp', (req,res) => {
  let post = new PostSchema(req.body);
  post.authorID = token.userID;
  post.save().then(result => res.status(301).redirect('/', {info: token, title: "Log In", posts: ""})).catch(err => console.error(err));
})

app.post('/filter', (req, res) => {
  let filters = String(req.body.filter);
  PostSchema.find({filter: filters}).limit(10).then(result => res.render('main', {posts: result, title: "Home", info: token}));
})




// Patch requests


app.patch('/follow/:id', async (req,res) => {
  let id = req.params.id;
  try{
    let follower = await NewSchema.findById(id);
    let self = await NewSchema.findById(token.userID);
    if(self.following.includes(follower.username)){
      await res.json({alr: 'true'});
    }else{
      await NewSchema.findOneAndUpdate({_id: token.userID}, {$push: {following: follower.username}}, {new:true}).catch(err => console.error(err));
      await NewSchema.findOneAndUpdate({_id: id}, {$push: {followers: self.username}}, {new:true}).catch(err => console.error(err));
    }
    
  }catch(err){
    console.log(err);
  }
})

app.patch('/unfollow/:id', async (req,res) => {
  let id = req.params.id;
  try{
    let follower = await NewSchema.findById(id);
    let self = await NewSchema.findById(token.userID);
    if(!self.following.includes(follower.username)){
      res.json({alr: 'true'});
    }else{
    await NewSchema.findOneAndUpdate({_id: token.userID}, {$pull: {following: follower.username}}, {new:true}).catch(err => console.error(err));
    await NewSchema.findOneAndUpdate({_id: id}, {$pull: {followers: self.username}}, {new:true}).catch(err => console.error(err));
    }
  }catch(err){
    console.log(err);
  }
})


app.use((req, res) => {
  res.status(404).render('404');
})
