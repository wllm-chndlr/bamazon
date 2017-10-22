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
        // addInventory();
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
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].item_name);
            }
            return choiceArray;
          },
          message: "What auction would you like to place a bid in?"
        },
        {
          name: "bid",
          type: "input",
          message: "How much would you like to bid?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].item_name === answer.choice) {
            chosenItem = results[i];
          }
        }

        // determine if bid was high enough
        if (chosenItem.highest_bid < parseInt(answer.bid)) {
          // bid was high enough, so update db, let the user know, and start over
          connection.query(
            "UPDATE auctions SET ? WHERE ?",
            [
              {
                highest_bid: answer.bid
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Bid placed successfully!");
              start();
            }
          );
        }
        else {
          // bid wasn't high enough, so apologize and start over
          console.log("Your bid was too low. Try again...");
          start();
        }
      });
  });
}