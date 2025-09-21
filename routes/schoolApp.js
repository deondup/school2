const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection pool (configure with your PostgreSQL credentials)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

router.get('/', (req, res) => {
    res.render('school_app', { schoolData: null, districtData: null, provinceData: null });
});

router.post('/search', async (req, res) => {
    const { emisNumber } = req.body;
    try {
        const result = await pool.query('SELECT * FROM schools WHERE emis_number = $1', [emisNumber]);
        const schoolData = result.rows[0];
        res.render('school_app', { schoolData, districtData: null, provinceData: null });
    } catch (err) {
        console.error('Error fetching school data:', err);
        res.render('school_app', { schoolData: null, districtData: null, provinceData: null, error: 'Error fetching school data.' });
    }
});

router.get('/district/:districtCode', async (req, res) => {
    const { districtCode } = req.params;
    try {
        const totalSchoolsResult = await pool.query('SELECT COUNT(*) AS total_schools, SUM(num_students) AS total_students FROM schools WHERE district_code = $1', [districtCode]);
        const districtData = totalSchoolsResult.rows[0];

        // Fetch province code for the current district for the "view province data" link
        const provinceCodeResult = await pool.query('SELECT DISTINCT province_code FROM schools WHERE district_code = $1 LIMIT 1', [districtCode]);
        const provinceCodeForDistrict = provinceCodeResult.rows[0] ? provinceCodeResult.rows[0].province_code : null;

        res.render('school_app', {
            schoolData: null,
            districtData: { ...districtData, district_code: districtCode, province_code: provinceCodeForDistrict },
            provinceData: null
        });
    } catch (err) {
        console.error('Error fetching district data:', err);
        res.render('school_app', { schoolData: null, districtData: null, provinceData: null, error: 'Error fetching district data.' });
    }
});

router.get('/province/:provinceCode', async (req, res) => {
    const { provinceCode } = req.params;
    try {
        const totalSchoolsResult = await pool.query('SELECT COUNT(*) AS total_schools, SUM(num_students) AS total_students FROM schools WHERE province_code = $1', [provinceCode]);
        const provinceData = totalSchoolsResult.rows[0];
        res.render('school_app', { schoolData: null, districtData: null, provinceData: { ...provinceData, province_code: provinceCode } });
    } catch (err) {
        console.error('Error fetching province data:', err);
        res.render('school_app', { schoolData: null, districtData: null, provinceData: null, error: 'Error fetching province data.' });
    }
});

module.exports = router;