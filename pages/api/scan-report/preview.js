// pages/api/scan-report/preview.js
import jwt from 'jsonwebtoken'
import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('[Preview] Decoded JWT:', decoded)

    const farmId = decoded.farm_id
    const { species, quality, dateFrom, dateTo } = req.body
    const { reportType } = req.body;
    const table = reportType === 'dried' ? 'scan_report_dried' : 'scan_report_fresh';
    const selectFields =
    reportType === 'dried'
      ? `sr.scan_id, sr.timestamp, sr.impurity_status, sr.appearance AS status, sr.quality_status, ss.phylum`
      : `sr.scan_id, sr.timestamp, sr.impurity_status, sr.health_status AS status, sr.quality_status, ss.phylum`;

    let query = `
      SELECT ${selectFields} 
      FROM ${table} sr
      JOIN seaweed_species ss ON sr.species_id = ss.species_id
      WHERE sr.farm_id = ?
    `
    const params = [farmId]

    if (species) {
      query += ` AND sr.species_id = ?`
      params.push(species)
    }
    if (quality) {
      query += ` AND sr.quality_status = ?`
      params.push(quality)
    }
    if (dateFrom && dateTo) {
      query += ` AND sr.timestamp BETWEEN ? AND ?`
      params.push(dateFrom, dateTo)
    }

    query += ` ORDER BY sr.timestamp DESC LIMIT 10`

    const [rows] = await pool.query(query, params)

    console.log('[Preview] SQL Query:', query)
    console.log('[Preview] SQL Params:', params)
    console.log('Query Result:', rows)

    res.status(200).json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error fetching preview data' })
  }
}

