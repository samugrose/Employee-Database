const inquirer = require("inquirer");
const mysql = require("mysql");


const connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: process.env.PORT || 3306,
    // Your username
    user: "root",
    // Your password
    password: "password",
    database: "employee_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    askUser();
    // connection.end();
})

const askUser = async () => {

    const {userChoice} = await inquirer.prompt([
                {
                    type:'list',
                    message: 'What would you like to do?',
                    name:'userChoice',
                    choices:['view data', 'add data','change data', 'exit']
                }

            ]);
    
            switch (userChoice) {
                case 'view data':
                    readData();
                    break;
                case 'add data':
                    addData();
                    break;
                case 'change data':
                    changeData();
                    break;
                default:
                    console.log('See you later');
                    connection.end();
                    break;
            }
}

const readData = async () =>{
    const {viewChoice} = await inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to see?',
            name:'viewChoice',
            choices:['department', 'roles', 'employees']
        }
    ])
        switch (viewChoice) {
            case 'department':
                connection.query("SELECT * FROM ??",[viewChoice], function(err, res) {
                    if (err) throw err;
                    console.table(res);
                    askUser();
                  });
                break;
            case 'roles':
                connection.query("SELECT roles.id, roles.title, roles.salary, department.department AS dept FROM roles INNER JOIN department ON roles.department_id = department.id", function(err, res) {
                    if (err) throw err;
                    console.table(res);
                    askUser();
                  });
                break;
            default:
                connection.query("SELECT * FROM employees",function(err, res) {
                    if (err) throw err;
                    // Log all results of the SELECT statement
                    console.table(res);
                    askUser();
                  });
                break;
        }
}