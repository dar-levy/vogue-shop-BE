const bcrypt = require('bcrypt');

async function hashPassword(user_password) {
    const salt_rounds = 10;
    // let salt = bcrypt.genSalt(salt_rounds, (err, salt) => {
    //     if (err) {
    //         // Handle error
    //         return null;
    //     }

    //     return salt;
    // });

    //let salt = bcrypt.genSaltSync(salt_rounds);
    let salt = await bcrypt.genSalt(salt_rounds);
    

    // let hashed_pass = bcrypt.hash(user_password, salt, (err, hash) => {
    //     if (err) {
    //         // Handle error
    //         return null;
    //     }

    //     return hash;
    // });

    //let hashed_pass = await bcrypt.hash(user_password, salt);
    let hashed_pass = await bcrypt.hash(user_password, salt);
    
    return [hashed_pass, salt];
}

module.exports = { hashPassword };