const router = require('express').Router()
const messageModel = require('../models/message')
const mongoose = require('mongoose')

router.get("/:person", async(req, res) => {
	try {
		const msgs = await messageModel.aggregate([
			{$match: {$expr: {$or: [
				{$eq: ["$from", new mongoose.Types.ObjectId(req.params.person)]},
				{$eq: ["$to", new mongoose.Types.ObjectId(req.params.person)]},
			]}}},
			{$sort: {createdAt: -1}},
			{$set: {chat: {$cond: {if: {$eq: ["$from", new mongoose.Types.ObjectId(req.params.person)]}, then: '$to', else: '$from'}}}},
			{$group: {
				_id: '$chat',
				from: {$first: '$from'},
				text: {$first: '$text'},
				createdAt: {$first: '$createdAt'},
				seenAt: {$first: '$seenAt'},
				messageid: {$first: '$_id'},
				alertCount: {$sum: {$cond: {
					if: {$and: [
						{$ne: ['$from', new mongoose.Types.ObjectId(req.params.person)]},
						{$eq: [{$type: '$seenAt'}, 'missing']},
					]},
					then: 1,
					else: 0,
				}}},
			}},
			{$sort: {createdAt: -1}},
			{$lookup: {from: 'users', localField: '_id', foreignField: '_id', as: 'otherPerson'}},
			{$set: {otherPerson: {$first: '$otherPerson'}}},
			{$project: {
				'otherPerson.name': 1,
				'otherPerson.email': 1,
				'otherPerson.phone': 1,
				text: 1,
				createdAt: 1,
				seenAt: 1,
				from: 1,
				messageid: 1,
				alertCount: 1,
				_id: 1,
			}},
		])
		res.status(200).json(msgs)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})
router.get("/:person/:otherperson", async(req, res) => {
	try {
		const messages = await messageModel.find(
			{$expr: {$or: [
				{$and: [{$eq: ["$from", req.params.person]}, {$eq: ["$to", req.params.otherperson]}]},
				{$and: [{$eq: ["$to", req.params.person]}, {$eq: ["$from", req.params.otherperson]}]},
			]}},
			{text: 1, _id: 1, createdAt: 1, seenAt: 1, from: 1},
			{sort: {createdAt: -1}},
		)
		res.status(200).json({messages, alertCount: messages.reduce((a,i) => !i.seenAt && i.from.toString()===req.params.otherperson?a+1:a, 0)})
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})
router.post("/", async(req, res) => {
	try {
		const msg = new messageModel(req.body)
		await msg.save()
		res.status(201).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

module.exports = router;
