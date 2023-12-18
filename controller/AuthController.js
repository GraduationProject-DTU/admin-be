const User = require('../model/User')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const sendMail = require('../utils/sendMail')
require('dotenv').config()

// Khi login thêm các refresh token vào arr
let refreshTokens = []

class AuthController {
    // [POST] / users/ register
    async register(req, res) {
        try {
            const { email, firstname, lastname, phone, password, rePassword, role } = req.body

            const users = await User.find({})
            const checkEmail = users.find((e) => e.email === email)

            if (checkEmail) {
                return res.status(403).json({ mess: 'Email already exists' })
            }

            if (password !== rePassword) {
                return res.status(403).json({ mess: 'Password not match' })
            }



            const genSalt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, genSalt)

            const newUser = await new User({
                email,
                firstname,
                lastname,
                phone,
                password: hashPassword,
                role
            })

            const user = await newUser.save()

            res.status(200).json(user)
        } catch (error) {
            res.status(500).json({ error })
        }
    }

    //[POST] /users/login
    async login(req, res) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(403).json({ mess: 'email or password empty' })
            }

            const user = await User.findOne({ email: email })
            if (!user) {
                return res.status(403).json({ mess: 'email is not correct ' })
            }

            const passwordCompare = await bcrypt.compare(password, user.password)

            if (passwordCompare) {
                //access token
                const access_token = jwt.sign(
                    {
                        _id: user.id,
                        email: user.email,
                        role: user.role
                    },
                    process.env.ACCESS_TOKEN,
                    { expiresIn: '7d' }
                )

                // refresh token
                const refresh_token = jwt.sign(
                    {
                        email: user.email,
                        role: user.role
                    },
                    process.env.REFRESH_TOKEN,
                    { expiresIn: '14d' }
                )

                //KHI LOGIN THÌ PUSH refresh_token TOKEN HIỆN TẠI
                refreshTokens.push(refresh_token)

                //LƯU REFESHTOKEN VÀO COOKIES
                res.cookie('refreshToken', refresh_token, {
                    httpOnly: true,
                    scure: false,
                    path: '/',
                    sameSite: 'strict'
                })

                // if (refresh_token) {
                //     await User.findByIdAndUpdate(
                //         { _id: user._id },
                //         { $set: { refresh_token: refresh_token } }
                //     )
                // }

                return res.status(200).json({
                    mess: 'Login successfully',
                    user,
                    access_token,
                    refresh_token
                })
            } else {
                return res.status(403).json({ mess: 'password is wrong' })
            }
        } catch (error) {
            res.status(500).json({ error })
        }
    }

    // REFRESH TOKEN
    async requestRefreshToken(req, res) {
        //Take refresh token from user
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(401).json('you are not authenticated')
        }

        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json('Refresh token is not valid')
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
            if (err) {
                return res.status(403).json(err)
            }

            refreshTokens = refreshTokens.filter((token) => token !== refreshToken)

            //CREATE NEW ACCESS TOKEN  ,REFRESH TOKEN
            const newAccessToken = jwt.sign(
                {
                    _id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: '7d' }
            )

            const newRefreshToken = jwt.sign(
                {
                    email: user.email,
                    role: user.role
                },
                process.env.REFRESH_TOKEN,
                { expiresIn: '14d' }
            )

            // LƯU REFRESH TOKEN VÀO MẢNG
            refreshTokens.push(newRefreshToken)

            // LƯU refresh token LẠI Ở COOKIES
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                scure: false,
                path: '/',
                sameSite: 'strict'
            })

            res.status(200).json({ accessToken: newAccessToken })
        })
    }

    async changePassword(req, res) {
        try {
            const { newPassword, oldPassword } = req.body
            const { _id } = req.user

            const user = await User.findById({ _id })


            //compare password
            const passwordCompare = await bcrypt.compare(oldPassword, user.password)
            if (!passwordCompare) {
                return res.status(400).json({ mess: 'Mật khẩu hiện tại không đúng' })
            }

            // hash new password and save into db
            const genSalt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(newPassword, genSalt)
            await User.findByIdAndUpdate({ _id }, { $set: { password: hashPassword } })

            res.status(200).json({ mess: 'Đổi mật khẩu thành công' })
        } catch (error) {
            res.status(500).json({ error: error })
        }
    }

    async logout(req, res) {
        res.clearCookie('refreshToken')
        refreshTokens = refreshTokens.filter((token) => token != req.cookies.refreshToken)
        res.status(200).json('LOGGED OUT !!')
    }

    // Client gửi email
    // Server check email có hợp lệ hay không => Gửi mail + kèm theo link (password change token)
    // Client check mail => click link
    // Client gửi api kèm token
    // Check token có giống với token mà server gửi mail hay không
    // Change password

    async forgotPassword(req, res) {
        const { email } = req.body
        try {
            if (!email) {
                return res.status(404).json({ mess: 'Missing email' })
            }

            const user = await User.findOne({ email })

            if (!user) {
                return res.status(404).json({ mess: 'user not found' })
            }

            const resetToken = user.createPasswordChangeToken()

            // save lại user để update 2 filed passwordResetToken và passwordResetExpires
            await user.save()

            const html = `xin vui lòng click vào link dưới để thay đổi mật khẩu của bạn ! 
            link này sẽ hết hạn sau 15 phút
            <a href=${process.env.URL_SERVER}/auth/reset-password/${resetToken}>Click Here</a>
            `

            const data = {
                email,
                html
            }

            const result = await sendMail(data)

            return res.status(200).json({
                result
            })
        } catch (error) {
            res.status(500).json({ error: error })
        }
    }

    async resetPassword(req, res) {
        try {
            const { password, token } = req.body

            if (!password || !token) {
                return res.status(403).json({ mess: 'Missing imputs' })
            }

            const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
            const user = await User.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } })

            if (!user) {
                return res.status(400).json({ mess: 'Invalid reset token' })
            }

            // hash lại password để lưu vào db

            const genSalt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, genSalt)

            user.password = hashPassword
            user.passwordResetToken = undefined
            user.passwordChangeAt = Date.now()
            user.passwordResetExpires = undefined

            await user.save()

            res.status(200).json({ mess: 'reset password successfully ' })
        } catch (error) {
            res.status(500).json({ error: error })
        }
    }
}

module.exports = new AuthController()
