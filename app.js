// require package
const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const Restaurant = require('./models/restaurant')

// connect mongDB by mongoose
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})

// require template engine
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({extended:true}))

// setting static files
app.use(express.static('public'))

// main page
app.get('/', (req, res) => {
  Restaurant.find()
    .lean()
    .then(restaurants => res.render('index', { restaurants }))
    .catch(error => console.log(error))
})

// create restaurants
app.get('/restaurants/new', (req,res) => {
  return res.render('new')
})

app.post('/restaurants', (req,res) => {
  const newRestaurant = req.body
  return Restaurant.create(newRestaurant)
  .then(() => res.redirect('/'))
  .catch(error => console.log(error))
})

// read details
app.get('/restaurants/:id', (req,res) => {
  const id = req.params.id
  return Restaurant.findById(id)
  .lean()
  .then(restaurant => res.render('detail', {restaurant}))
  .catch(error => console.log(error))
})

// edit restaurant
app.get('/restaurants/:id/edit', (req,res) => {
  const id = req.params.id
  return Restaurant.findById(id)
  .lean()
  .then(restaurant => res.render('edit', {restaurant}))
  .catch(error => console.log(error))
})

app.post('/restaurants/:id/edit', (req,res) => {
  const id = req.params.id
  return Restaurant.findById(id)
  .then(restaurant => {
    restaurant.name = req.body.name
    restaurant.category = req.body.category
    restaurant.image = req.body.image
    restaurant.rating = req.body.rating
    restaurant.location = req.body.location
    restaurant.phone = req.body.phone
    restaurant.description = req.body.description
    return restaurant.save()
  })
  .then(() => res.redirect('/'))
  .catch(error => console.log(error))
})

// delete restaurant
app.post('/restaurants/:id/delete', (req,res) => {
  const id = req.params.id
  return Restaurant.findById(id)
  .then(restaurant => restaurant.remove())
  .then(() => res.redirect('/'))
  .catch(error => console.log(error))
})

app.listen(3000, () => {
  console.log('the app is running on http://localhost:3000')
})