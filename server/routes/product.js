const express = require('express');
const path = require('path');
const multer = require('multer');
const db = require('../db');
const utils = require('../utils');
const router = express.Router();

const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files

// Add a product
router.post('/addproduct', upload.single('image'), (req, res) => {
    const { name, cid, price, material } = req.body;
    const image = req.file; // Access uploaded file

    if (!name || !cid || !price || !material || !image) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const statement = `INSERT INTO products (name, cid, price, image, material, created_on) VALUES (?, ?, ?, ?, ?, Now())`;
    const imagePath = image.path; // Path to the uploaded file

    db.pool.execute(statement, [name, cid, price, imagePath, material], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ status: 'success', data: result });
    });
});

// Route to get all products
router.get('/allproducts', (req, res) => {
    const statement = `SELECT p.id, p.name, p.price, p.image, p.material, c.title AS category, p.created_on 
                    FROM products p 
                    JOIN category c ON p.cid = c.id`;
    db.pool.execute(statement, (error, result) => {
        res.send(utils.createResult(error, result));
    });
});

// Route to delete a product
router.delete('/deleteproduct/:id', (req, res) => {
    const { id } = req.params;
    const statement = `DELETE FROM products WHERE id = ?`;
    db.pool.execute(statement, [id], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ status: 'success', data: result });
    });
});

// Route to update a product
router.put('/updateproduct/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, price, material } = req.body;
    const image = req.file;
    let statement = `UPDATE products SET name = ?, price = ?, material = ? WHERE id = ?`;
    let params = [name, price, material, id];

    if (image) {
        statement = `UPDATE products SET name = ?, price = ?, material = ?, image = ? WHERE id = ?`;
        params.splice(3, 0, image.path);
    }

    db.pool.execute(statement, params, (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ status: 'success', data: result });
    });
});
router.get('/productdetails/:id', (req, res) => {
    const { id } = req.params;
    const statement = `SELECT p.id, p.name, p.price, p.image, p.material, c.title AS category, p.created_on 
                       FROM products p 
                       JOIN category c ON p.cid = c.id 
                       WHERE p.id = ?`;
    
    db.pool.execute(statement, [id], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: error.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ status: 'success', data: result[0] });
    });
});

module.exports = router;

