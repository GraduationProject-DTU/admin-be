const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyToken = (req, res, next) => {
    const token = req.headers.token
    if (!token) {
        return res.status(401).json({ mess: 'Not access token' })
    }

    const access_token = token.split(' ')[1]
    jwt.verify(access_token, process.env.ACCESS_TOKEN, (err, decode) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ mess: 'Unauthorrized' })
        }

        req.user = decode
        next()
    })


}

const isAdmin = (req, res, next) => {
    const { role } = req.user

    if (role !== 'admin') {
        return res.status(403).json({ mess: 'require role is admin' })
    }

    next()
}

module.exports = { verifyToken, isAdmin }