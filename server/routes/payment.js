const express = require('express');
const db = require('../db');
const router = express.Router();
const utils = require('../utils');

// Make payment and insert into payments table
router.post('/makepayment', (req, res) => {
    const { oid, amount, transaction_id, payment_method } = req.body;

    // Check if the order exists
    const checkOrderQuery = 'SELECT COUNT(*) AS count FROM orders WHERE id = ?';
    db.pool.execute(checkOrderQuery, [oid], (error, result) => {
        if (error) {
            console.error('Database error during order check:', error);
            return res.status(500).json({ status: 'error', error: 'Database error during order check.' });
        }

        if (result[0].count === 0) {
            return res.status(400).json({ status: 'error', error: 'Order does not exist' });
        }

        // Insert payment record
        const insertPaymentQuery = `
            INSERT INTO payments (oid, amount, status, transaction_id, payment_method, payment_date)
            VALUES (?, ?, 'done', ?, ?, NOW())
        `;
        db.pool.execute(insertPaymentQuery, [oid, amount, transaction_id, payment_method], (error, result) => {
            if (error) {
                console.error('Database error during payment insertion:', error);
                return res.status(500).json({ status: 'error', error: 'Database error during payment insertion.' });
            }

            res.json({ status: 'success', data: result });
        });
    });
});


module.exports = router;

