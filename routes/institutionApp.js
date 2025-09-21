const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

router.get('/', async (req, res) => {
    try {
        const institutionsResult = await pool.query('SELECT institution_id, institution_name FROM institutions ORDER BY institution_name');
        const institutions = institutionsResult.rows;
        res.render('institution_app', { institutions, institutionData: null });
    } catch (err) {
        console.error('Error fetching institutions:', err);
        res.render('institution_app', { institutions: [], institutionData: null, error: 'Error fetching institutions.' });
    }
});

router.post('/select', async (req, res) => {
    const { institutionId } = req.body;
    try {
        // Get institution name for display
        const institutionNameResult = await pool.query('SELECT institution_name FROM institutions WHERE institution_id = $1', [institutionId]);
        const institutionName = institutionNameResult.rows[0] ? institutionNameResult.rows[0].institution_name : 'Unknown Institution';

        // Applications per faculty and course
        const applicationsResult = await pool.query(`
            SELECT
                faculty_name,
                course_name,
                COUNT(*) AS num_applications
            FROM
                applications
            WHERE
                institution_id = $1
            GROUP BY
                faculty_name, course_name
            ORDER BY
                faculty_name, course_name;
        `, [institutionId]);
        const applicationsPerCourse = applicationsResult.rows;

        // Count of distinct student numbers
        const distinctStudentsResult = await pool.query(`
            SELECT
                COUNT(DISTINCT student_number) AS distinct_students_count
            FROM
                applications
            WHERE
                institution_id = $1;
        `, [institutionId]);
        const distinctStudentsCount = distinctStudentsResult.rows[0].distinct_students_count;

        const institutionsResult = await pool.query('SELECT institution_id, institution_name FROM institutions ORDER BY institution_name');
        const institutions = institutionsResult.rows;

        res.render('institution_app', {
            institutions,
            institutionData: {
                name: institutionName,
                applications: applicationsPerCourse,
                distinctStudents: distinctStudentsCount
            }
        });

    } catch (err) {
        console.error('Error fetching institution data:', err);
        const institutionsResult = await pool.query('SELECT institution_id, institution_name FROM institutions ORDER BY institution_name');
        const institutions = institutionsResult.rows;
        res.render('institution_app', { institutions, institutionData: null, error: 'Error fetching institution data.' });
    }
});

module.exports = router;