const router = require('express').Router()
const mongoose = require('mongoose')
const postModel = require('../models/post')

function shortenText(txt) {
	const maxLength = 200;
	txt = txt.replace(/\n+/g, ' ')
	return txt.substring(0, maxLength)+(txt.length>maxLength?'...':'')
}

router.get('/owner/:owner', async(req, res) => {
	try {
		const list = await postModel.find({owner: req.params.owner});
		res.status(200).json(list.map(i => ({title: i.title, _id: i._id, description: shortenText(i.description)})))
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.get('/', async(req, res) => {
	try {
		const list = await postModel.aggregate([
			{$lookup: {from: 'users', localField: 'owner', foreignField: '_id', as: 'owner'}},
			{$set: {owner: {$first: '$owner'}}},
			{$set: {owner: '$owner.name'}}
		]);
		res.status(200).json(list.map(i => ({title: i.title, _id: i._id, description: shortenText(i.description), owner: i.owner})))
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.get('/:postid', async(req, res) => {
	try {
		const posts = await postModel.aggregate([
			{$match: {_id: new mongoose.Types.ObjectId(req.params.postid)}},
			{$lookup: {from: 'users', localField: 'owner', foreignField: '_id', as: 'owner'}},
			{$set: {owner: {$first: '$owner'}}},
		]);
		res.status(200).json(posts[0])
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.post('/', async(req, res) => {
	try {
		const post = new postModel(req.body);
		await post.save()
		res.status(201).send(post._id)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.patch('/:postid', async(req, res) => {
	try {
		await postModel.updateOne({_id: req.params.postid}, {$set: req.body});
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.delete('/:postid', async(req, res) => {
	try {
		await postModel.deleteOne({_id: req.params.postid});
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

module.exports = router;
