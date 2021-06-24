const express = require('express')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const mysql = require('mysql')
const mssql = require('mssql')
const merge = require("merge-deep")
const database = require('./config_db')
const app = express()
const port = 5000

//connect to database
const connect = mysql.createConnection(database.db1);
connect.connect(function (err) {
    if (err) throw err;
    else console.log("Connected mysql");
});

mssql.connect(database.db2)

ExecuteMysql = (sql) => {
    return new Promise((resolve, reject) => {
        connect.query(sql, (error, elements) => {
            if (error) {
                return reject(error)
            }
            return resolve(elements)
        })
    })
}

app.use(express.json())
// Static Files
app.use(express.static(path.join(__dirname, 'public')))

// Set Templating Engine
app.use(expressLayouts)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

// Routes
app.get('/', async (req, res) => {
    const department = await mssql.query`select Department from Job_History`
    let result1, result2
    result1 = await mssql.query`select Personal.Employee_ID, First_Name, Last_Name, Middle_Initial,
    Gender, Ethnicity,Plan_Name,Salary,Percentage_CoPay,Department 
    from Personal,Benefit_Plans,Job_History 
    where Personal.Benefit_Plans = Benefit_Plans.Benefit_Plan_ID 
    and Personal.Employee_ID = Job_History.Employee_ID`
    result1 = result1.recordset
    result2 = await ExecuteMysql(`SELECT employee.Employee_ID, vacationdays, payamount 
    FROM employee,payrates 
    where employee.idpayrates = payrates.idpayrates`)
    var result = merge(result1, result2)
    res.render('information', { department: department.recordset, result })
})

app.get('/information', async (req, res) => {
    const department = await mssql.query`select Department from Job_History`
    let result1, result2
    result1 = await mssql.query`select Personal.Employee_ID, First_Name, Last_Name, Middle_Initial,
    Gender, Ethnicity,Plan_Name,Salary,Percentage_CoPay,Department 
    from Personal,Benefit_Plans,Job_History 
    where Personal.Benefit_Plans = Benefit_Plans.Benefit_Plan_ID 
    and Personal.Employee_ID = Job_History.Employee_ID`
    result1 = result1.recordset
    result2 = await ExecuteMysql(`SELECT employee.Employee_ID, vacationdays, payamount 
    FROM employee,payrates 
    where employee.idpayrates = payrates.idpayrates`)
    var result = merge(result1, result2)
    res.render('information', { department: department.recordset, result })
})
app.get('/hrmanagement', async (req, res) => {
    const benefitplans = await mssql.query`select Benefit_Plan_ID, Plan_Name from Benefit_Plans`
    payrates = await ExecuteMysql(`SELECT idpayrates, payamount FROM payrates`)
    let result1, result2
    result1 = await mssql.query`select Personal.Employee_ID, First_Name, Last_Name, Middle_Initial,
    Ethnicity,Salary,Percentage_CoPay,Department,
    Address, Email, Phone_Number, Gender, Shareholder_Status, Plan_Name
    from Personal,Benefit_Plans,Job_History
    where Personal.Benefit_Plans = Benefit_Plans.Benefit_Plan_ID
    and Personal.Employee_ID = Job_History.Employee_ID`
    result1 = result1.recordset
    result2 = await ExecuteMysql(`SELECT employee.Employee_ID, vacationdays, payrates.idpayrates, payamount 
    FROM employee,payrates 
    where employee.idpayrates = payrates.idpayrates`)
    var result = merge(result1, result2)
    res.render('hrmanagement', { benefitplans: benefitplans.recordset, result , payrates})
})
app.post('/hrmanagement/add', async (req, res) => {
    const { firstname, middleinitial, lastname, address, email, phone, gender, shareholderstatus, benefits,
        ethnicity, salary, department, vacationdays, payamount } = req.body
    const addEmployee = await mssql.query`INSERT INTO Personal 
    (First_Name, Last_Name, Middle_Initial, Address, Email, Phone_Number, Gender, Shareholder_Status,
    Benefit_Plans, Ethnicity, Salary) 
    VALUES (${firstname},${lastname},${middleinitial},${address},${email},
    ${phone},${gender},${shareholderstatus},${benefits},${ethnicity},${salary})`
    let idemploy = await mssql.query`SELECT TOP 1 Employee_ID FROM Personal order by Employee_ID DESC`
    idemploy = await idemploy.recordset[0].Employee_ID

    const addEmployee1 = await mssql.query`INSERT INTO Job_History (Employee_ID, Department) 
    VALUES (${idemploy},${department})`

    let sql = `INSERT INTO employee (Employee_ID, firstname, lastname, middleinitial, idpayrates, vacationdays) 
    VALUES (${idemploy},'${firstname}','${lastname}','${middleinitial}','${payamount}','${vacationdays}')`
    console.log(idemploy, sql)
    let addmysql = await ExecuteMysql(sql)
    if (addEmployee.rowsAffected == 1) res.json({ success: true })
    else res.json({ success: false })
})
app.post('/hrmanagement/edit/:id', async (req, res) => {
    const id = req.params.id
    const { firstname, lastname, address, email, phone, gender, shareholderstatus, benefits } = req.body
    let benefitPlans = await mssql.query`SELECT Benefit_Plan_ID FROM Benefit_Plans WHERE Plan_Name = ${benefits}`
    benefitPlans = benefitPlans.recordset[0].Benefit_Plan_ID
    const editEmployee = await mssql.query`UPDATE Personal
    SET First_Name = ${firstname}, 
    Last_Name = ${lastname}, 
    Address = ${address}, 
    Email = ${email}, 
    Phone_Number = ${phone}, 
    Gender = ${gender}, 
    Shareholder_Status = ${shareholderstatus}, 
    Benefit_Plans = ${benefitPlans}
    WHERE Employee_ID = ${id}`
    if (editEmployee.rowsAffected == 1) res.json({ success: true })
    else res.json({ success: false })
})
app.post('/hrmanagement/delete/:id', async (req, res) => {
    const id = req.params.id
    const addEmployee1 = await mssql.query`delete from Job_History where Employee_ID = ${id}`
    const deleteEmployee = await mssql.query`delete from Personal where Employee_ID = ${id}`
    let sql = `DELETE FROM employee where Employee_ID = ${id}`
    let addmysql = await ExecuteMysql(sql)
    if (deleteEmployee.rowsAffected == 1) res.json({ success: true })
    else res.json({ success: false })
})
app.get('/alerts', async (req, res) => {
    result = await ExecuteMysql(`SELECT COUNT(Employee_ID) as vacationdays from employee where vacationdays > 15`)
    result = result[0].vacationdays
    res.render('alerts', { result })
})
app.get('/alertsdetail', async (req, res) => {
    result = await ExecuteMysql(`SELECT Employee_ID,firstname,lastname,vacationdays from employee where vacationdays > 15`)
    result = result
    console.log(result)
    res.render('alertsdetail', { result })
})



app.listen(port, () => console.log(`server run on ${port}`))