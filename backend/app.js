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
const cors = require("cors");

require('dotenv').config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000',
  credentials: true
}));

// Serve static files - ensure images are properly served
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, "public")));

// API Routes

// Register a New User
app.post("/api/register", async (req, res) => {
  try {
    let { email, username, name, age, password } = req.body;
    let existingEmail = await userModel.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: "Email already registered" });
    let existingUsername = await userModel.findOne({ username });
    if (existingUsername) return res.status(400).json({ error: "Username already taken" });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let newUser = await userModel.create({ username, name, age, email, password: hash });
        let token = jwt.sign({ email: email, userid: newUser._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.cookie("token", token, { httpOnly: true });
        res.json({ success: true, message: "User registered successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login Logic
app.post("/api/login", async (req, res) => {
  try {
    let { identifier, password } = req.body; // identifier can be username or email
    let user;
    // Check if identifier is an email
    if (identifier.includes('@')) {
      user = await userModel.findOne({ email: identifier });
    } else {
      user = await userModel.findOne({ username: identifier });
    }
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        let token = jwt.sign({ email: user.email, userid: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.cookie("token", token, { httpOnly: true });
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(400).json({ error: "Invalid credentials" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Logout
app.get("/api/logout", (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  res.json({ success: true, message: "Logged out successfully" });
});

// Get current user
app.get("/api/user", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email }).populate("posts");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get user by ID
app.get("/api/user/:id", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findById(req.params.id).populate("posts");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Serve profile picture
app.get("/api/profile-picture/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'public/images/uploads', filename);
  
  // Check if file exists
  const fs = require('fs');
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    // Return default image if file doesn't exist
    const defaultPath = path.join(__dirname, 'public/images/uploads', 'default.png');
    res.sendFile(defaultPath);
  }
});

// Upload Profile Picture
app.post('/api/upload', isLoggedIn, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old profile picture if it exists and is not default
    if (user.profilepic && user.profilepic !== 'default.png') {
      const fs = require('fs');
      const oldImagePath = path.join(__dirname, 'public/images/uploads', user.profilepic);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    user.profilepic = req.file.filename;
    await user.save();
    
    res.json({ 
      success: true, 
      filename: req.file.filename,
      message: "Profile picture updated successfully"
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Create a New Post
app.post("/api/post", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let { content } = req.body;

    let post = await postModel.create({ user: user._id, content });
    user.posts.push(post._id);
    await user.save();

    const populatedPost = await postModel.findById(post._id).populate("user");
    res.json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Get All Posts
app.get("/api/posts", isLoggedIn, async (req, res) => {
  try {
    let posts = await postModel.find().populate("user");
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Like a Post
app.post("/api/like/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.id);
    
    if (!post) return res.status(404).json({ error: "Post not found" });

    let likeIndex = post.likes.indexOf(req.user.userid);
    if (likeIndex === -1) {
      post.likes.push(req.user.userid);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json({ success: true, likes: post.likes });
  } catch (error) {
    res.status(500).json({ error: "Failed to like post" });
  }
});

// Update a Post
app.put("/api/post/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Ensure the logged-in user is the owner of the post
    if (post.user.toString() !== req.user.userid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await postModel.findByIdAndUpdate(req.params.id, { content: req.body.content });
    res.json({ success: true, message: "Post updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete a Post
app.delete("/api/post/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Ensure the logged-in user is the owner of the post
    if (post.user.toString() !== req.user.userid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await postModel.findByIdAndDelete(req.params.id);

    // Remove the post from the user's posts array
    await userModel.findByIdAndUpdate(req.user.userid, {
      $pull: { posts: req.params.id }
    });

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Middleware for Authentication
function isLoggedIn(req, res, next) {
  try {
    if (!req.cookies.token) return res.status(401).json({ error: "Not authenticated" });

    let data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (error) {
    res.clearCookie("token");
    res.status(401).json({ error: "Invalid token" });
  }
}

// Serve React app for all other routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
