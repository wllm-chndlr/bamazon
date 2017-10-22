// npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");

var itemId;

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(error) {
  console.log("Connected as id: " + connection.threadId);
  if (error) throw error;
  // run the start function after the connection is made to prompt the user
  start();
  connection.end();
});

// function which prompts the user for what action they should take
function start() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    for (var i = 0; i<results.length; i++) {
      console.log(results[i].id + '|' + results[i].product_name + '|' + results[i].price);
    }
    inquirer.prompt({
      name: "purchaseItem",
      type: "input",
      message: "which item would you like to purchase? (enter ID)"
    }).then(function(answer) {
      itemId = answer;
      console.log(itemId);
    })
  });
}

// function purchaseQuery() {
//   inquirer.prompt({
//     name: "purchaseItem",
//     type: "input",
//     message: "which item would you like to purchase? (enter ID)"
//   }).then(function(answer) {
//     itemId = answer;
//     console.log(itemId);
//   })
// }
