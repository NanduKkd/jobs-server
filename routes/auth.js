const router = require('express').Router()
const userModel = require('../models/user')
const bcrypt = require('bcrypt')
const tokener = require('../utils/tokener')

router.get('/', async(req, res) => {
	if(req.cookies.user) {
		const userid = await tokener.verify(req.cookies.user)
		const user = await userModel.findOne({_id: userid})
		res.status(200).json(user)
	} else
		res.status(403).end()
})
router.post('/register', async(req, res) => {
	try {
		const existingUser = await userModel.findOne({$expr: {$or: [
			{$eq: ['$username', req.body.username]},
			{$eq: ['$email', req.body.email]},
			{$eq: ['$phone', req.body.phone]},
		]}})
		if(existingUser) {
			return res.status(409).end()
		}
		const hash = await bcrypt.hash(req.body.password, 8)
		const user = new userModel({...req.body, password: hash})
		await user.save()

		const tokenExpiryTs = Date.now()+30*24*60*60*1000

		const token = await tokener.sign(user._id, tokenExpiryTs)
		res.cookie('user', token, {expires: new Date(tokenExpiryTs)})
		res.status(201).json(user)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})
router.get('/login', async(req, res) => {
	try {
		const base64 = req.headers.authorization.split(' ')[1]
		const [username, password] = Buffer.from(base64, 'base64').toString('ascii').split(':')
		const user = await userModel.findOne({username})
		if(!user)
			return res.status(400).end()
		const compared = await bcrypt.compare(password, user.password)
		if(!compared)
			return res.status(400).end()

		const tokenExpiryTs = Date.now()+30*24*60*60*1000

		const token = await tokener.sign(user._id, tokenExpiryTs)
		res.cookie('user', token, {expires: new Date(tokenExpiryTs)})
		res.status(200).json(user)
	} catch (e) {
		console.error(e)
		res.status(500).end()
	}
})
router.get('/logout', (req, res) => {
	res.clearCookie('user')
	res.status(204).end()
})

module.exports = router;
