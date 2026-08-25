<?php
// config.php - Conexión a la base de datos + configuración CORS

// ---- CORS: permitir peticiones desde React (localhost:5173) ----
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true'); // necesario para que viajen las cookies de sesión
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// El navegador, antes de un POST/PUT/DELETE "raro", manda una petición
// de prueba tipo OPTIONS para preguntar "¿me dejas hacer esto?".
// Respondemos OK inmediato a esa pregunta, sin ejecutar más código.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ---- Conexión a la base de datos ----
$host = 'localhost';
$dbname = 'ventas_inventario';
$usuario = 'root';
$password = '';

try {
    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $usuario, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}