const mongoose = require('mongoose')
require('dotenv').config()
const userModel = require('./models/user')
const jobModel = require('./models/job')
const messageModel = require('./models/message')

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

mongoose.connect('mongodb://127.0.0.1:27017/'+process.env.DATABASE)
const database = mongoose.connection

database.on('error', err => {
	console.error(err);
})
database.once('connected', () => {
	rl.question("We have collections:\n1. Users\n2. Jobs\n3. Messages\nPick an option (1,2,3): ", ans => {
		let model;
		switch(ans) {
			case '1':
				model = userModel;
				break;
			case '2':
				model = jobModel;
				break;
			case '3':
				model = messageModel;
				break;
			default:
				console.log('Wrong option.')
				rl.close();
		}
		if(model)
			model.find().then(coll => {
				console.log(coll);
				rl.close()
				database.close()
			})
	})
})

