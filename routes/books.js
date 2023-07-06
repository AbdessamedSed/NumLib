const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const path = require('path')
const multer = require('multer')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    console.log(file)
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
      query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
      query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
      query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
      const books = await query.exec()
      res.render('books/index', {
        books: books,
        searchOptions: req.query
      })
    } catch {
      res.redirect('/')
    }
  })
  

router.post('/', upload.single('cover'), async(req, res) => {
  console.log(req.file)
  const fileName = req.file != null ? req.file.filename : null
  console.log(fileName)
  const book = new Book({
      title: req.body.title,
      author: req.body.author,
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      coverImageName: fileName,
      description: req.body.description
  })

  try {
    console.log(book.coverImageName)
    const newBook = await book.save()
    res.redirect('books')
  } catch {
    renderNewPage(res, book, true)
  }  
})


async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})
    const para = {
      authors: authors,
      book: book
    }
    if (hasError) para.errorMessage = 'Error'
    res.render('books/new', para)
  } catch {
    res.redirect('books/')
  }
}

router.get('/new', async (req, res) => {
   renderNewPage(res, new Book())
})



module.exports = router