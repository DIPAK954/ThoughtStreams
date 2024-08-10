const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const multerconfig = require('./config/multerconfig');
const upload = require("./config/multerconfig");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", function (req, res) {      // Home page
  res.render("index");
});

app.get("/profile/upload", function (req, res) {    // routing for profile upload page
  res.render("profileupload");
});

app.post('/upload', isLoggedIn,upload.single('image'),async (req,res)=>{  // for upload profile image
  let user = await userModel.findOne({email: req.user.email})
  user.profilepic = req.file.filename;
  await user.save();
  res.redirect('/profile')
})

app.get("/login", function (req, res) {       // This is render login page
  res.render("login");
});

app.post("/login", async function (req, res) {   // login logic and redirect profile or logine
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong");

  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "diyyyy");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

app.get("/logout", function (req, res) {   // Logout page redirect to logine
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile", isLoggedIn, async (req, res) => {          // This is render Profile page
  let user = await userModel.findOne({ email: req.user.email }).populate("posts");
  res.render("profile", { user });
});

app.get("/like/:id", isLoggedIn, async (req, res) => {          // post like  
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  
  if(post.likes.indexOf(req.user.userid)===-1){
    post.likes.push(req.user.userid);
  }else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1);
  }

  await post.save();
  res.redirect("/profile");
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {          // post edit  
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  
  res.render('edit',{post})
});

app.post("/update/:id", isLoggedIn, async (req, res) => {          // post update   
  let post = await postModel.findOneAndUpdate({ _id: req.params.id },{content: req.body.content});
  res.redirect('/profile')
});


app.post("/post", isLoggedIn, async (req, res) => {          // For create new post 
  let user = await userModel.findOne({ email: req.user.email });
  let {content} = req.body;

  let post = await postModel.create({
    user:user._id,
    content
  })

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile')
});


app.post("/register", async function (req, res) {          // This is register
  let { email, username, name, age, password } = req.body;
  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        name,
        age,
        email,
        password: hash,
      });
      let token = jwt.sign({ email: email, userid: user._id }, "diyyyy");
      res.cookie("token", token);
      res.redirect("/login");
    });
  });
});

app.get("/allposts", isLoggedIn, async (req, res) => {
  let posts = await postModel.find().populate("user"); // Adjust based on your data
  res.render("allposts", { posts, user: req.user });
});


function isLoggedIn(req, res, next) {                   //This function use for authorized routing
  if (req.cookies.token === "") res.redirect("/login");
  else {
    let data = jwt.verify(req.cookies.token, "diyyyy");
    req.user = data;
    next();
  }
}

app.listen(3000);
