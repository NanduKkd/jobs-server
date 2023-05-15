const router = require('express').Router()
const path = require('path')
const fs = require('fs/promises')
const fsCallback = require('fs')
const mongoose = require('mongoose')
const courseModel = require('../models/course')
const videoModel = require('../models/video')

router.get('/tutor/:tutor', async(req, res) => {
	try {
		const list = await courseModel.aggregate([
			{$match: {owner: new mongoose.Types.ObjectId(req.params.tutor)}},
			{$lookup: {from: 'users', localField: 'owner', foreignField: '_id', as: 'owner'}},
			{$set: {owner: {$first: '$owner'}}},
			{$set: {owner: '$owner.name'}}
		]);
		res.status(200).json(list)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

const exts = {
	'video/mp4': 'mp4',
}

router.get('/', async(req, res) => {
	try {
		const list = await courseModel.aggregate([
			{$lookup: {from: 'users', localField: 'owner', foreignField: '_id', as: 'owner'}},
			{$set: {owner: {$first: '$owner'}}},
			{$set: {owner: '$owner.name'}}
		]);
		res.status(200).json(list)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.get('/:courseid', async(req, res) => {
	try {
		const courses = await courseModel.aggregate([
			{$match: {_id: new mongoose.Types.ObjectId(req.params.courseid)}},
			{$lookup: {from: 'users', localField: 'owner', foreignField: '_id', as: 'owner'}},
			{$set: {owner: {$first: '$owner'}}},
			{$lookup: {from: 'videos', localField: '_id', foreignField: 'course', as: 'videos'}},
		]);
		res.status(200).json(courses[0])
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})
router.get('/:courseid/:videoid', async(req, res) => {
	const video = await videoModel.findOne({_id: req.params.videoid})
	const videoPath = video.path;

	const videoStat = await fs.stat(videoPath);
	const fileSize = videoStat.size;
	const videoRange = req.headers.range;
	if (videoRange) {
		const parts = videoRange.replace(/bytes=/, "").split("-");
		const start = parseInt(parts[0], 10);
		const end = parts[1]
			? parseInt(parts[1], 10)
			: fileSize-1;
		const chunksize = (end-start) + 1;
		const file = fsCallback.createReadStream(videoPath, {start, end});

		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/mp4',
		};
		res.writeHead(206, head);
		file.pipe(res);
	} else {
		const head = {
			'Content-Length': fileSize,
			'Content-Type': 'video/mp4',
		};
		res.writeHead(200, head);
		fsCallback.createReadStream(videoPath).pipe(res);
	}
})

router.post('/', async(req, res) => {
	try {
		const course = new courseModel(req.body);
		await course.save()
		res.status(201).send(course._id)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.post('/:courseid/video', async(req, res) => {
	try {
		/*
		const mime = req.body.mime;
		const filename = Date.now()+'-'+Math.round(Math.random()*1e9)+'.'+exts[mime];
		const filepath = path.join('./files', filename)
		await fs.writeFile(filepath, req.body.file, 'base64')
		const video = new videoModel({
			...req.body,
			path: filepath
		});
		await video.save()
		res.status(201).send(video._id)
		*/
		const video = new videoModel(req.body);
		await video.save()
		res.status(201).send(video._id)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.patch('/:courseid/:videoid', async(req, res) => {
	try {
		await videoModel.updateOne({_id: req.params.videoid, course: req.params.courseid}, {$set: req.body});
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})
router.patch('/:courseid', async(req, res) => {
	try {
		await courseModel.updateOne({_id: req.params.courseid}, {$set: req.body});
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.delete('/:courseid', async(req, res) => {
	try {
		await courseModel.deleteOne({_id: req.params.courseid});
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.delete('/:courseid/:videoid', async(req, res) => {
	try {
		await videoModel.deleteOne({course: req.params.courseid, _id: req.params.videoid})
		res.status(204).send()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})
module.exports = router;
