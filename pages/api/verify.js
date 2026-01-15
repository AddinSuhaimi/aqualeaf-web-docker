// pages/api/verify.js
import pool from '@/lib/db'

export default async function verifyHandler(req, res) {
  const { token } = req.query
  if (!token) return res.status(400).json({ success: false, message: 'Token missing' })

  // Verify token and fetch user
  const [rows] = await pool.query(
    'SELECT farm_id FROM farm_account WHERE verification_token = ? AND is_verified = 0',
    [token]
  )
  if (!rows.length) return res.status(400).json({ success: false, message: 'Invalid or expired token' })

  // Update user as verified
  await pool.query(
    'UPDATE farm_account SET is_verified = 1, verification_token = NULL WHERE farm_id = ?',
    [rows[0].farm_id]
  )

  // Return on successful verification
  return res.status(200).json({ success: true, message: 'Email verified' })
}