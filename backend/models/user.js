const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to the database!");
}).catch((err) => {
  console.error("Error connecting to the database", err);
});

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true },
    age: Number,
    email: { type: String, required: true, unique: true, trim: true },
    password: String,
    profilepic: {
        type: String,
        default: "default.png"
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
});

module.exports = mongoose.model('user', userSchema);
