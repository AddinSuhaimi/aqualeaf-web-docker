import { Parser } from 'json2csv'
import jwt from 'jsonwebtoken'
import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const farmId = decoded.farm_id

    const { dateFrom, dateTo, species, quality } = req.body
    const { reportType } = req.body;
    const table = reportType === 'dried' ? 'scan_report_dried' : 'scan_report_fresh';
    const selectFields =
    reportType === 'dried'
      ? `sr.timestamp, ss.phylum, sr.quality_status, sr.impurity_status, sr.appearance AS status`
      : `sr.timestamp, ss.phylum, sr.quality_status, sr.impurity_status, sr.health_status AS status`;

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

    query += ` ORDER BY sr.timestamp DESC`

    const [rows] = await pool.query(query, params)

    // Format CSV
    const parser = new Parser({
      fields: [
        { label: 'Timestamp', value: row => new Date(row.timestamp).toLocaleString('en-MY') },
        { label: 'Species', value: 'species_name' },
        { label: 'Quality', value: 'quality_status' },
        { label: 'Impurity %', value: 'impurity_status' },
        { label: reportType === 'dried' ? 'Appearance' : 'Health', value: 'status' }
      ]
    })

    const csv = parser.parse(rows)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=seaweed_quality.csv')
    res.status(200).send(csv)
  } catch (err) {
    console.error('[CSV Export Error]:', err)
    res.status(500).json({ error: 'Failed to generate CSV' })
  }
}
