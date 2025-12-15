const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// In-memory users store
let users = [];

/**
 * Check if a username already exists
 * @param {string} username
 * @returns {boolean}
 */
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

/**
 * Check if username and password match an existing user
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

/**
 * Login as a registered user
 * Generates JWT token and stores it in session
 */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    const accessToken = jwt.sign(
      { username },
      "access",
      { expiresIn: "1h" }
    );

    // Save token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).json({ message: "User successfully logged in" });
  }

  return res
    .status(401)
    .json({ message: "Invalid Login. Check username and password" });
});

/**
 * Add or modify a book review (Task 8)
 * Only logged-in users can add/update their own review
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!review) {
    return res
      .status(400)
      .json({ message: "Review query parameter is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if not present
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update review for this user
  books[isbn].reviews[username] = review;

  return res
    .status(200)
    .json({ message: "Review added/updated successfully" });
});

/**
 * Delete a book review (Task 9)
 * User can delete only their own review
 */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res
      .status(404)
      .json({ message: "Review not found for this user" });
  }

  delete books[isbn].reviews[username];

  return res
    .status(200)
    .json({ message: "Review deleted successfully" });
});

// Export router and helpers
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
