const persist = require('./persist');
const rsrc = require('./shared_resources.js');

// Update the users activity table and return the index of the user in the activity array
function updateUserActivity(username, new_activity) {

    let time = new Date().toLocaleString("en-GB", {timeZone: "Asia/Jerusalem"});

    let index = rsrc.users_activity_info.findIndex(u => u.username === username);

    // User doesn't exists in the activity database, create new row in the activity database
    if (index == -1) {
            
        let user = {};
        user.username = username;
        user.activity_type = new_activity;
        user.timestamp = time;
        user.cart = {id : rsrc.next_cart_id, userID: username, items: []};

        rsrc.next_cart_id++;
        rsrc.users_activity_info.push(user);
    }
    else {

        rsrc.users_activity_info[index].activity_type = new_activity;
        rsrc.users_activity_info[index].timestamp = time;
    }
    persist.writeToDBFile(rsrc.users_activity_db_path, rsrc.users_activity_info);
    console.log(rsrc.users_activity_info);

    return index;
}

function addToCart(username, product_id) {

    let index = rsrc.users_activity_info.findIndex(u => u.username === username);

    let product = rsrc.products_list.find(p=> p.id === product_id);
    if (product === undefined || index === -1) {
        return false;
    }

    let basket_item = {
        productId: product.id,
        name: product.name,
        price: product.price,
        pictureUrl: product.pictureUrl,
        brand: product.brand,
        type: product.type };
    
    rsrc.users_activity_info[index].cart.items.push(basket_item);
    updateUserActivity(username, "Added item to cart");
    console.log("Added to cart");
    return true;
}

function removeFromCart(username, product_id) {

    let index = rsrc.users_activity_info.findIndex(u => u.username === username);

    let product_index = rsrc.users_activity_info[index].cart.items.findIndex(
        bi => bi.productId === product_id);
    if (product_index === -1 || index === -1) {
        return false;
    }

    rsrc.users_activity_info[index].cart.items.splice(product_index, 1);
    updateUserActivity(username, "Removed item from cart")
    console.log("Removed from cart");
    return true;
}

function clearCart(username) {
    let index = rsrc.users_activity_info.findIndex(u => u.username === username);
    if (index == -1) {
        return false;
    }

    rsrc.users_activity_info[index].cart.forEach(bi => {
        removeFromCart(username, bi.productId);
    });

    return true;
}

module.exports = {updateUserActivity, addToCart, removeFromCart, clearCart};