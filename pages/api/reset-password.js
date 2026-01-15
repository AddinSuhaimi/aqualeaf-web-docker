// pages/api/reset-password.js
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { token, newPassword } = req.body
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' })
  }

  // 1) Look up user by reset_token, ensure not expired
  const [rows] = await pool.query(
    'SELECT farm_id, reset_expires FROM farm_account WHERE reset_token = ?',
    [token]
  )
  if (rows.length === 0) {
    return res.status(400).json({ message: 'Invalid or expired token' })
  }

  const user = rows[0]
  const now = new Date()
  if (!user.reset_expires || new Date(user.reset_expires) < now) {
    return res.status(400).json({ message: 'Token has expired' })
  }

  // 2) Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // 3) Update the user: set new password, clear reset_token & reset_expires
  await pool.query(
    `UPDATE farm_account SET password = ?, reset_token = NULL, reset_expires = NULL WHERE farm_id = ?`,
    [hashedPassword, user.farm_id]
  )

  // 4) Optionally: you could send a confirmation email here that the password was changed.

  return res.status(200).json({ message: 'Password has been reset successfully' })
}
