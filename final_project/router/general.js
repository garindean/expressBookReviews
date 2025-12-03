const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    let book = books[isbn];
    if(book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
}

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    let matchingBooks = [];
    Object.keys(books).forEach((key) => {
      if(books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push({isbn: key, ...books[key]});
      }
    });
    if(matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found by this author");
    }
  });
}

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    let matchingBooks = [];
    Object.keys(books).forEach((key) => {
      if(books[key].title.toLowerCase().includes(title.toLowerCase())) {
        matchingBooks.push({isbn: key, ...books[key]});
      }
    });
    if(matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("No books found with this title");
    }
  });
}


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if(username && password) {
    // Check if user already exists
    if(!isValid(username)) {
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user. Username or password missing."});
});

public_users.get('/', async function (req, res) {
  try {
    const bookList = await getBooks();
    res.send(JSON.stringify(bookList, null, 4));
  } catch(error) {
    res.status(500).json({message: error});
  }
});

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  
  try {
    const book = await getBookByISBN(isbn);
    res.send(JSON.stringify(book, null, 4));
  } catch(error) {
    res.status(404).json({message: error});
  }
});
  
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  
  try {
    const matchingBooks = await getBooksByAuthor(author);
    res.send(JSON.stringify(matchingBooks, null, 4));
  } catch(error) {
    res.status(404).json({message: error});
  }
});

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  
  try {
    const matchingBooks = await getBooksByTitle(title);
    res.send(JSON.stringify(matchingBooks, null, 4));
  } catch(error) {
    res.status(404).json({message: error});
  }
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  if(book) {
    res.send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
