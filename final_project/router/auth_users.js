const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username already exists
const isValid = (username) => {
  let userwithsameusername = users.filter(
    (user) => user.username === username
  );

  return userwithsameusername.length === 0;
};

// Check username and password
const authenticatedUser = (username, password) => {
  let validusers = users.filter(
    (user) => user.username === username && user.password === password
  );

  return validusers.length > 0;
};

// Login
regd_users.post("/login", (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password required"
    });
  }

  if (authenticatedUser(username, password)) {

    let accessToken = jwt.sign(
      {
        data: username
      },
      "access",
      {
        expiresIn: "1h"
      }
    );

    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({
      message: "Customer successfully logged in"
    });

  }

  return res.status(401).json({
    message: "Invalid Login. Check username and password"
  });

});

// Add or Modify Review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!req.session.authorization) {
    return res.status(401).json({
      message: "Please login first"
    });
  }

  const username = req.session.authorization.username;

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added/updated"
  });

});

// Delete Review
regd_users.delete("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!req.session.authorization) {
    return res.status(401).json({
      message: "Please login first"
    });
  }

  const username = req.session.authorization.username;

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
  }

  return res.status(200).json({
    message: "Review successfully deleted"
  });

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;