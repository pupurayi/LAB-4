const bodyParser = require('body-parser');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// PostgreSQL database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lab-4',
    password: 'Letmein1!',
    port: 5432,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Create a new project
app.post('/projects', async (req, res) => {
    const { name, description, department, budget } = req.body;
    const result = await pool.query(
        'INSERT INTO projects(name, description, department, budget) VALUES($1, $2, $3, $4) RETURNING *',
        [name, description, department, budget]
    );
    res.status(201).json(result.rows[0]);
});

// Read all projects
app.get('/projects', async (req, res) => {
    const result = await pool.query('SELECT * FROM projects');
    res.json(result.rows);
});

// Read a single project
app.get('/projects/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) {
        return res.status(404).send('Project not found');
    }
    res.json(result.rows[0]);
});

// Update a project
app.put('/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, department, budget } = req.body;
    const result = await pool.query(
        'UPDATE projects SET name = $1, description = $2, department = $3, budget = $4 WHERE id = $5 RETURNING *',
        [name, description, department, budget, id]
    );
    if (result.rows.length === 0) {
        return res.status(404).send('Project not found');
    }
    res.json(result.rows[0]);
});

// Delete a project
app.delete('/projects/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
        return res.status(404).send('Project not found');
    }
    res.status(200).send('Project Deleted Successfully');
});