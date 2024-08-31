const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');
const rate_limiter = require('express-rate-limit');
const port = 3000;
const app = express();

// Limiting the amount of requests per IP address to 100 in 3 minutes, to prevent from DDOS attacks
const limiter = rate_limiter({
    windowMs: 3 * 60 *1000, // 3 Minutes
    max: 100,
    message: "Too many requests from this IP. Please try again in a few minutes."
});
app.use(cors({origin: true, credentials: true}), limiter);

const login = require('./src/js_modules/login.js');
const register = require('./src/js_modules/register.js');
const rsrc = require('./src/js_modules/shared_resources.js');
const init = require('./src/js_modules/init.js');
const products = require('./src/js_modules/products.js');
const activity = require('./src/js_modules/activity.js');

app.use(express.static(path.join(__dirname, 'src')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

init.loadDBs();

// Returns the user's cart
app.get('/api/basket', (req, res) => {

    let vogue_user_cookie = req.cookies['vogue-user'];

    if (vogue_user_cookie) {
        const user_data = JSON.parse(vogue_user_cookie);

        let user = rsrc.users_activity_info.find(u => u.username === user_data.username);
        if (user === undefined) {
            return res.status(404).send("Server Error get /basket - Didn't find user in cookie");
        }

        return res.json(user.cart);
    } else {
        return res.status(404).send("Could not find cookie in the request");
    }
});

// Adds a product to the cart
app.post('/api/basket/:id', (req, res) => {
    const product_id = req.params.id;

    let vogue_user_cookie = req.cookies['vogue-user'];
    let user_data = null;

    if (vogue_user_cookie) {
        user_data = JSON.parse(vogue_user_cookie);
    }
    else {
        return res.status(404).send("Could not find cookie in the request");
    }

    let index = rsrc.users_activity_info.findIndex(u => u.username === user_data.username);
    if (index == -1) {
        return res.status(404).send("Server Error post /basket - Didn't find user in cookie");
    }

    if (!activity.addToCart(user_data.username, product_id)) {
        return res.status(500).send("Server Error post /basket - Couldn't add product");
    }
    return res.json(rsrc.users_activity_info[index].cart);
});

// Removes a product from the cart
app.delete('/api/basket/:id', (req, res) => {

    const product_id = req.params.id;

    let vogue_user_cookie = req.cookies['vogue-user'];
    let user_data = null;

    if (vogue_user_cookie) {
        user_data = JSON.parse(vogue_user_cookie);
    }
    else {
        return res.status(404).send("Could not find cookie in the request");
    }

    let index = rsrc.users_activity_info.findIndex(u => u.username === user_data.username);
    if (index == -1) {
        return res.status(404).send("Server Error post /basket - Didn't find user in cookie");
    }

    if (!activity.removeFromCart(user_data.username, product_id)) {
        return res.status(500).send("Server Error post /basket - Couldn't remove product");
    }
    return res.json(rsrc.users_activity_info[index].cart);
});

// Removes all products from the cart
app.delete('/api/basket', (req, res) => {


    let vogue_user_cookie = req.cookies['vogue-user'];
    let user_data = null;

    if (vogue_user_cookie) {
        user_data = JSON.parse(vogue_user_cookie);
    }
    else {
        return res.status(404).send("Could not find cookie in the request");
    }

    let index = rsrc.users_activity_info.findIndex(u => u.username === user_data.username);
    if (index == -1) {
        return res.status(404).send("The profile with the given ID was not found");
    }

    if (!activity.clearCart(user_data.username)) {
        return res.status(500).send("Server Error post /basket - Couldn't clear cart");
    }
    return res.json(rsrc.users_activity_info[index].cart);
});

// Ask about this one
// app.delete('/basket', (req, res) => {

//     let index = rsrc.users_activity_info.findIndex(u => u.username === req.cookies.username);
//     if (index == -1) {
//         return res.status(404).send("The profile with the given ID was not found");
//     }

//     activity.clearCart(req.cookies.username);
//     return res.json(rsrc.users_activity_info[index].cart);
// });

function checkAdmin(req, res, next) {

    let vogue_user_cookie = req.cookies['vogue-user'];

    if (vogue_user_cookie) {
        const user_data = JSON.parse(vogue_user_cookie);
        if (user_data.isAdmin) {
            next();
        } else {
            res.status(403).send('Access denied');
        }
    } else {
        res.status(403).send('Could not find cookie in the request');
  }
}

app.get('/api/products', (req, res) => {
    
    if (!(rsrc.products_list === undefined)) {
        return res.json(rsrc.products_list);
    }
    else {
        return res.status(404).send("Server Error get /products - Product list is corrupted");
    }
});

app.get('/api/products/:product_id', (req, res) => {

    //let {product_id} = req.body;
    const product_id = req.params.product_id;
    //if (typeof product_id == "number") {
    let product = rsrc.products_list.find(p => p.id === product_id);
    if (product === undefined) {
        return res.status(404).send("Server Error get /products/:product_id - Couldn't find the specified product");
    }
    else {
        return res.json(product);
    }
});

app.post('/api/products', checkAdmin, (req, res) => {

    const { id, name, description, pictureUrl, price, brand, type } = req.body;

    if (products.addProduct(id, name, description, pictureUrl, price, brand, type)) {
        res.status(200).send("Successfully added product");
    }
    else {
        res.status(400).send('Failed to add product');
    }
});

app.delete('/api/products/:product_id', checkAdmin, (req, res) => {

    //let {product_id} = req.body;
    const product_id = req.params.product_id;
    if (product_id === undefined) {
        return res.status(404).send('Server Error delete /products/:product_id - Bad product id');
    }
    
    if (products.removeProduct(product_id)) {
        return res.status(200).send('Successfully removed product');
    }
    else {
        return res.status(400).send('Failed to remove product');
    }
});

app.post('/api/register', async (req, res) => {

    const { name, email, password } = req.body;
  
    // Check if the user already exists
    let username = email;
    let existingUser = rsrc.users_credentials_info.find(u => u.username === username);
    if (existingUser) {
        
        return res.status(400).send('user already registered');
    }
  
    // Add new user to the users array
    let user = await register.createNewUser(username, name, password);
  
    // Set a cookie
    let cookie_data = JSON.stringify({ username: user.username, name: user.name, isAdmin: user.isAdmin });
    res.cookie('vogue-user', cookie_data, { maxAge: 30 * 60 * 1000}); // 30 minutes

    res.json({name: user.name, email: user.username, isAdmin: user.isAdmin});
});



app.post('/api/login', async (req, res) => {

    let { username, password, rememberMe } = req.body;

    if (await login.validateUser(username, password) == false) {
        return res.status(400).send('Invalid username or password');
    }

    
    let user = rsrc.users_credentials_info.find(u => u.username === username);

    const max_age = rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000; // 10 days or 30 minutes
    let cookie_data = JSON.stringify({ username: user.username, name: user.name, isAdmin: user.isAdmin });
    res.cookie('vogue-user', cookie_data, {max_age});

    return res.json({name: user.name, email: user.email, isAdmin: user.isAdmin});
});

app.get('/api/logout', (req, res) => {

    let vogue_user_cookie = req.cookies['vogue-user'];
    let user_data = null;

    if (vogue_user_cookie) {
        user_data = JSON.parse(vogue_user_cookie);
    }
    else {
        return res.status(404).send("Could not find cookie in the request");
    }

    activity.updateUserActivity(user_data.username, "Logout");

    res.clearCookie('vogue-user');

    res.status(200).send('Successfully logged out');
});

app.get('/api/contact', (req, res) => {

    if (rsrc.contact_us_description === undefined) {
        return res.status(400).send("Server Error get /contact - Contact description is undefined");
    }
    else {
        return res.json(rsrc.contact_us_description);
    }
});

app.get('/api/about', (req, res) => {

    if (rsrc.about_us_description === undefined) {
        return res.status(400).send("Server Error get /about - About us description is undefined");
    }
    else {
        return res.json(rsrc.about_us_description);
    }
});

app.get('/api/reviews', (req, res) => {

    if (rsrc.reviews === undefined) {
        return res.status(400).send("Server Error get /reviews - reviews array is undefined");
    }
    else {
        return res.json(rsrc.reviews);
    }
});

app.get('/api/new-arrivals', (req, res) => {

    if (rsrc.new_arrivals === undefined) {
        return res.status(400).send("Server Error get /reviews - new_arrivals array is undefined");
    }
    else {
        return res.json(rsrc.new_arrivals);
    }
});

app.get('/api/activity-history', checkAdmin,(req, res) => {
    
    return res.json(rsrc.users_activity_info);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});