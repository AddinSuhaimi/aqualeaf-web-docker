// PATCH + DELETE /api/farm-accounts/[id]
import pool from '@/lib/db'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  const { id } = req.query
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  let adminEmail
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    adminEmail = decoded.email
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // DELETE route for hard delete
  if (req.method === 'DELETE') {
    try {
      const [result] = await pool.query(
        'DELETE FROM farm_account WHERE farm_id = ? AND account_status = ?',
        [id, 'deactivated']
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Deactivated farm account not found or already deleted' })
      }

      await pool.query(
        'INSERT INTO system_logs (event_type, actor_email, target_farm) VALUES (?, ?, ?)',
        ['DELETE_FARM', adminEmail, `farm_id:${id}`]
      )

      return res.status(200).json({ message: 'Farm account permanently deleted' })
    } catch (err) {
      console.error('Delete error:', err)
      return res.status(500).json({ message: 'Internal Server Error' })
    }
  }

  // PATCH routes for suspension and deactivation
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { action } = req.body
  const allowedActions = ['suspend', 'reinstate', 'deactivate']
  if (!allowedActions.includes(action)) {
    return res.status(400).json({ message: 'Invalid action' })
  }

  try {
    const statusMap = {
      suspend: 'suspended',
      reinstate: 'active',
      deactivate: 'deactivated'
    }
    const newStatus = statusMap[action]

    const [updateResult] = await pool.query(
      `UPDATE farm_account
       SET account_status = ?, last_updated = NOW()
       WHERE farm_id = ?`,
      [newStatus, id]
    )

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Farm account not found' })
    }

    const [rows] = await pool.query(
      `SELECT email, farm_name FROM farm_account WHERE farm_id = ?`,
      [id]
    )
    const target = rows[0]

    const eventType = `${action.toUpperCase()}_FARM`

    await pool.query(
      `INSERT INTO system_logs (event_type, actor_email, target_farm)
       VALUES (?, ?, ?)`,
      [eventType, adminEmail, target.farm_name]
    )

    res.status(200).json({ message: `Farm account ${action} success` })
  } catch (error) {
    console.error('Error updating farm account:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
