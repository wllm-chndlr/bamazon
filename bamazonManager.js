// npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");

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
  if (error) throw error;
  // run the menu function after the connection is made to prompt the user
  menu();
});

// function which prompts the user for what action they should take
function menu() {
  inquirer
    .prompt({
      name: "menuOptions",
      type: "list",
      message: "What would you like to do?",
      choices: ["View Products", "View Low Inventory", "Add Inventory", "Add New Product"]
    })
    .then(function(answer) {
      // console.log(answer.menuOptions);
      // based on their answer, either call the bid or the post functions
      if (answer.menuOptions === "View Products") {
        viewProducts();
      }
      else if (answer.menuOptions === "View Low Inventory") {
        viewLowInventory();
      }
      else if (answer.menuOptions === "Add Inventory") {
        addInventory();
      }
      else if (answer.menuOptions === "Add New Product") {
        // addNewInventory();
      }
      else {
        connection.end();
      }
    });
}

function viewProducts() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.log("AVAILABLE ITEMS:");
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].id + ' | ' + results[i].product_name + ' | ' + '$'+results[i].price + ' | ' + results[i].stock_quantity);
    }
  });
  // menu();
  connection.end();
}

function viewLowInventory() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.log("LOW INVENTORY:");
    for (var i = 0; i < results.length; i++) {
      if (results[i].stock_quantity < 20) {
        console.log(results[i].id + ' | ' + results[i].product_name + ' | ' + '$'+results[i].price + ' | ' + results[i].stock_quantity);
      }
    }
  });
  connection.end();
}

function addInventory() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    inquirer
      .prompt([
        {
          name: "inventorySelect",
          type: "list",
          message: "Which item needs more inventory?",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].id + ' | ' + results[i].product_name + ' | ' + '$'+results[i].price + ' | ' + results[i].stock_quantity);
            }
            return choiceArray;
          }
        },
        {
          name: "additionalQuantity",
          type: "input",
          message: "How many units of inventory would you like to add?"
        }
      ])
      .then(function(answer) {
       
        console.log(results);

        for (var i = 0; i < results.length; i++) {
          if (results[i].id === parseInt(answer.purchaseItem)) {
            chosenItem = results[i].product_name;
            chosenPrice = results[i].price;
            chosenId = results[i].id;
            chosenQuantity = answer.purchaseQuantity;
            availableQuantity = results[i].stock_quantity;
            totalPrice = ((chosenPrice * chosenQuantity) * 1.0825).toFixed(2);
          }
        }

        // console.log(answer);
        // console.log(answer.inventorySelect);

        availableQuantity = answer.inventorySelect[3];
        selectedQuantity = parseInt(answer.additionalQuantity);  // THIS IS FINE
        selectedId = answer.inventorySelect[0];

        // newQuantity = 

        // console.log("Answer.inventorySelect: " + answer.inventorySelect[6]);
        // console.log("Available quantity: " + availableQuantity);
        // console.log("Selected quantity: " + selectedQuantity);

        // connection.query(
        //   "UPDATE products SET ? WHERE ?",
        //   [
        //     {
        //       stock_quantity: newQuantity
        //     },
        //     {
        //       id: selectedId
        //     }
        //   ],
        //   function(error) {
        //     if (error) throw error;
        //   }
        // );
        // console.log(selectedQuantity + " units added.");
      });
  });
  // viewProducts();
}