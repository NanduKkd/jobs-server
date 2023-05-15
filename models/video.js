const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
	owner: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	course: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	duration: {
		type: String,
		required: true,
	},
	path: {
		type: String,
		required: true,
	},
})

module.exports = mongoose.model('video', videoSchema)
