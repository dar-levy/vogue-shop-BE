const bcrypt = require('bcrypt');
const rsrc = require('./shared_resources.js');
const activity = require('./activity.js');

async function validateUser(username, password) {

    // Username does not exists
    let user = rsrc.users_credentials_info.find(u => u.username === username);
    if (user === undefined) {
        return false;
    }

    let salt = Buffer.from(user.salt, 'base64').toString();
    let password_hash_b64 = Buffer.from(await bcrypt.hash(password, salt)).toString('base64');

    // Checks if password hashes match
    if (user.password === password_hash_b64) {
        activity.updateUserActivity(user.username, "Login");
        return true;
    }
    return false;
}

module.exports = { validateUser };