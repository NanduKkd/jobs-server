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
		from: {
			type: Number,
			required: true,
		},
		to: {
			type: Number,
			required: true,
		},
	},
})

module.exports = mongoose.model('job', jobSchema)
