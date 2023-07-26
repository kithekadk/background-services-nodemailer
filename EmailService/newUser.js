const ejs = require ('ejs')
const mssql = require ('mssql')
const { sqlConfig } = require('../Config/config')
const { sendMail } = require('../Helpers/email')

const welcomeAboard = async()=>{
    const pool = await mssql.connect(sqlConfig)

    if(pool.connected){
        const users = (await pool.request().query(`SELECT email FROM  employeesTable WHERE issent =0`)).recordset

        console.log(users);

        for(let user of users){
            ejs.renderFile('./Templates/welcomeUser.ejs', {email: user.email}, async(error, html)=>{
                const message = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: "Welcome Aboard",
                    html
                }

                try {
                    await sendMail(message);
                    await pool.request().query(`UPDATE employeesTable SET issent= 1 WHERE email = '${user.email}'`)
                } catch (error) {
                    console.log(error)
                }
            })
        }
    }else{
        console.log('connection failed');
    }
}

module.exports = {
    welcomeAboard
}