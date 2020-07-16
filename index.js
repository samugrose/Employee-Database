const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require('console.table');
const { addRow, deleteRow, endConnection } = require('./db');

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

    const { userChoice } = await inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'userChoice',
            choices: ['view data', 'add data', 'change data', 'delete data', 'exit']
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
        case 'delete data':
            deleteData();
            break;
        default:
            console.log('See you later');
            connection.end();
            break;
    }
}

const readData = async () => {
    const { viewChoice } = await inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to see?',
            name: 'viewChoice',
            choices: ['department', 'roles', 'employees']
        }
    ])
    switch (viewChoice) {
        case 'department':
            connection.query("SELECT * FROM ??", [viewChoice], function (err, res) {
                if (err) throw err;
                console.table(res);
                askUser();
            });
            break;
        case 'roles':
            connection.query("SELECT roles.id, roles.title, roles.salary, department.department AS dept FROM roles INNER JOIN department ON roles.department_id = department.id", function (err, res) {
                if (err) throw err;
                console.table(res);
                askUser();
            });
            break;
        default:
            connection.query("SELECT * FROM employees", function (err, res) {
                if (err) throw err;
                // Log all results of the SELECT statement
                console.table(res);
                askUser();
            });
            break;
    }
}

const addData = async () => {
    const { addChoice } = await inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to add to the db?',
            name: 'addChoice',
            choices: ['department', 'roles', 'employees']
        }
    ])
    switch (addChoice) {
        case 'department':
            const { newDept } = await inquirer.prompt([
                {
                    type: 'input',
                    message: 'What is the new dept called?',
                    name: 'newDept'
                }
            ])
            connection.query(`INSERT INTO department (department) VALUES (?);`, [newDept], function (err, res) {
                if (err) throw err;
                // Log all results of the SELECT statement
                console.log('New department added ');
                askUser();
            });
            break;
        case 'roles':
            connection.query('SELECT * FROM department', async (err, res) => {
                //prompt user for new role info
                const choicesArr = res.map(item => item.name);
                const newRole = await inquirer.prompt([
                    {
                        type: 'input',
                        message: 'What is the role to be added?',
                        name: 'title'
                    },
                    {
                        type: 'input',
                        message: 'What is roles salary?',
                        name: 'salary'
                    },
                    {
                        type: 'list',
                        message: 'Which department id does this role work in?',
                        name: 'department_id',
                        choices: [0,
                            1, 2]

                    }
                ])

                const dept = newRole.department_id
                newRole.department_id = res.filter(roles => roles.name === newRole.department_id).map(item => item.id)[0];
                connection.query(`INSERT INTO ${addChoice} SET ??`, newRole, function (err, res) {
                    if (err) throw err;
                    console.log('New role added!')
                    askUser();
                });
            });
            break;
        default:
            //get data for prompts
            connection.query("SELECT title, id FROM roles; SELECT CONCAT(first_name, ' ', last_name) AS name, id FROM employees", async (err, nameList) => {
                //get input from user
                const newEmployee = await inquirer.prompt([
                    {
                        type: 'input',
                        message: 'Give me a FIRST NAME',
                        name: 'first_name'
                    },
                    {
                        type: 'input',
                        message: 'Give me a LAST NAME',
                        name: 'last_name'
                    },
                    {
                        type: 'list',
                        message: 'What is the role?',
                        name: 'role_id',
                        choices: nameList[0].map(item => item.title)
                    },
                    {
                        type: 'list',
                        message: 'What is the role?',
                        name: 'manager_id',
                        choices: () => {
                            const arr = nameList[1].map(item => item.name);
                            arr.push('none');
                            return arr;
                        }
                    }
                ])
                console.log(newEmployee);
                //change the role_id value from name to id for query
                // newEmployee.role_id = nameList[0].filter(role => role.title === newEmployee.role_id).map(item => item.id)[0];
                // //change manager_id value from name to id for query
                // (newEmployee.manager_id === 'none')? delete newEmployee['manager_id']: newEmployee.manager_id=nameList[1].filter(person => person.name === newEmployee.manager_id).map(item => item.id)[0];
                // //add employe to database
                connection.query(`INSERT INTO ${addChoice} SET ?`, newEmployee, function (err, res) {
                    if (err) throw err;
                    console.log("employee added!")
                    askUser();
                });
            })
            break;
    }
}

