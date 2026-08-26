<?php
// eliminar_cliente.php - Elimina un cliente - Solo administradores

require 'config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'Debes iniciar sesión']);
    exit;
}

if ($_SESSION['usuario_rol'] !== 'administrador') {
    http_response_code(403);
    echo json_encode(['exito' => false, 'mensaje' => 'No tienes permisos para eliminar clientes']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$id = $datos['id'] ?? null;

if (empty($id) || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'ID de cliente inválido']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM clientes WHERE id = :id");
    $stmt->execute(['id' => $id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['exito' => false, 'mensaje' => 'Cliente no encontrado']);
        exit;
    }

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Cliente eliminado correctamente'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al eliminar el cliente: ' . $e->getMessage()
    ]);
}