const express = require('express');
const db = require('../db');
const router = express.Router();
const utils = require('../utils');

// Add a category
router.post('/addcategory', (request, response) => {
    const { title, description } = request.body;
    const statement = `INSERT INTO category (title, description) VALUES (?, ?)`;
    db.pool.execute(statement, [title, description], (error, result) => {
        response.send(utils.createResult(error, result));
    });
});

// Get all categories
router.get('/allcategory', (request, response) => {
    const statement = `SELECT id, title, description FROM category`;
    db.pool.execute(statement, (error, result) => {
        response.send(utils.createResult(error, result));
    });
});

// Delete a category by ID
router.delete('/deletecategory/:id', (request, response) => {
    const { id } = request.params;
    const statement = `DELETE FROM category WHERE id = ?`;
    db.pool.execute(statement, [id], (error, result) => {
        response.send(utils.createResult(error, result));
    });
});

module.exports = router;
