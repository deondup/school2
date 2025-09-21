const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config(); // For environment variables

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, PDFs)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // For parsing form data

// Routes
app.get('/', (req, res) => {
    res.render('index', { defaultPdf: '/pdfs/default.pdf' });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

// Include sub-application routers
const schoolAppRouter = require('./routes/schoolApp');
const institutionAppRouter = require('./routes/institutionApp');
app.use('/school-application', schoolAppRouter);
app.use('/institution-application', institutionAppRouter);

// Basic 404 handler
app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});