const express=require('express')
const db=require('../db')
const router=express.Router()
const utils=require('../utils')
const jwt=require('jsonwebtoken')
const config=require('../config')
router.post('/addwishlist', (req, res) => {
    const { uid, pid } = req.body;

    if (!uid || !pid) {
        return res.status(400).send({ status: 'error', message: 'User ID and Product ID are required' });
    }

    const statement = 'INSERT INTO wishlist (uid, pid) VALUES (?, ?)';

    db.pool.execute(statement, [uid, pid], (error, result) => {
        if (error) {
            console.error('Database error:', error);
            return res.status(500).send({ status: 'error', message: 'Internal server error: ' + error.message });
        }
        res.send({ status: 'success', message: 'Product added to wishlist' });
    });
});

router.delete('/deletewishlist/:id', (request, response) => 
{
    const { id } = request.params;

    const statement = `DELETE FROM wishlist WHERE id = ?`;

    db.pool.execute(statement, [id], (error, result) => {
        response.send(utils.createResult(error, result));
    });
});



router.get('/wishlist', (request, response) => {
    const { uid } = request.query;
    const statement = `
        SELECT p.name AS product_name, u.firstname AS user_name
        FROM wishlist w
        INNER JOIN products p ON w.pid = p.id
        INNER JOIN users u ON w.uid = u.id
        WHERE w.uid = ?;
    `;
    db.pool.execute(statement, [uid], (error, result) => {
        if (error) {
            response.status(500).send(utils.createResult(error, null));
        } else {
            response.send(utils.createResult(null, result));
        }
    });
});

module.exports=router
