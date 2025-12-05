// server.js (Usando Express.js)

const express = require('express');
const cors = require('cors'); // <--- 1. ¡IMPORTA CORS!
const pool = require('./db.pool.js'); // Importar el Pool que creamos

const app = express();
const PORT = 3300; // Puerto donde correrá el servidor web

// #############################################################
// ### CONFIGURACIÓN DE MIDDLEWARE (Colocado al inicio)      ###
// #############################################################

// 2. CONFIGURACIÓN DE CORS: Permite peticiones desde cualquier origen ('*')
// Esto es CRUCIAL para evitar errores de seguridad del navegador (Cross-Origin Resource Sharing).
app.use(cors());

// 3. CONFIGURACIÓN DEL PARSEADOR DE DATOS: Permite a Express leer JSON de las peticiones.
// Mueve este middleware al inicio para que esté disponible para todas las rutas.
app.use(express.json());

// #############################################################
// ### RUTA DE EJEMPLO: OBTENER EL ESTADO DE UN PAQUETE      ###
// #############################################################

app.get('/api/envios/:id', async (req, res) => {
    // Obtenemos el ID del cliente (ej. GT4590) de la URL
    const clienteID = req.params.id;
    let connection;

    try {
        // 1. Obtener una conexión del Pool
        // Esto es rápido, ya que la conexión está pre-abierta.
        connection = await pool.getConnection();

        // 2. Ejecutar la consulta
        const sql = `SELECT * FROM Envios WHERE Id_cliente_web = ?`;
        const [resultados] = await connection.execute(sql, [clienteID]);

        // 3. Devolver la respuesta
        if (resultados.length > 0) {
            res.status(200).json({
                cliente: clienteID,
                envios: resultados
            });
        } else {
            res.status(404).json({
                mensaje: "No se encontraron envíos para ese ID de cliente."
            });
        }

    } catch (error) {
        console.error("Error en la consulta de envíos:", error.message);
        // Devolver un error 500 (Internal Server Error)
        res.status(500).json({
            mensaje: "Error interno del servidor al procesar la solicitud."
        });
    } finally {
        // MUY IMPORTANTE: Devolver la conexión al pool
        if (connection) {
            connection.release();
        }
    }
});

// Iniciar el servidor Express
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express.js corriendo en http://localhost:${PORT}`);
    console.log(`Prueba: GET http://localhost:${PORT}/api/envios/GT4590`);
});