<?php
// eliminar_producto.php - Desactiva un producto (soft delete) - Solo administradores

require 'config.php';
session_start();
header('Content-Type: application/json');

// Verificar que haya sesión activa
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'Debes iniciar sesión']);
    exit;
}

// Verificar que el usuario sea administrador
if ($_SESSION['usuario_rol'] !== 'administrador') {
    http_response_code(403); // "prohibido" - a diferencia de 401, aquí SÍ sabemos quién eres, pero no tienes permiso
    echo json_encode(['exito' => false, 'mensaje' => 'No tienes permisos para eliminar productos']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$id = $datos['id'] ?? null;

if (empty($id) || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'ID de producto inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE productos SET activo = 0 WHERE id = :id");
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['exito' => false, 'mensaje' => 'Producto no encontrado']);
        exit;
    }

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Producto eliminado correctamente'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al eliminar el producto: ' . $e->getMessage()
    ]);
}