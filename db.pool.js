// db.pool.js

const mysql = require('mysql2/promise');

// Configuración de la base de datos (¡Asegúrate de cambiar estos valores!)
const dbConfig = {
    host: "localhost",
    user: "Bawser",
    password: "Mario26",
    database: "mi_nueva_db",
    port: 3306,
    
    // Configuración clave para el Pool:
    waitForConnections: true, // Si todas las conexiones están en uso, espera
    connectionLimit: 10,      // Número máximo de conexiones que el pool puede crear. 
                              // Ajusta este valor según la carga y capacidad de tu servidor MySQL.
    queueLimit: 0             // 0 significa que no hay límite para las peticiones en cola
};

// Crear el Pool de Conexiones
const pool = mysql.createPool(dbConfig);

console.log(`✅ Pool de conexiones listo con un límite de ${dbConfig.connectionLimit} conexiones.`);

// Exportar el Pool para que pueda ser usado por el servidor Express
module.exports = pool;