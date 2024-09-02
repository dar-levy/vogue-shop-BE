const security = require('./security.js');
const persist = require('./persist');
const rsrc = require('./shared_resources.js');

async function createDefaultUsersDB(db_path) {

    const admin_username = 'admin';
    const admin_password = 'admin';
    //const admin_email = 'vgsadmin@gmail.com';
    let admin_pass_info = await security.hashPassword(admin_password);
    hashed_admin_pass = Buffer.from(admin_pass_info[0]).toString('base64');
    salt = Buffer.from(admin_pass_info[1]).toString('base64');
    let default_db = [{username: admin_username, name: admin_username,
        password: hashed_admin_pass, salt: salt, isAdmin: true}];

    persist.writeToDBFile(db_path, default_db);

    return default_db;

}

function createDefaultActivityDB(db_path) {

    let default_db = [{username: "admin", activity_type: "Login",
        timestamp: new Date().toLocaleString("en-GB", {timeZone: "Asia/Jerusalem"}),
        cart: {id : 5000, userID: "admin", items: []}}];
    persist.writeToDBFile(db_path, default_db);
    return default_db;
}

function createDefaultProductsDB(db_path) {
    let default_db = [];
    persist.writeToDBFile(db_path, default_db);
    return default_db;
}

async function initUsersDB() {
    if (!persist.fileExists(rsrc.users_credentials_db_path)) {
        await createDefaultUsersDB(rsrc.users_credentials_db_path);
    }
    if (!persist.fileExists(rsrc.users_activity_db_path)) {
        createDefaultActivityDB(rsrc.users_activity_db_path);
    }
    if (!persist.fileExists(rsrc.products_db_path)) {
        createDefaultProductsDB(rsrc.products_db_path);
    }
}

async function loadDBs() {

    await initUsersDB();
    rsrc.users_activity_info = JSON.parse(persist.readFromDBFile(rsrc.users_activity_db_path));
    rsrc.users_credentials_info = JSON.parse(persist.readFromDBFile(rsrc.users_credentials_db_path));
    rsrc.products_list = JSON.parse(persist.readFromDBFile(rsrc.products_db_path));
    if (rsrc.products_list.length > 0) {
        rsrc.next_product_id = rsrc.products_list[rsrc.products_list.length - 1];
    }

    let max_cart_id = 0;
    rsrc.users_activity_info.forEach((user) => {
        if (max_cart_id < user.cart.id) {
            max_cart_id = user.cart.id;
        }
    });
    rsrc.next_cart_id = max_cart_id + 1;

    rsrc.about_us_description = persist.readFromDBFile(rsrc.about_us_db_path);
    rsrc.contact_us_description = persist.readFromDBFile(rsrc.contact_us_db_path);
    rsrc.reviews = JSON.parse(persist.readFromDBFile(rsrc.reviews_db_path));
    rsrc.new_arrivals = JSON.parse(persist.readFromDBFile(rsrc.new_arrivals_db_path));

}

module.exports = { loadDBs };