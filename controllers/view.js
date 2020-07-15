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

class view {
    viewAll(){
        connection.query("SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.department FROM roles INNER JOIN employees ON role_id = roles.id INNER JOIN department ON department.id = roles.department_id ORDER BY department ASC;",
         function (err, res) {
            if (err) throw err;
            console.table(res);
        });
    };

    module.exports = new view();