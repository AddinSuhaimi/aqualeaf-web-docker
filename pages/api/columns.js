// pages/api/columns.js
import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { table } = req.query

  if (!table) {
    return res.status(400).json({ error: 'Missing table name' })
  }

  try {
    const [rows] = await pool.query(`
      SELECT COLUMN_NAME
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
    `, [table])

    return res.status(200).json({ columns: rows })
  } catch (error) {
    console.error('[GET /api/columns]', error)
    return res.status(500).json({ error: 'Failed to fetch column names' })
  }
}