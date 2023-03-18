const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect('mongodb://127.0.0.1:27017/'+process.env.DATABASE)
const database = mongoose.connection

database.on('error', err => {
	console.error(err);
})
database.once('connected', () => {
	console.log('Database connected')
})


const app = express()

app.get('/', (req, res) => res.send("Server running successfully!"))

app.listen(process.env.PORT, () => {
	console.log('Server listening on port '+process.env.PORT)
})
