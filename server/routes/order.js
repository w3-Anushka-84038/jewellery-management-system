const express = require('express');
const db = require('../db');
const router = express.Router();
const utils = require('../utils');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/addorder', (request, response) => {
    const { uid, pid, total_amount } = request.body;

    // Check if the product exists before inserting the order
    const checkProduct = `SELECT COUNT(*) AS count FROM products WHERE id = ?`;
    db.pool.execute(checkProduct, [pid], (error, result) => 
    {
        if (error) {
            response.send(utils.createResult(error));
        } else if (result[0].count === 0) {
            response.send(utils.createResult({ message: 'Product does not exist' }));
        } else {
            const statement = `insert into orders(uid, pid, total_amount,created_on) values (?,?,?,Now())`;
            db.pool.execute(statement, [uid, pid, total_amount], (error, result) => {
                response.send(utils.createResult(error, result));
            });
        }
    });
});

router.delete('/deleteorder/:id', (request, response) => {
    const { id } = request.params;

    const statement = `DELETE FROM orders WHERE id = ?`;

    db.pool.execute(statement, [id], (error, result) => {
        response.send(utils.createResult(error, result));
    });
});

router.put('/updateorder/:id', (request, response) => {
    const { id } = request.params;
    const { status } = request.body;

    const statement = `UPDATE orders SET status = ? WHERE id = ?`;

    db.pool.execute(statement, [status, id], (error, result) => {
        if (error) {
            console.error('Error updating order status:', error);
            response.send(utils.createResult(error, result));
        } else {
            response.send(utils.createResult(null, result));
        }
    });
});


// src/routes/orders.js
// src/routes/orders.js
// src/routes/orders.js
router.get('/userorders/:uid', (request, response) => {
    const { uid } = request.params;
    const statement = `
        SELECT 
            o.id AS orderId, 
            o.total_amount AS totalAmount, 
            p.name AS productName, 
            p.type AS productType, 
            p.price AS productPrice, 
            p.image AS productImage, 
            p.material AS productMaterial,
            o.created_on AS createdOn,
            o.status
        FROM 
            orders o
        INNER JOIN 
            order_items oi ON o.id = oi.order_id
        INNER JOIN 
            products p ON oi.product_id = p.id
        WHERE 
            o.uid = ?
    `;

    db.pool.execute(statement, [uid], (error, result) => {
        if (error) {
            console.error('Database query error:', error); // Detailed error logging
            return response.status(500).json({ status: 'error', error: 'Database query failed' });
        }
        response.json({ status: 'success', data: result });
    });
});


router.get('/allorders', (request, response) => {
    const statement = `
        SELECT 
            o.id AS orderId, 
            u.firstname AS username, 
            p.name AS productName, 
            o.total_amount, 
            o.created_on 
        FROM 
            orders o
        INNER JOIN 
            users u ON o.uid = u.id
        INNER JOIN 
            products p ON o.pid = p.id
    `;
    db.pool.execute(statement, (error, result) => {
        response.send(utils.createResult(error, result));
    });
});


module.exports = router;
