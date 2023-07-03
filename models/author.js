const mongoose = require('mongoose')

const authorSchema = new mongoose.SchemaType({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Author', authorSchema)
