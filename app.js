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
    Address, Email, Phone_Number, Gender, Shareholder_Status, Plan_Name, FORMAT(dayofbirth,'dd/MM/yyyy') as dayofbirth
    from Personal,Benefit_Plans,Job_History
    where Personal.Benefit_Plans = Benefit_Plans.Benefit_Plan_ID
    and Personal.Employee_ID = Job_History.Employee_ID`
    result1 = result1.recordset
    result2 = await ExecuteMysql(`SELECT employee.Employee_ID,firstname,lastname,middleinitial, vacationdays, payrates.idpayrates, payamount 
    FROM employee,payrates 
    where employee.idpayrates = payrates.idpayrates`)
    var result = merge(result1, result2)
    console.log(result1)
    console.log(result2)
    console.log(result)
    res.render('hrmanagement', { benefitplans: benefitplans.recordset, result, payrates })
})
app.post('/hrmanagement/add', async (req, res) => {
    const { firstname, middleinitial, lastname, address, email, phone, gender, shareholderstatus, benefits,
        ethnicity, salary, department, vacationdays, payamount,dayofbirth } = req.body
    const addEmployee = await mssql.query`INSERT INTO Personal 
    (First_Name, Last_Name, Middle_Initial, Address, Email, Phone_Number, Gender, Shareholder_Status,
    Benefit_Plans, Ethnicity, Salary, dayofbirth) 
    VALUES (${firstname},${lastname},${middleinitial},${address},${email},
    ${phone},${gender},${shareholderstatus},${benefits},${ethnicity},${salary},${dayofbirth})`
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
    const { firstname, middleinitial, lastname, address, email, phone, gender, shareholderstatus, benefits,
        ethnicity, salary, department, vacationdays, payamount, dayofbirth } = req.body

    let benefitold = await mssql.query`select Benefit_Plans from Personal where Employee_ID = ${id}`
    benefitold = benefitold.recordset[0].Benefit_Plans
    console.log(benefitold)
    let editEmployee
    if (benefitold != benefits) {
        editEmployee = await mssql.query`UPDATE Personal
    SET First_Name = ${firstname}, 
    Last_Name = ${lastname}, 
    Middle_Initial = ${middleinitial}, 
    Address = ${address}, 
    Email = ${email}, 
    Phone_Number = ${phone}, 
    Gender = ${gender}, 
    Shareholder_Status = ${shareholderstatus}, 
    Benefit_Plans = ${benefits}, 
    Ethnicity = ${ethnicity}, 
    Salary = ${salary},
    dayofbirth = ${dayofbirth},
    Benefit_old = ${benefitold}
    WHERE Employee_ID = ${id}`
    } else {
        editEmployee = await mssql.query`UPDATE Personal
    SET First_Name = ${firstname}, 
    Last_Name = ${lastname}, 
    Middle_Initial = ${middleinitial}, 
    Address = ${address}, 
    Email = ${email}, 
    Phone_Number = ${phone}, 
    Gender = ${gender}, 
    Shareholder_Status = ${shareholderstatus}, 
    Benefit_Plans = ${benefits}, 
    Ethnicity = ${ethnicity}, 
    Salary = ${salary},
    dayofbirth = ${dayofbirth}
    WHERE Employee_ID = ${id}`
    }

    console.log(phone)
    const editEmployee1 = await mssql.query`UPDATE Job_History 
    SET Department = ${department} WHERE Employee_ID = ${id}`

    let sql = `UPDATE employee SET firstname = '${firstname}',
    lastname = '${lastname}', 
    middleinitial = '${middleinitial}',
    idpayrates = ${payamount}, 
    vacationdays = ${vacationdays}
    WHERE Employee_ID = ${id}`
    let editmysql = await ExecuteMysql(sql)

    if (editEmployee.rowsAffected == 1) res.json({ success: true })
    else res.json({ success: false })
})
app.post('/hrmanagement/delete/:id', async (req, res) => {
    const id = req.params.id
    const addEmployee1 = await mssql.query`delete from Job_History where Employee_ID = ${id}`
    const addEmployee2 = await mssql.query`delete from Employment where Employee_ID = ${id}`
    const deleteEmployee = await mssql.query`delete from Personal where Employee_ID = ${id}`
    let sql = `DELETE FROM employee where Employee_ID = ${id}`
    let addmysql = await ExecuteMysql(sql)
    if (deleteEmployee.rowsAffected == 1) res.json({ success: true })
    else res.json({ success: false })
})
app.get('/alerts', async (req, res) => {
    result1 = await ExecuteMysql(`SELECT COUNT(Employee_ID) as vacationdays from employee where vacationdays > 10`)
    result1 = result1[0].vacationdays
    result2 = await mssql.query`select COUNT(Employee_ID) as dayofbirth from Personal WHERE MONTH(dayofbirth) = MONTH(getdate())`
    result2 = result2.recordset[0].dayofbirth
    result3 = await mssql.query`select COUNT(Employee_ID) as hire from Employment WHERE DATEDIFF(day, Hire_Date,GETDATE()) >= 365`
    result3 = result3.recordset[0].hire
    result4 = await mssql.query`select COUNT(Employee_ID) as benefit from Personal WHERE NOT Benefit_old = 0`
    result4 = result4.recordset[0].benefit
    console.log(result4)
    res.render('alerts', { result1, result2, result3, result4 })
})
app.get('/alertsvacationdays', async (req, res) => {
    result = await ExecuteMysql(`SELECT Employee_ID,firstname,lastname,middleinitial,vacationdays from employee where vacationdays > 10`)
    result = result
    console.log(result)
    res.render('alertsvacationdays', { result })
})
app.get('/alertsdob', async (req, res) => {
    result = await mssql.query`select Employee_ID, First_Name, Last_Name, Middle_Initial, 
    FORMAT(dayofbirth,'dd/MM/yyyy') as dayofbirth, MONTH(dayofbirth) as month from Personal WHERE MONTH(dayofbirth) = MONTH(getdate())`
    result = result.recordset
    res.render('alertsdob', { result })
})
app.get('/alertshiring', async (req, res) => {
    result = await mssql.query`select Personal.Employee_ID, First_Name, Last_Name, Middle_Initial,
    FORMAT(Hire_Date,'dd/MM/yyyy') as hiredate from Personal,Employment 
    WHERE DATEDIFF(day, Hire_Date,GETDATE()) >= 365 and Personal.Employee_ID = Employment.Employee_ID`
    result = result.recordset
    console.log(result)
    res.render('alertshiring', { result })
})
app.get('/alertsbenefits', async (req, res) => {
    result1 = await mssql.query`select Employee_ID,First_Name, Last_Name, Middle_Initial,Plan_Name as benefitnew from Benefit_Plans,Personal 
    WHERE NOT Benefit_old = 0 AND Personal.Benefit_Plans = Benefit_Plans.Benefit_Plan_ID`
    result1 = result1.recordset
    result2 = await mssql.query`select Employee_ID,First_Name, Last_Name, Middle_Initial,Plan_Name as benefitold from Benefit_Plans,Personal 
    WHERE NOT Benefit_old = 0 AND Personal.Benefit_old = Benefit_Plans.Benefit_Plan_ID`
    result2 = result2.recordset
    var result = merge(result1, result2)
    console.log(result)
    res.render('alertsbenefits', { result })
})

app.listen(port, () => console.log(`server run on ${port}`))