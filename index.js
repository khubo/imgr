'use strict'
const express = require('express')
const bluebird = require('bluebird')
const mongoose = require('mongoose')
const multer = require('multer')
const app = express()

const PORT = 3000
const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb failed on you!')
  process.exit(1)
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images')
  },
  filename: (req, file, cb) => {
    let extension = file.mimetype.split('/')[1]
    let name = 'image-'+ Date.now().toString() +'.' + extension
    cb(null, name )
  }
})

const upload = multer({storage: storage})

//mongoose Schema
const ImageSchema = new mongoose.Schema({
  url: String,
  location: String
})

const Image = mongoose.model('Images', ImageSchema)


app.use('/', express.static('public'))
app.use('/images', express.static('images'))
app.post('/upload', upload.array("myFile", 1), uploadHandler)
app.get('/i/:url', sendImageHandler)

//Controllers
function uploadHandler(req, res, next) {
  let file = req.files[0]

  let filename = file.filename
  let randomString = generateRandomString()
  let image = createNewImage(filename, randomString)
  image.save().then(() => {
    res.send('http://localhost:3000/i/'+randomString)
  })
}

function sendImageHandler(req, res, next) {
  let link = req.params.url
  Image.findOne({url: link})
    .then((doc) => {
      res.redirect(doc.location)
    })
    .catch((err) => {
      res.redirect('/images/404.png')
    })
}

//services
function createNewImage(filename, randomString) {
  return new Image({
    url: randomString,
    location: '/images/'+filename
  })
}

function generateRandomString() {
  let ar = Date.now().toString().split('').slice(3, 13)
  let str = ""
  ar.forEach((el) => {
    str += String.fromCharCode(97 + parseInt(el))
  })
  return str
}

//connect to db and start server !
mongoose.connect("mongodb://localhost/test")
app.listen(PORT, () => {
  console.log('app started listening on port '+ PORT)
  console.log('May the force be with you!')
})
