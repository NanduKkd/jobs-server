const router = require('express').Router()
const messageModel = require('../models/message')
const tokener = require('../utils/tokener')

const connectedUsers = {};

router.ws('/', async(ws, req) => {
	ws.user = await tokener.verify(req.cookies.user)
	console.log('opened', ws.user)
	connectedUsers[ws.user] = ws;
	ws.on('error', (e) => {
		console.log('error', ws.user, e)
	})
	ws.on('close', (e) => {
		delete connectedUsers[ws.user];
		console.log('closed', ws.user, e)
	})
	ws.on('message', async(msg) => {
		console.log('message came', msg)
		msg = JSON.parse(msg)
		switch(msg.type) {
			case 'time':
				const now = Date.now();
				ws.send(JSON.stringify({type: 'time', middle: now, start: msg.time}))
				break;
			case 'message':
				const chatMsg = new messageModel({from: ws.user, to: msg.chat, text: msg.text})
				await chatMsg.save()
				ws.send(JSON.stringify({type: "sent", message: {from: ws.user, chat: msg.chat, text: msg.text, createdAt: chatMsg.createdAt, _id: chatMsg._id}}))
				if(connectedUsers[msg.chat]) {
					connectedUsers[msg.chat].send(JSON.stringify({type: 'message', message: {from: ws.user, chat: ws.user, text: msg.text, createdAt: chatMsg.createdAt, _id: chatMsg._id}}))
				}
				break;
			case 'message_seen':
				console.log(msg.chat, ws.user)
				await messageModel.updateMany({from: msg.chat, to: ws.user}, {$set: {seenAt: new Date()}});
				if(connectedUsers[msg.chat]) {
					connectedUsers[msg.chat].send(JSON.stringify({type: 'seen', chat: ws.user}))
				}
				break;
			default:
				ws.send(JSON.stringify({ error: 'unknown type '+msg.type, type: 'error' }))
		}
	})
	ws.send(JSON.stringify({type: "start"}))
})
module.exports = router
