const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

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
  

router.post('/', async(req, res) => {

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishedDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        //coverImageName: fileName,
        description: req.bosy.description
    })

    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch {
        // if (book.coverImageName != null) {
        //     removeBookCover(book.coverImageName)
        //   }
          renderNewPage(res, book, true)
        }  
})


// async function renderNewPage(res, book, hasError = false) {
//     try {
//         const authors = await Author.find({})
//         const para = {
//             authors: authors,
//             book: book
//         }
//         if (hasError) para.errorMessage = 'Error'
//         res.rensder('books/', para)
//     } catch {
//         res.redirect('/books/new')
//     }
// }

router.get('/new', async (req, res) => {
   try{
    const authors = await Author.find({})
    const book = new Book()
    res.render('books/new', {
        authors: authors,
        book: book,
    })
   } catch {
        res.redirect('/books')
   }
    //res.send("new")
})


// router.get('/new', async (req, res) => {
//     renderNewPage(res, new Book())
//   })

module.exports = router