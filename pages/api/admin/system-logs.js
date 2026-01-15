// GET /api/system-logs
import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { eventType, actorEmail, targetFarm, startDate, endDate } = req.query

  const conditions = []
  const params = []

  if (eventType) {
    conditions.push('event_type = ?')
    params.push(eventType)
  }

  if (actorEmail) {
    conditions.push('actor_email LIKE ?')
    params.push(`%${actorEmail}%`)
  }

  if (targetFarm) {
    conditions.push('target_farm LIKE ?')
    params.push(`%${targetFarm}%`)
  }

  if (startDate && endDate) {
    conditions.push('timestamp BETWEEN ? AND ?')
    params.push(startDate)
    params.push(endDate)
  } else if (startDate) {
    conditions.push('timestamp >= ?')
    params.push(startDate)
  } else if (endDate) {
    conditions.push('timestamp <= ?')
    params.push(endDate)
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

  try {
    const [rows] = await pool.query(
      `SELECT log_id, event_type, actor_email, target_farm, timestamp
       FROM system_logs
       ${whereClause}
       ORDER BY timestamp DESC`,
      params
    )

    res.status(200).json({ logs: rows })
  } catch (error) {
    console.error('Error fetching system logs:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
