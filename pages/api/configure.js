// pages/api/configure.js
import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const {
    action,          // "add" | "edit" | "delete"
    columnName,      // string
    dataType,        // string (for add/edit)
    constraints,     // optional string (e.g. "NOT NULL")
    editType,        // "name" | "dataType" (for edit)
    newValue         // string (new name or new data type)
  } = req.body

  const tableName = 'scan_report' // fixed table

  try {
    let query = ''

    switch (action) {
      case 'add':
        if (!columnName || !dataType) {
          return res.status(400).json({ error: 'Missing column name or data type' })
        }
        query = `
          ALTER TABLE \`${tableName}\`
          ADD \`${columnName}\` ${dataType} ${constraints || ''}
        `
        break

      case 'edit':
        if (!columnName || !editType || !newValue) {
          return res.status(400).json({ error: 'Missing parameters for edit' })
        }

        if (editType === 'name') {
          query = `
            ALTER TABLE \`${tableName}\`
            RENAME COLUMN \`${columnName}\` TO \`${newValue}\`
          `
        } else if (editType === 'dataType') {
          query = `
            ALTER TABLE \`${tableName}\`
            MODIFY \`${columnName}\` ${newValue}
          `
        } else {
          return res.status(400).json({ error: 'Invalid edit type' })
        }
        break

      case 'delete':
        if (!columnName) {
            return res.status(400).json({ error: 'Missing column name to delete' })
        }

        const protectedColumns = ['scan_id', 'farm_id', 'species_id']
        if (protectedColumns.includes(columnName)) {
            return res.status(403).json({ error: `Cannot delete protected column: ${columnName}` })
        }

        query = `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``
        break

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }

    await pool.query(query)
    return res.status(200).json({ message: 'Table updated successfully' })
  } catch (error) {
    console.error('[POST /api/configure]', error)
    return res.status(500).json({ error: 'Failed to update scan_reports table' })
  }
}
