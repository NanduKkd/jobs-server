const router = require('express').Router()
const axios = require('axios')
const { CHAT_API } = require('../utils/constants')

router.post('/send', async(req, res) => {
	const chatRes = await axios({
		url: 'https://api.openai.com/v1/chat/completions',
		method: 'POST',
		headers: {
			Authentication: 'Bearer '+CHAT_API,
			'Content-Type': 'application/json',
		},
		data: {
			model: "gpt-3.5-turbo",
			messages: [{role: "user", content: req.body.message}]
		}
	})
})

module.exports = router;
