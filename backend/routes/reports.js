const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Daily summary report - Manager only
router.get('/daily-summary', authenticateToken, async (req, res) => {
  try {
    // Check if user is manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Access denied. Manager role required.' });
    }

    const { date, employee_id } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required (YYYY-MM-DD format)' });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
    }

    let query = `
      SELECT 
        u.id as employee_id,
        u.name as employee_name,
        COUNT(c.id) as total_checkins,
        COUNT(DISTINCT c.client_id) as clients_visited,
        COALESCE(SUM(
          CASE 
            WHEN c.checkout_time IS NOT NULL 
            THEN (julianday(c.checkout_time) - julianday(c.checkin_time)) * 24
            ELSE 0 
          END
        ), 0) as total_hours
      FROM users u
      LEFT JOIN checkins c ON u.id = c.employee_id 
        AND DATE(c.checkin_time) = ?
      WHERE u.role = 'employee'
    `;
    
    const params = [date];

    if (employee_id) {
      query += ' AND u.id = ?';
      params.push(employee_id);
    }

    query += ' GROUP BY u.id, u.name ORDER BY u.name';

    const [employees] = await pool.execute(query, params);

    // Calculate team totals
    const teamStats = employees.reduce((acc, emp) => ({
      total_employees: acc.total_employees + 1,
      total_checkins: acc.total_checkins + emp.total_checkins,
      total_clients_visited: acc.total_clients_visited + emp.clients_visited,
      total_hours: acc.total_hours + emp.total_hours
    }), { total_employees: 0, total_checkins: 0, total_clients_visited: 0, total_hours: 0 });

    res.json({
      success: true,
      data: {
        date,
        team_summary: {
          total_employees: teamStats.total_employees,
          total_checkins: teamStats.total_checkins,
          total_clients_visited: teamStats.total_clients_visited,
          total_hours: Math.round(teamStats.total_hours * 100) / 100
        },
        employee_breakdown: employees.map(emp => ({
          employee_id: emp.employee_id,
          employee_name: emp.employee_name,
          checkins: emp.total_checkins,
          clients_visited: emp.clients_visited,
          working_hours: Math.round(emp.total_hours * 100) / 100
        }))
      }
    });

  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate daily summary' });
  }
});

module.exports = router;
