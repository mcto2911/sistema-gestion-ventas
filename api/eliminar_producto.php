<?php
// eliminar_producto.php - Desactiva un producto (soft delete)

require 'config.php';
header('Content-Type: application/json');

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
        // rowCount() = cuántas filas se modificaron. Si es 0, ese ID no existía
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