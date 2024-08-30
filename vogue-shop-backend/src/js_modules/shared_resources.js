
let users_credentials_info = [];
let users_activity_info = [];
let products_list = [];
let reviews = [];
let new_arrivals = [];

let next_product_id = 1000; // Initial value
let next_cart_id = 5001; // Initial value

const users_credentials_db_path = 'src/db/users.db';
const users_activity_db_path = 'src/db/activity.db';
const products_db_path = 'src/db/products.db';
const about_us_db_path = 'src/db/about_us.db';
const contact_us_db_path = 'src/db/contact_us.db';
const reviews_db_path = 'src/db/reviews.db'
const new_arrivals_db_path = 'src/db/new_arrivals.db';

let contact_us_description = "";
let about_us_description = "";

module.exports = {users_credentials_info, users_activity_info, users_credentials_db_path,
    users_activity_db_path, products_db_path, next_product_id, products_list, contact_us_description,
    about_us_description, reviews, new_arrivals, next_cart_id, about_us_db_path, contact_us_db_path,
    reviews_db_path, new_arrivals_db_path};