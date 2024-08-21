const express = require('express');
const path = require('path'); // Import path module
const utils = require('./utils');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const config = require('./config');

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log("server page");

const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const orderRouter = require('./routes/order');
const wishlistRouter = require('./routes/wishlist');
const reviewRouter = require('./routes/review');
const paymentRouter = require('./routes/payment');
const categoryRouter = require('./routes/category');

console.log("server page 22222");

app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/wishlist', wishlistRouter);
app.use('/review', reviewRouter);
app.use('/payment', paymentRouter);
app.use('/category', categoryRouter);

app.listen(4000, '0.0.0.0', () => {
  console.log(`server started on port 4000`);
});
