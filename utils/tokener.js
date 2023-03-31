const jwt = require('jsonwebtoken')

exports.sign = (_id, expTs) => new Promise((resolve, reject) => {
	jwt.sign({_id, exp: Math.floor(expTs/1000)}, process.env.SECRET_KEY, {}, (err, token) => {
		if(err) reject(err)
		else resolve(token)
	})
})

exports.verify = (token) => new Promise((resolve, reject) => {
	jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
		if(err) reject(err)
		else resolve(decoded._id)
	})
})
