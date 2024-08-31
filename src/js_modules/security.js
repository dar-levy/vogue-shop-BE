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
    //console.log(salt);

    // let hashed_pass = bcrypt.hash(user_password, salt, (err, hash) => {
    //     if (err) {
    //         // Handle error
    //         return null;
    //     }

    //     console.log('Hashed password:', hash);
    //     return hash;
    // });

    //let hashed_pass = await bcrypt.hash(user_password, salt);
    let hashed_pass = await bcrypt.hash(user_password, salt);
    //console.log('Hashed password:', hashed_pass);
    return [hashed_pass, salt];
}

module.exports = { hashPassword };