const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
	owner: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
})

module.exports = mongoose.model('post', postSchema)
