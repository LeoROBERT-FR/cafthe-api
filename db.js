const mysql = require('mysql2')

require('dotenv').config() // permet de charger les variables d'environnement

console.log(process.env)

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

db.connect((error => {
    if(error){
        console.error("Erreur de connexion mysql :", error)
        process.exit(1)
    }

    console.log("Connecter a la ddb mysql")
}))

module.exports = db;