const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const path = require('path')
const fs = require('fs')
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
    //console.log(query)
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
      query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
      query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
      const books = await query.exec()
      //console.log(books)
      res.render('books/index', {
        books: books,
        searchOptions: req.query
      })
      //console.log('i m here')
    } catch {
      res.redirect('/')
    }
  })

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)
  })
}

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

router.post('/', upload.single('cover'), async(req, res) => {
  //console.log(req.file)
  const fileName = req.file != null ? req.file.filename : null
  //console.log(fileName)
  const book = new Book({
      title: req.body.title,
      author: req.body.author,
      publishDate: new Date(req.body.publishDate),
      pageCount: req.body.pageCount,
      coverImageName: fileName,
      description: req.body.description
  })

  try {
    //console.log(book.coverImageName)
    const newBook = await book.save()
    res.redirect('books')
  } catch {
    if(book.coverImageName != null) {
      removeBookCover(book.coverImageName)
    }
    renderNewPage(res, book, true)
  }  
})

router.get('/:id',async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('books/show', {book: book})
  } catch(err) {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    const authors = await Author.find({})
    res.render('books/edit', {
      book: book,
      authors: authors
    })
  } catch (err) {
    res.redirect('/')
  }
})

router.put('/:id', upload.single('cover'), async (req, res) => {
  let book
  const fileName = req.file != null ? req.file.filename : null
  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (fileName != null) {
      book.coverImageName = fileName
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch(err) {
      console.log(err)
      if (book != null) {
        res.send('Error !! ')
      } else {
          res.redirect('/')
      }
  }

})

router.delete('/:id', async (req, res) => {
  let book
  try {
    console.log(book.id)
    await Book.deleteOne({_id: req.params.id})
    res.redirect('/books')
  } catch {
    if(book == null) {
      res.redirect('/')
  } else {
      res.redirect(`/books/${book.id}`)
  }
  }
})


module.exports = router