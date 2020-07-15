USE employee_db;

INSERT INTO department (department)
VALUES ("Sales"),("Marketing"),("Legal"),("Engineering");

INSERT INTO roles (title, salary, department_id)
VALUES 
("Sales Lead", 40000, 1), 
("Sales Team", 60000, 1),
("Lead Engineer", 140000, 4),
("Senior Engineer", 130000, 4),
("Junior Engineer", 110000, 4);

INSERT INTO employees (first_name, last_name, role_id)
VALUES 

("Jack","Jones", 1), 
("Johnny","Henn", 2), 
("Franklin","Gal", 2),


SELECT
    employees.first_name, employees.last_name, roles.title, roles.salary, department.department
FROM roles
INNER JOIN employees ON role_id = roles.id
INNER JOIN department ON department.id = roles.department_id
ORDER BY department ASC; 