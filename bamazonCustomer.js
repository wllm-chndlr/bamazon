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
  // console.log("Connected as id: " + connection.threadId);
  if (error) throw error;
  // run the initialize function after the connection is made to prompt the user
  initialize();
});

// initialize function allows user to view inventory or exit application
function initialize() {
  inquirer.prompt(
    {
      name: "viewOrExit",
      type: "confirm",
      message: "Greetings! Would you like to view available inventory?"
    })
    .then(function(answer) {
      // based on their answer, either show inventory via purchase function or exit application
      if (answer.viewOrExit === true) {
        purchase();
      }
      else {
        console.log("Thanks for visiting!")
        connection.end();
      }
    });
}

// function which displays inventory and allows user to select items/quantity
function purchase() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.log("AVAILABLE ITEMS:");
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].id + ' | ' + results[i].product_name + ' | ' + '$'+results[i].price);
    }
    inquirer.prompt([
      {
        name: "purchaseItem",
        type: "input",
        message: "Which item would you like to purchase? (enter item #)",
        validate: function(value) {
          for (var j = 0; j < results.length; j++) {
            if (isNaN(value) === false && parseInt(value) === results[j].id) {
              return true;
            }
          }
          return false;
        }
      },
      {
        name: "purchaseQuantity",
        type: "input",
        message: "Wow many would you like to purchase? (enter quantity)",
        validate: function(value) {
          if (isNaN(value) === false && parseInt(value) > 0) {
            return true;
          }
          return false;
        }
      }
    ]).then(function(answer) {
      // var chosenItem;
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
      if(chosenQuantity <= availableQuantity) {
        console.log("You've selected " + '(' + answer.purchaseQuantity + ') ' + chosenItem);
        console.log("Total purchase price: " + '$' + totalPrice + ' (includes TX sales tax)');
        inquirer.prompt(
          {
            name: "purchaseNow",
            type: "confirm",
            message: "Purchase now?"
          })
          .then(function(answer) {
            // based on their answer, either update inventory or exit
            if (answer.purchaseNow === true) {
              connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: availableQuantity - chosenQuantity
                  },
                  {
                    id: chosenId
                  }
                ],
                function(error) {
                  if (error) throw err;
                }
              );
              console.log("Thanks for your purchase!");
              inquirer.prompt(
                {
                  name: "restartOrExit",
                  type: "confirm",
                  message: "Would you like to look at other products?"
                })
                .then(function(answer) {
                  // based on their answer, either show inventory or exit
                  if (answer.restartOrExit === true) {
                    purchase();
                  }
                  else {
                    console.log("Thanks for visiting!")
                    connection.end();
                  }
                });
            }
            else {
              console.log("Thanks for visiting!")
              connection.end();
            }
          });
      }
      else {
        console.log("Sorry - we don't have enough stock available!");
        inquirer.prompt(
          {
            name: "lowStock",
            type: "confirm",
            message: "Would you like to start over?"
          })
          .then(function(answer) {
            // based on their answer, either show inventory or exit
            if (answer.lowStock === true) {
              purchase();
            }
            else {
              console.log("Thanks for visiting!")
              connection.end();
            }
          });
      }
    })
  });
}