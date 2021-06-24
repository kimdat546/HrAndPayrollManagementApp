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
    result1 = await mssql.query`select Personal.Employee_ID, First_Name, Last_Name,
    Gender, Ethnicity,Benefit_Plans,Salary,Percentage_CoPay,Department 
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
    result1 = await mssql.query`select Personal.Employee_ID, First_Name, Last_Name,
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
    const shareholder = await mssql.query`select Plan_Name from Benefit_Plans`
    let result
    result = await mssql.query`select Employee_ID, First_Name, Last_Name,
    Address, Email, Phone_Number, Gender, Shareholder_Status, Plan_Name
    from Personal,Benefit_Plans
    where Personal.Benefit_Plans = Benefit_Plans.Benefit_Plan_ID`
    result = result.recordset
    res.render('hrmanagement', { shareholder: shareholder.recordset, result })
})
app.post('/hrmanagement/add', async (req, res) => {
    const { firstname, lastname, address, email, phone, gender, shareholderstatus, benefits } = req.body
    const addEmployee = await mssql.query`INSERT INTO Personal 
    (First_Name, Last_Name, Address, Email, Phone_Number, Gender, Shareholder_Status, Benefit_Plans)
    VALUES (${firstname},${lastname},${address},${email},${phone},${gender},${shareholderstatus},${benefits})`
    let idemploy = await mssql.query`SELECT TOP 1 Employee_ID FROM Personal order by Employee_ID DESC`
    idemploy = await idemploy.recordset[0].Employee_ID
    const addEmployee1 = await mssql.query`INSERT INTO Job_History (Employee_ID) VALUES (${idemploy})`
    let sql = `INSERT INTO employee (Employee_ID, firstname, lastname) VALUES (${idemploy},'${firstname}','${lastname}')`
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
    const deleteEmployee = await mssql.query`delete from Personal where Employee_ID = ${id}`
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