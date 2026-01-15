// pages/api/login.js
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' })

  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ message: 'Missing fields' })

  const [rows] = await pool.query(
    'SELECT admin_id, username, email, password FROM administrator WHERE email = ?',
    [email]
  )
  if (!rows.length) {
    await pool.query(
      'INSERT INTO login_attempt (timestamp, status) VALUES (NOW(), \'Invalid credentials\')',
    )
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const admin = rows[0]
  const valid = await bcrypt.compare(password, admin.password)
  if (!valid) {
    await pool.query(
      `INSERT INTO system_logs (event_type, actor_email)
      VALUES (?, ?)`,
      ['LOGIN_ADMIN_FAILED', email]
    )
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const token = jwt.sign(
    {
      admin_id: admin.admin_id,
      email: admin.email,
      username: admin.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.setHeader('Set-Cookie', [
    `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`
  ])
  // INSERT SYSTEM LOG
  await pool.query(
    `INSERT INTO system_logs (event_type, actor_email)
    VALUES (?, ?)`,
    ['LOGIN_ADMIN', email]
  )

  res.status(200).json({ message: 'Logged in' })
}