const fs = require('fs');

function writeToDBFile(db_path, data) {

    fs.writeFileSync(db_path, JSON.stringify(data, null, 2));
}
function readFromDBFile(db_path) {
    return fs.readFileSync(db_path, 'utf-8');
}
function fileExists(path) {
    return fs.existsSync(path);
}

module.exports = { writeToDBFile, readFromDBFile, fileExists };