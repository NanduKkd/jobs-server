const router = require('express').Router()
const jobModel = require('../models/job')

function shortenText(txt) {
	const maxLength = 200;
	txt = txt.replace(/\n+/g, ' ')
	return txt.substring(0, maxLength)+(txt.length>maxLength?'...':'')
}

router.get('/recruiter/:recruiter', async(req, res) => {
	try {
		const list = await jobModel.find({recruiter: req.params.recruiter});
		res.status(200).json(list.map(i => ({title: i.title, _id: i._id, salary: i.salary, description: shortenText(i.description)})))
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.get('/', async(req, res) => {
	try {
		const list = await jobModel.find();
		res.status(200).json(list.map(i => ({title: i.title, _id: i._id, salary: i.salary, description: shortenText(i.description)})))
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.get('/:jobid', async(req, res) => {
	try {
		const job = await jobModel.findOne({_id: req.params.jobid});
		res.status(200).json(job)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.post('/', async(req, res) => {
	try {
		const job = new jobModel(req.body);
		await job.save()
		res.status(201).send(job._id)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.patch('/:jobid', async(req, res) => {
	try {
		await jobModel.updateOne({_id: req.params.jobid}, {$set: req.body});
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

router.delete('/:jobid', async(req, res) => {
	try {
		await jobModel.deleteOne({_id: req.params.jobid});
		res.status(204).end()
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})

module.exports = router;
