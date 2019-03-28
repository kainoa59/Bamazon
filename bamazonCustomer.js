var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "bamazon_db"
});

connection.connect(err => {
    if (err) throw err;
    start();
});

function start() {
    console.log("You are connected!")
    connection.query("SELECT*FROM products", (err, result) => {
        if (err) throw err;
        console.table(result);
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "id",
                    message: "What is the ID of the product you would like to purchase?",
                },
                {
                    type: "input",
                    name: "amount",
                    message: "How many would you like to purchase?"
                }
            ])
            .then(answer => {
                connection.query("SELECT*FROM products WHERE item_id =?", [answer.id], (err, response) => {
                    if (err) throw err;
                    if (response[0].stock_quantity < answer.amount) {
                        console.log("Insufficient quantity!");
                        start();
                    } else {
                        let newQuantity = (parseInt(response[0].stock_quantity) - parseInt(answer.amount));
                        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?;", [newQuantity, answer.id]);
                        console.log(`This cost you $${parseInt(response[0].price * answer.amount)}. Hope you enjoy! \n New quantity:`);
                        connection.query("SELECT*FROM products WHERE item_id = ?", [answer.id], (err, response) => {
                            if (err) throw err;
                            console.log(response[0].stock_quantity);
                            again();
                        });
                    }
                })
            })
    })
}

function again() {
inquirer
    .prompt({
        type: "list",
        name: "again",
        message: "Would you like to buy another item?",
        choices: ["yes","no"]
    })
    .then (result => {
        if (result.again === "yes") {
            start();
        } else if (result.again === "no") {
            connection.end();
        }
    })
}