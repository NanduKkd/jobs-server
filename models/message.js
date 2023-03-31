const mongoose = require('mongoose')

const messageModel = new mongoose.Schema({
	from: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	to: {
		type: mongoose.SchemaTypes.ObjectId,
		required: true,
	},
	text: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	seenAt: Date,
})

module.exports = mongoose.model('message', messageModel)
