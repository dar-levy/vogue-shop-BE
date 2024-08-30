const persist = require('./persist');
const rsrc = require('./shared_resources.js');
//const fs = require('fs');

function addProduct(id, name, description, pic_url, price, brand, type) {

    let product = {
        //id: rsrc.next_product_id,
        id: id,
        name: name,
        description: description,
        pictureUrl: pic_url,
        price: price,
        brand: brand,
        type: type};
        //quantity: quantity};
    //rsrc.next_product_id++;
    rsrc.products_list.push(product);
    persist.writeToDBFile(rsrc.products_db_path, rsrc.products_list);
    return true;
}

function removeProduct(product_id) {

    let product_index = rsrc.products_list.findIndex(p => p.product_id === product_id);
    // fs.unlink('src/'.concat(rsrc.products_list[product_index].image_path), (err) => {
    //     if (err) return false;})
    rsrc.products_list.splice(product_index, 1);
    persist.writeToDBFile(rsrc.products_db_path, rsrc.products_list);
    return true;
}

module.exports = {addProduct, removeProduct};