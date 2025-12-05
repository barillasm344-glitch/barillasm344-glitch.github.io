// db.pool.js

const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: "localhost",      // <-- CORREGIDO: de HOST a host
    user: "Bawser",         // <-- CORREGIDO: de USER a user
    password: "Mario26",   // <-- CORREGIDO: de PASSWORD a password
    database: "mi_nueva_db",// <-- CORREGIDO: de DATABASE a database
    port: 3306,             // <-- CORREGIDO: de PORT a port
    
    // Configuración clave para el Pool:
    waitForConnections: true, 
    connectionLimit: 10,      
    queueLimit: 0             
};

// Crear el Pool de Conexiones
const pool = mysql.createPool(dbConfig);
// ...