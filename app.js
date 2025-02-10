const express = require("express");
const app = express();
const path = require("path");
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const multerconfig = require('./config/multerconfig');
const upload = require("./config/multerconfig");

require('dotenv').config();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Home Page
app.get("/", (req, res) => res.render("index"));

// Profile Upload Page
app.get("/profile/upload", isLoggedIn, (req, res) => res.render("profileupload"));

// Upload Profile Picture
app.post('/upload', isLoggedIn, upload.single('image'), async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  user.profilepic = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

// Login Page
app.get("/login", (req, res) => res.render("login"));

// Login Logic
app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(400).send("Invalid credentials");

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
      res.cookie("token", token, { httpOnly: true });
      res.redirect("/profile");
    } else {
      res.redirect("/login");
    }
  });
});

// Logout
app.get("/logout", (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.redirect("/login");
});

// Profile Page (Own)
app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email }).populate("posts");
  res.render("profile", { user });
});

// Visit Another User's Profile
app.get("/user/:id", isLoggedIn, async (req, res) => {
  try {
      let user = await userModel.findById(req.params.id).populate("posts");
      if (!user) return res.status(404).send("User not found");
      res.render("userprofile", { user });
  } catch (error) {
      res.status(500).send("Something went wrong");
  }
});


// Like a Post
app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findById(req.params.id);
  
  if (!post) return res.status(404).send("Post not found");

  let likeIndex = post.likes.indexOf(req.user.userid);
  if (likeIndex === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(likeIndex, 1);
  }

  await post.save();
  res.redirect(req.get('Referer') || "/profile");
});

// Edit a Post
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findById(req.params.id);
  res.render('edit', { post });
});

// Update a Post
app.post("/update/:id", isLoggedIn, async (req, res) => {
  await postModel.findByIdAndUpdate(req.params.id, { content: req.body.content });
  res.redirect('/profile');
});

// Create a New Post
app.post("/post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;

  let post = await postModel.create({ user: user._id, content });
  user.posts.push(post._id);
  await user.save();

  res.redirect('/profile');
});

// Register a New User
app.post("/register", async (req, res) => {
  let { email, username, name, age, password } = req.body;
  let existingUser = await userModel.findOne({ email });
  if (existingUser) return res.status(400).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let newUser = await userModel.create({ username, name, age, email, password: hash });
      let token = jwt.sign({ email: email, userid: newUser._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
      res.cookie("token", token);
      res.redirect("/login");
    });
  });
});

// View All Posts
app.get("/allposts", isLoggedIn, async (req, res) => {
  let posts = await postModel.find().populate("user");
  res.render("allposts", { posts, user: req.user });
});

// Middleware for Authentication
function isLoggedIn(req, res, next) {
  try {
    if (!req.cookies.token) return res.redirect("/login");

    let data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (error) {
    res.clearCookie("token");
    res.redirect("/login");
  }
}

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
