const fs = require('fs');

function writeToDBFile(db_path, data) {

    // let all_data = [];
    // if (fileExists(db_path)) {
    //     all_data = JSON.parse(readFromDBFile(db_path));   
    // }

    // all_data.push(...data);
    // fs.writeFileSync(db_path, JSON.stringify(all_data, null, 2));
    fs.writeFileSync(db_path, JSON.stringify(data, null, 2));
}
function readFromDBFile(db_path) {
    return fs.readFileSync(db_path, 'utf-8');
}
function fileExists(path) {
    return fs.existsSync(path);
}

module.exports = { writeToDBFile, readFromDBFile, fileExists };