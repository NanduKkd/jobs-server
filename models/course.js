const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
	owner: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: false,
	},
})

module.exports = mongoose.model('course', courseSchema)
