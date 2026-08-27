<?php
// cambiar_password.php - Permite al usuario logueado cambiar su propia contraseña

require 'config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'Debes iniciar sesión']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);

$contrasenaActual = $datos['contrasena_actual'] ?? '';
$contrasenaNueva = $datos['contrasena_nueva'] ?? '';

if (empty($contrasenaActual) || empty($contrasenaNueva)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Completa ambos campos']);
    exit;
}

if (strlen($contrasenaNueva) < 8) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'La nueva contraseña debe tener al menos 8 caracteres']);
    exit;
}

try {
    // Traemos el hash actual del usuario logueado, para verificar su contraseña actual
    $stmt = $pdo->prepare("SELECT password_hash FROM usuarios WHERE id = :id");
    $stmt->execute(['id' => $_SESSION['usuario_id']]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario || !password_verify($contrasenaActual, $usuario['password_hash'])) {
        http_response_code(401);
        echo json_encode(['exito' => false, 'mensaje' => 'La contraseña actual es incorrecta']);
        exit;
    }

    $nuevoHash = password_hash($contrasenaNueva, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("UPDATE usuarios SET password_hash = :hash WHERE id = :id");
    $stmt->execute([
        'hash' => $nuevoHash,
        'id' => $_SESSION['usuario_id'],
    ]);

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Contraseña actualizada correctamente'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al cambiar la contraseña: ' . $e->getMessage()
    ]);
}