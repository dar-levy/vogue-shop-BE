const bcrypt = require('bcrypt');

async function hashPassword(user_password) {
    
    const salt_rounds = 10;

    let salt = await bcrypt.genSalt(salt_rounds);
    
    let hashed_pass = await bcrypt.hash(user_password, salt);
    
    return [hashed_pass, salt];
}

module.exports = { hashPassword };