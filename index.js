const express = require('express')
const mongoose = require('mongoose')
const ws = require('express-ws')
const cookieParser = require('cookie-parser')
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

app.use((req, res, next) => {
	res.set({
		'Access-Control-Allow-Origin': 'http://localhost:3001',
		'Access-Control-Allow-Headers': req.headers['access-control-request-headers'],
		'Access-Control-Allow-Methods': req.headers['access-control-request-method'],
		'Access-Control-Allow-Credentials': true,
	})
	if(req.method==='OPTIONS') {
		res.status(200).end()
	} else
		next()
})

app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
ws(app)

app.use('/api', require('./routes'))
app.use('/socket', require('./socket'))

app.listen(process.env.PORT, () => {
	console.log('Server listening on port '+process.env.PORT)
})
