# ThoughtStreams - Social Media Platform

<<<<<<< HEAD
A modern social media platform built with Node.js backend and React.js frontend.
=======
ThoughtStreams is a dynamic and user-friendly blog platform designed for creators, writers, and thinkers to share their stories, ideas, and insights with the world. 
Whether you're an aspiring writer, a seasoned blogger, or someone who simply loves to express thoughts through words, 
ThoughtStreams offers you the perfect space to craft and publish your content.

## 📸 Screenshots
 **Home Page**
![App Screenshot](<public/images/Home Page.png>)

 **Profile Page**
 ![App Screenshot](<public/images/Profile Page.png>)
 
---
>>>>>>> 6c135ff6062ce92b5ab912f6d5bf8f1f0d732a8b

## 🔗 Demo

<<<<<<< HEAD
- User registration and authentication
- Create, edit, and delete posts
- Like/unlike posts
- Profile picture upload
- User search functionality
- View other users' profiles
- Responsive design with Tailwind CSS
=======
👉 [https://thoughtstreams.onrender.com](https://thoughtstreams.onrender.com)

---

## ✨ Features

- 🧭 User-Friendly Navigation  
- 📱 Responsive Design  
- 🔐 Authentication  
>>>>>>> 6c135ff6062ce92b5ab912f6d5bf8f1f0d732a8b

---

<<<<<<< HEAD
### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for file uploads
- bcryptjs for password hashing

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

## Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

4. Create a `.env` file in the root directory with:
   ```
   PORT=5000
   DB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

## Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. In a new terminal, start the React development server:
   ```bash
   cd client
   npm start
   ```
=======
## 🛠 Tech Stack

**Client:** EJS  
**Server:** Node.js, Express.js, MongoDB

---

## 📦 Dependencies

- `ejs`  
- `express`  
- `mongoose`  
- `cookie-parser`  
- `bcrypt`  
- `jsonwebtoken` 
- `multer`  

---

## 👤 Author
>>>>>>> 6c135ff6062ce92b5ab912f6d5bf8f1f0d732a8b

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Mode

1. Build the React app:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/logout` - Logout user
- `GET /api/user` - Get current user profile
- `GET /api/user/:id` - Get user profile by ID
- `POST /api/upload` - Upload profile picture
- `POST /api/post` - Create a new post
- `GET /api/posts` - Get all posts
- `POST /api/like/:id` - Like/unlike a post
- `PUT /api/post/:id` - Update a post
- `DELETE /api/post/:id` - Delete a post

## Project Structure

```
Project_1/
├── app.js                 # Main server file
├── package.json           # Backend dependencies
├── models/               # MongoDB models
│   ├── user.js
│   └── post.js
├── config/               # Configuration files
│   └── multerconfig.js
├── public/               # Static files
│   └── images/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── App.js        # Main React app
│   └── package.json      # Frontend dependencies
└── README.md
```

## Features Overview

### Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes

### Posts
- Create, edit, and delete posts
- Like/unlike functionality
- Real-time updates

### User Profiles
- Profile picture upload
- View other users' profiles
- User search functionality

### UI/UX
- Modern, responsive design
- Dark theme with Tailwind CSS
- Smooth transitions and animations
- Mobile-friendly interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.
