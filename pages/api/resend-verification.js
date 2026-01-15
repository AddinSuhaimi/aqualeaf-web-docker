// pages/api/resend-verification.js
import pool from '@/lib/db'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

// OAuth2 setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

async function sendVerificationEmail(email, token) {
  const accessToken = await oAuth2Client.getAccessToken()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token || accessToken,
    },
  })

  const verifyUrl = `${process.env.NEXT_PUBLIC_URL}/verify?token=${token}`

  await transporter.sendMail({
    from: `"AquaLeaf Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Resend: Verify your AquaLeaf account',
    html: `<p>Please verify your account:</p>
           <p><a href="${verifyUrl}">Click here to verify</a></p>`
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false })

  const { email } = req.body
  if (!email)
    return res.status(400).json({ success: false, message: 'Email required' })

  const [rows] = await pool.query(
    'SELECT farm_id, is_verified, verification_token FROM farm_account WHERE email = ?',
    [email]
  )
  if (!rows.length)
    return res.status(404).json({ success: false, message: 'Account not found' })

  const user = rows[0]

  if (user.is_verified === 1)
    return res.status(400).json({ success: false, message: 'Already verified' })

  // Generate new token
  const newToken = crypto.randomBytes(32).toString('hex')
  await pool.query(
    'UPDATE farm_account SET verification_token = ? WHERE farm_id = ?',
    [newToken, user.farm_id]
  )

  try {
    await sendVerificationEmail(email, newToken)
    return res.status(200).json({ success: true, message: 'Verification email resent' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Failed to send email' })
  }
}
