const express = require('express');
const router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/* Index route redirects to /books */
router.get('/', (req, res) => {
  res.redirect('/books');
});

/* GET books route */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  res.render('index', { books });
}));

/* GET New book form */
router.get('/books/new', (req, res) => {
  res.render('new-book', { book: {}, title: 'New Book'});
});

/* POST new book */
router.post('/books/new', asyncHandler(async (req, res) => {
  let book;
    try {
      book = await Book.create(req.body);
      res.redirect('/books/' + book.id);
    } catch(err) {
      if(err.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render('new-book', { book, errors: err.errors, title: 'New Book' });
      } else {
        throw err;
      }
    }
}));

/* GET book by ID from db */
router.get('/books/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  res.render('update-book', { book, title: 'Update Book' });
}));

/* POST route updates book props */
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect('/books/' + book.id);
    } else {
      res.sendStatus(404);
    }
  } catch(err) {
    if(err.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { book, errors: err.errors, title: 'Update Book'});
    } else {
      throw err;
    }
  }
}));

/* POST Delete book */
router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect('/books');
  }
}));

module.exports = router;

