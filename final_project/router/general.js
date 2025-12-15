const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Если не передали username или password
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Проверяем, существует ли пользователь
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Регистрируем нового пользователя
  users.push({ username: username, password: password });

  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});


// Get the book list available in the shop
// Get the book list available in the shop (ASYNC / AWAIT)
public_users.get('/', async (req, res) => {
    try {
      const response = await axios.get(
        'http://localhost:5000/'
      );
      res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      res.status(500).json({ message: "Error fetching books" });
    }
  });
  

// Get book details based on ISBN
// Get book details based on ISBN (ASYNC / AWAIT)
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
      const isbn = req.params.isbn;
  
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
  
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      return res.status(500).json({ message: "Error fetching book by ISBN" });
    }
  });
  
  
// Get book details based on author
// Get book details based on author (ASYNC / AWAIT)
public_users.get('/author/:author', async (req, res) => {
    try {
      const author = req.params.author;
  
      const response = await axios.get(`http://localhost:5000/author/${author}`);
  
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books by author" });
    }
  });
  
// Get all books based on title
// Get book details based on title (ASYNC / AWAIT)
public_users.get('/title/:title', async (req, res) => {
    try {
      const title = req.params.title;
  
      const response = await axios.get(
        `http://localhost:5000/title/${title}`
      );
  
      return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books by title" });
    }
  });
  
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }

    return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
