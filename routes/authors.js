const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')


router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors : authors,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/new', (req, res) => {
    res.render('authors/new', { author : new Author() })
})

router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.surname
    })
    try {
        const newAuthor = await author.save()
        res.redirect('authors')

    } catch {
        res.render('authors/new', {
        author: author,
        errorMessage: 'Error'
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()
        console.log(author)
        res.render('authors/show',{
            author: author,
            booksByAuthor: books
        })
    } catch(error) {
        console.log(error)
        res.redirect('/')
    }

  })
  
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author : author })
    } catch {
        res.redirect('/authors')
    }
  })
  
  router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.surname
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if (author == null){
            res.redirect('/')
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage : 'Error'
            })
        }
    }
  })
  
router.delete('/:id', async (req, res) => {
    let author
    try {
        await Author.deleteOne({_id: req.params.id})
        res.redirect('/authors')
    } catch(error) {
        console.log(error)
        if(author == null) {
            console.log("removed")
            res.redirect('/')
        } else {
            console.log('not removed')
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router