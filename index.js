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