const deleteData = async () => {
    //ask user which table they would like to delete from
    const { tableChoice } = await inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to delete?',
            name: 'tableChoice',
            choices: ['department', 'roles', 'employees', 'exit']
        }
    ]);
    switch (tableChoice) {
        //delete department
        case 'department':
            //get the list for deletion
            connection.query(`SELECT * FROM ??`, tableChoice, async (err, res) => {
                if (err) throw err;
                const { target } = await inquirer.prompt([
                    {
                        type: 'rawlist',
                        message: `Which ${tableChoice} would you like to delete?`,
                        name: 'target',
                        choices: ["Sales", "Engineering", "Legal", "Marketing"]
                    }
                ])
                
                connection.query('SELECT department.id AS dept_id, department.department, roles.id AS role_id, CONCAT(employees.first_name, " ", employees.last_name) AS employee FROM department INNER JOIN roles ON department.id = roles.department_id INNER JOIN employees ON roles.id = employees.role_id WHERE department.department = ?', [target], async (error, result) => {
                    if (error) throw error;
                    deleteRow(tableChoice);//, res.filter(item => item.name === target)[0].id
                    console.log(`${tableChoice}  deleted.`); //${target}

                    askUser();


                })
            })

            break;
        //delete role
        case 'roles':
            connection.query(`SELECT * FROM ??`, tableChoice, async (err, res) => {
                if (err) throw err;
                const { target } = await inquirer.prompt([
                    {
                        type: 'rawlist',
                        message: `Which ${tableChoice} wouild you like to delete?`,
                        name: 'target',
                        choices: res.map(rol => rol.title)
                    }
                ])
                connection.query('SELECT roles.id AS role_id, roles.title, CONCAT(employees.first_name, " ", employees.last_name) AS employee FROM roles INNER JOIN employees ON roles.id = employees.role_id WHERE roles.title = ?', [target], async (error, result) => {
                    if (error) throw error;
                    if (result.length) {
                        //ask user if they are sure about deleting also the employee info
                        const { yesNo } = await inquirer.prompt([
                            {
                                type: 'confirm',
                                message: `Deleting the ${target} and employees: ${result.map(person => person.employee).join(', ')}. Do you want to continue?`,
                                name: 'yesNo'
                            }
                        ]);

                        if (!yesNo) {
                            askUser();
                        } else {
                            //call delete function
                            deleteRow(tableChoice, res.filter(item => item.title === target)[0].id);
                            console.log(`${tableChoice} ${target} was deleted.`)

                            askUser();
                        }

                    }

                })
            })
            break;
        //delete employe
        case 'employees':
            connection.query(`SELECT CONCAT(first_name, ' ', last_name) AS name, id FROM ??`, tableChoice, async (err, res) => {
                if (err) throw err;
                const { target } = await inquirer.prompt([
                    {
                        type: 'rawlist',
                        message: `Which ${tableChoice} wouild you like to delete?`,
                        name: 'target',
                        choices: res.map(person => person.name)
                    }
                ])
                const { yesNo } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        message: `Are you sure you want to delete ${target}?`,
                        name: 'yesNo'
                    }
                ]);
                if (!yesNo) {
                    askUser();
                } else {
                    deleteRow(tableChoice, res.filter(item => item.name === target)[0].id);
                    console.log(`${tableChoice} ${target} was removed.`)
                    askUser();
                }
            })
            break;
        default:
            askUser();
            break;
    }
}

const changeData = async () => {

    connection.query("SELECT title, id FROM roles; SELECT first_name, last_name, id FROM employees", async (err, nameList) => {
        if (err) throw err;
    
        const changeEmployee = await inquirer.prompt([
            {
                type: 'list',
                message: `Which employee's records are you looking to update?`,
                name: 'name',
                choices: nameList[1].map(item => item.name)

            },
            {
                type: 'list',
                message: 'What do you want to update?',
                name: 'fieldChoice',
                choices: ['role', 'manager']
            }
        ])
        const { newRoleManager } = await inquirer.prompt([
            {
                type: 'list',
                message: `Make your new ${changeEmployee.fieldChoice} choice below.`,
                name: 'newRoleManager',
                choices: () => {
                    switch (changeEmployee.fieldChoice) {
                        case 'role':
                            
                            return nameList[0].map(item => item.title)
                            break;
                        default:
                            
                            const arr = nameList[1].map(item => item.name);
                          
                            arr.push('no boss');
                           
                            arr.filter(item => item !== changeEmployee.name)
                            return arr;
                            break;
                    }
                }
            }
        ])

        const employeeId = nameList[1].filter(person => person.name === changeEmployee.name).map(item => item.id)[0]
        const newVal = newRoleManager;
        const queryObj = {};

        if (changeEmployee.fieldChoice === 'role') {
            queryObj.role_id = nameList[0].filter(role => role.title === newRoleManager).map(item => item.id)[0]
        } else {
            (newRoleManager === 'no boss') ? queryObj.manager_id = null : queryObj.manager_id = nameList[1].filter(person => person.name === newRoleManager).map(item => item.id)[0];
        }

        //update database
        connection.query(`UPDATE employees SET ? WHERE id=?`, [queryObj, employeeId], function (err, res) {
            if (err) throw err;
        
            askUser();
        });
    })

}
