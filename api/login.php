<?php
// login.php - Verifica email y contraseña, inicia sesión

session_start(); // inicia (o retoma) la sesión de PHP

header('Content-Type: application/json');
require 'config.php';

// Leemos los datos que llegan en el cuerpo de la petición (JSON desde React)
$datos = json_decode(file_get_contents('php://input'), true);

$email = $datos['email'] ?? '';
$password = $datos['password'] ?? '';

// Validación básica: que no vengan vacíos
if (empty($email) || empty($password)) {
    http_response_code(400); // "petición mal formada"
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Email y contraseña son obligatorios'
    ]);
    exit; // detenemos la ejecución, no seguimos abajo
}

try {
    $stmt = $pdo->prepare("SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = :email AND activo = 1");
    $stmt->execute(['email' => $email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificamos: que exista el usuario Y que la contraseña coincida con el hash
    if ($usuario && password_verify($password, $usuario['password_hash'])) {

        // Guardamos datos del usuario en la sesión (así lo "recordamos" en próximas peticiones)
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nombre'] = $usuario['nombre'];
        $_SESSION['usuario_rol'] = $usuario['rol'];

        echo json_encode([
            'exito' => true,
            'usuario' => [
                'id' => $usuario['id'],
                'nombre' => $usuario['nombre'],
                'email' => $usuario['email'],
                'rol' => $usuario['rol']
            ]
        ]);

    } else {
        http_response_code(401); // "no autorizado"
        echo json_encode([
            'exito' => false,
            'mensaje' => 'Email o contraseña incorrectos'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error del servidor: ' . $e->getMessage()
    ]);
}