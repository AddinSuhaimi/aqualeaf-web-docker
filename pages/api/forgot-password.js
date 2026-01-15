// pages/api/forgot-password.js
import pool from '@/lib/db'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

// Example with Gmail OAuth2 transporter. Adjust if you use SendGrid, etc.
async function createTransporter() {
  // If you already have a configured transporter elsewhere, import that instead.
  // For example, if you use Gmail OAuth2:
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  })
  return transporter
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  // 1) See if a user with this email exists
  const [rows] = await pool.query('SELECT farm_id FROM farm_account WHERE email = ?', [email])
  if (rows.length === 0) {
    // Don’t reveal that the email is not in our system.
    return res.status(200).json({ message: 'If that email is registered, you’ll receive a reset link shortly.' })
  }

  const userId = rows[0].farm_id

  // 2) Generate a reset token & expiration (1 hour from now)
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour ahead

  // 3) Store reset_token and reset_expires in DB for that user
  await pool.query(
    'UPDATE farm_account SET reset_token = ?, reset_expires = ? WHERE farm_id = ?',
    [token, expires, userId]
  )

  // 4) Send reset email
  const transporter = await createTransporter()
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  try {
    await transporter.sendMail({
      from: `"AquaLeaf Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'AquaLeaf Password Reset',
      text: `You requested a password reset for your AquaLeaf account. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
      html: `
        <p>You requested a password reset for your AquaLeaf account.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    })
  } catch (err) {
    console.error('Error sending password reset email:', err)
    // We can still respond 200, because we don’t want to expose errors to the user:
    return res.status(200).json({ message: 'If that email is registered, you’ll receive a reset link shortly.' })
  }

  // 5) Return success message (always say the same, even if email not found)
  return res.status(200).json({ message: 'If that email is registered, you’ll receive a reset link shortly.' })
}
