<?php
// eliminar_cliente.php - Elimina un cliente

require 'config.php';
header('Content-Type: application/json');

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
    // Si el cliente tiene ventas asociadas, la Foreign Key bloquea el DELETE (ON DELETE SET NULL en este caso)
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al eliminar el cliente: ' . $e->getMessage()
    ]);
}