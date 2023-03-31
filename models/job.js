const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
	recruiter: {
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
	salary: {
		type: Number,
		required: true,
	},
})

module.exports = mongoose.model('job', jobSchema)
