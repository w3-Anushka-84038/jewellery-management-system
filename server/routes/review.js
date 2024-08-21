const express = require('express');
const db = require('../db');
const router = express.Router();
const utils = require('../utils');

// Add a review
router.post('/addreview', (req, res) => {
    const { uid, pid, rating, comment } = req.body;

    // Check if all required fields are provided
    if (!uid || !pid || rating === undefined || comment === undefined) {
        return res.status(400).json({ error: 'All fields (uid, pid, rating, comment) are required' });
    }

    // Check if the product exists
    const checkProductStatement = `SELECT id FROM products WHERE id = ?`;
    db.pool.execute(checkProductStatement, [pid], (productError, productResult) => {
        if (productError) {
            console.error('Product check error:', productError);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (productResult.length === 0) {
            return res.status(400).json({ error: 'Product ID does not exist' });
        }

        // Check if the user exists
        const checkUserStatement = `SELECT id FROM users WHERE id = ?`;
        db.pool.execute(checkUserStatement, [uid], (userError, userResult) => {
            if (userError) {
                console.error('User check error:', userError);
                return res.status(500).json({ error: 'Internal server error' });
            }
            
            if (userResult.length === 0) {
                return res.status(400).json({ error: 'User ID does not exist' });
            }

            // Insert the review
            const insertStatement = `INSERT INTO review (uid, pid, rating, comment, created_on) VALUES (?, ?, ?, ?, Now())`;
            db.pool.execute(insertStatement, [uid, pid, rating, comment], (insertError, insertResult) => {
                if (insertError) {
                    console.error('Insert review error:', insertError);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.json({ status: 'success', data: insertResult });
            });
        });
    });
});

// Fetch reviews for a specific product
router.get('/productwisereview', (req, res) => {
    const { pid } = req.query;
    
    if (!pid) {
        return res.status(400).json({ status: 'error', error: 'Product ID (pid) is required' });
    }

    console.log('Fetching reviews for product ID:', pid);

    const statement = 
    `SELECT
        u.firstname AS username,
        p.name AS product_name,
        c.title AS category_title,
        r.rating,
        r.comment
    FROM
        review r
        INNER JOIN users u ON r.uid = u.id
        INNER JOIN products p ON r.pid = p.id
        INNER JOIN category c ON p.cid = c.id
    WHERE
        r.pid = ?`;

    db.pool.execute(statement, [pid], (error, result) => {
        if (error) {
            console.error('Error fetching reviews:', error);
            res.status(500).json({ status: 'error', error: 'Internal server error' });
        } else {
            res.json({ status: 'success', data: result });
        }
    });
});

module.exports = router;

