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
    console.log("AVAILABLE ITEMS:");
    for (var i = 0; i<results.length; i++) {
      console.log(results[i].id + ' | ' + results[i].product_name + ' | ' + '$'+results[i].price);
    }
    inquirer.prompt([
      {
        name: "purchaseItem",
        type: "input",
        message: "which item would you like to purchase? (enter ID)",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "purchaseQuantity",
        type: "input",
        message: "how many would you like to purchase? (enter quantity)",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ]).then(function(answer) {
      // console.log("results[0].product_name: " + results[0].product_name);
      // console.log("answer.purchaseItem: " + answer.purchaseItem);
      var chosenItem;
      for (var i = 0; i < results.length; i++) {
        if (results[i].id === parseInt(answer.purchaseItem)) {
          chosenItem = results[i].product_name;
        }
      }
      console.log("You've selected " + chosenItem);
    })
  });
}
