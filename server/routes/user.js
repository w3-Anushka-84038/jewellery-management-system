const express = require('express');
const db = require('../db'); // Ensure this is correctly configured for your database
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const bcrypt = require('bcrypt');
const utils = require('../utils'); // Assumes utils is handling the response structure

// Signup route
router.post('/signup', async (request, response) => {
    const { firstname, lastname, address, mobile, email, role, password } = request.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const statement = `INSERT INTO users (firstname, lastname, address, mobile, email, created_on, role, password) VALUES (?, ?, ?, ?, ?, Now(), ?, ?)`;

        db.pool.execute(statement, [firstname, lastname, address, mobile, email, role, hashedPassword], (error, result) => {
            if (error) {
                console.error("Database error:", error.message);
                return response.status(500).send({ status: 'error', message: 'Internal server error' });
            }
            response.send({ status: 'success', message: 'User registered successfully' });
        });
    } catch (error) {
        console.error("Error hashing password:", error.message);
        response.status(500).send({ status: 'error', message: 'Internal server error' });
    }
});

router.post('/signin', async (request, response) => {
    const { email, password } = request.body;

    console.log(`Received signin request for email: ${email}`);

    // Modify SQL query to include the role
    const statement = `SELECT id, firstname, lastname, mobile, password, role FROM users WHERE email = ? LIMIT 1`;

    db.pool.execute(statement, [email], async (error, results) => {
        if (error) {
            console.error("Database error:", error.message);
            return response.status(500).send({ status: 'error', message: 'Internal server error' });
        }

        if (results.length === 0) {
            console.log("User not found");
            return response.status(404).send({ status: 'error', message: 'User not found' });
        }

        const { id, firstname, lastname, mobile, password: hashedPassword, role } = results[0];

        if (!hashedPassword) {
            console.log("User has no password set");
            return response.status(401).send({ status: 'error', message: 'User has no password set' });
        }

        try {
            const match = await bcrypt.compare(password, hashedPassword);

            if (match) {
                const payload = { id, firstname, lastname, mobile, role }; // Include role in payload
                const token = jwt.sign(payload, config.secret, { expiresIn: '1h' });
                console.log("Signin successful");
                return response.send({ status: 'success', data: { token, firstname, lastname, mobile, role } });
            } else {
                console.log("Incorrect password");
                return response.status(401).send({ status: 'error', message: 'Incorrect password' });
            }
        } catch (compareError) {
            console.error("Error comparing passwords:", compareError.message);
            return response.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    });
});

// Get all users route
router.get('/allusers', (request, response) => {
    const statement = `SELECT id, firstname, lastname, address, mobile, email, created_on, role FROM users WHERE role = "user"`;
    db.pool.execute(statement, (error, result) => {
        if (error) {
            console.error("Database error:", error.message);
            return response.status(500).send(utils.createResult('error', 'Internal server error'));
        }
        response.send(utils.createResult(null, result));
    });
});

// Delete user route
router.delete('/deleteuser/:id', (request, response) => {
    const { id } = request.params;

    const statement = `DELETE FROM users WHERE id = ?`;
    db.pool.execute(statement, [id], (error, result) => {
        if (error) {
            console.error("Database error:", error.message);
            return response.status(500).send(utils.createResult('error', 'Internal server error'));
        }
        response.send(utils.createResult(null, result));
    });
});

// Get user orders route
router.get('/userorders/:uid', (request, response) => {
    const { uid } = request.params;
    const statement = `
        SELECT 
            o.id AS orderId, 
            o.total_amount, 
            p.name AS productName, 
            p.type AS productType, 
            p.price AS productPrice, 
            p.image AS productImage, 
            p.material AS productMaterial
        FROM 
            orders o
        INNER JOIN 
            order_items oi ON o.id = oi.order_id
        INNER JOIN 
            products p ON oi.product_id = p.id
        WHERE 
            o.user_id = ?
    `;
    db.pool.execute(statement, [uid], (error, result) => {
        if (error) {
            console.error("Database error:", error.message);
            return response.status(500).send(utils.createResult('error', 'Internal server error'));
        }
        response.send(utils.createResult(null, result));
    });
});

// Express route to get user details
router.get('/user/:id', (request, response) => {
    const { id } = request.params;
    const statement = `SELECT id, firstname, lastname, address, mobile, email FROM users WHERE id = ?`;
    db.pool.execute(statement, [id], (error, result) => {
        if (error) {
            console.error("Database error:", error.message);
            return response.status(500).send({ status: 'error', message: 'Internal server error' });
        }
        if (result.length > 0) {
            response.send({ status: 'success', data: result[0] });
        } else {
            response.status(404).send({ status: 'error', message: 'User not found' });
        }
    });
});

// Get details of the currently authenticated user
router.get('/me', (req, res) => {
    const userId = req.user.id; // Assuming req.user is set after JWT authentication middleware

    const statement = `SELECT id, firstname, lastname, address, mobile, email FROM users WHERE id = ?`;

    db.pool.execute(statement, [userId], (error, result) => {
        if (error) {
            console.error("Database error:", error.message);
            return res.status(500).send({ status: 'error', message: 'Internal server error' });
        }
        if (result.length === 0) {
            return res.status(404).send({ status: 'error', message: 'User not found' });
        }
        res.send({ status: 'success', data: result[0] });
    });
});

module.exports = router;

