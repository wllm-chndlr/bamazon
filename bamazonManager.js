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

// function that shows the user the available options
function menu() {
  inquirer
    .prompt({
      name: "menuOptions",
      type: "list",
      message: "What would you like to do?",
      choices: ["View Products", "View Low Inventory", "Add Inventory", "Add New Product"]
    })
    .then(function(answer) {
      // based on their answer, run appropriate function
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
        addNewProduct();
      }
      else {
        connection.end();
      }
    });
}

// function that shows all available inventory
function viewProducts() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.log("AVAILABLE ITEMS:");
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].id + ' | ' + results[i].product_name + ' | ' + '$'+results[i].price + ' | ' + results[i].stock_quantity);
    }
  });
  connection.end();
}

// function that shows all items with inventory less than five
function viewLowInventory() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.log("LOW INVENTORY:");
    for (var i = 0; i < results.length; i++) {
      if (results[i].stock_quantity < 5) {
        console.log(results[i].id + ' | ' + results[i].product_name + ' | ' + '$'+results[i].price + ' | ' + results[i].stock_quantity);
      }
    }
  });
  connection.end();
}

// function that allows user to add inventory to a specific product
function addInventory() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.log("AVAILABLE INVENTORY:");
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].id + ' | ' + results[i].product_name + ' | ' + '$'+results[i].price + ' | ' + results[i].stock_quantity);
    }
    inquirer.prompt([
        {
          name: "inventorySelect",
          type: "input",
          message: "Which item needs more inventory? (enter item #)",
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
          name: "additionalQuantity",
          type: "input",
          message: "How many units of inventory would you like to add?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function(answer) {
        for (var i = 0; i < results.length; i++) {
          if (results[i].id === parseInt(answer.inventorySelect)) {
            selectedItem = results[i].product_name;
            selectedId = parseInt(answer.inventorySelect);
            selectedQuantity = parseInt(answer.additionalQuantity);
            availableQuantity = results[i].stock_quantity;
            newQuantity = (availableQuantity + selectedQuantity);
          }
        }
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: newQuantity
            },
            {
              id: selectedId
            }
          ],
          function(error) {
            if (error) throw error;
          }
        );
        console.log(selectedQuantity + " units added to " + selectedItem + " inventory.");
        inquirer.prompt(
          {
            name: "addMoreInventory",
            type: "confirm",
            message: "Would you like to add inventory to another item?"
          })
          .then(function(answer) {
            // based on their answer, either re-start add inventory function or exit
            if (answer.addMoreInventory === true) {
              addInventory();
            }
            else {
              console.log("Session terminated.")
              connection.end();
            }
          });
      });
  });
}

// function that allows user to add a new product
function addNewProduct() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.log("ADD NEW PRODUCT");
    inquirer.prompt([
      {
        name: "newProductName",
        type: "input",
        message: "What's the name of the new product?",
      },
      {
        name: "newProductDepartment",
        type: "input",
        message: "What's the department of the new product?",
      },
      {
        name: "newProductPrice",
        type: "input",
        message: "What's the price of the new product?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "newProductInventory",
        type: "input",
        message: "What's the inventory of the new product?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      
      newId = results.length + 1;
      newName = answer.newProductName;
      newDepartment = answer.newProductDepartment;
      newPrice = answer.newProductPrice;
      newInventory = answer.newProductInventory;

      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: newName,
          department_name: newDepartment,
          price: newPrice,
          stock_quantity: newInventory
        },
        function(err) {
          if (err) throw err;
        }
      );
      console.log("Your product was added successfully!");
      inquirer.prompt(
        {
          name: "addAnotherProduct",
          type: "confirm",
          message: "Would you like to add another item?"
        })
        .then(function(answer) {
          // based on their answer, either re-start add new product function or exit
          if (answer.addAnotherProduct === true) {
            addNewProduct();
          }
          else {
            console.log("Session terminated.")
            connection.end();
          }
        });
    });
  });
}