const security = require('./security.js');
const persist = require('./persist.js');
const rsrc = require('./shared_resources.js');
const activity = require('./activity.js');

async function createNewUser(username, name, password) {
    
    let password_info = await security.hashPassword(password);
    hashed_pass = Buffer.from(password_info[0]).toString('base64');
    salt = Buffer.from(password_info[1]).toString('base64');

    let new_user = {username: username, name: name, password: hashed_pass, salt: salt, isAdmin: false};

    rsrc.users_credentials_info.push(new_user);
    activity.updateUserActivity(username, "Login");

    persist.writeToDBFile(rsrc.users_credentials_db_path, rsrc.users_credentials_info);

    return new_user;
}

module.exports = { createNewUser };