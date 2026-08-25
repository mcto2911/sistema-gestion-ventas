<?php
// actualizar_producto.php - Actualiza un producto existente

require 'config.php';
header('Content-Type: application/json');

$datos = json_decode(file_get_contents('php://input'), true);

$id = $datos['id'] ?? null;
$nombre = trim($datos['nombre'] ?? '');
$descripcion = trim($datos['descripcion'] ?? '');
$precio = $datos['precio'] ?? null;
$stock = $datos['stock'] ?? null;
$stock_minimo = $datos['stock_minimo'] ?? 5;
$categoria_id = $datos['categoria_id'] ?? null;

if (empty($id) || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'ID de producto inválido']);
    exit;
}

if (empty($nombre) || $precio === null || $stock === null || empty($categoria_id)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Nombre, precio, stock y categoría son obligatorios']);
    exit;
}

if (!is_numeric($precio) || $precio < 0) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'El precio debe ser un número válido']);
    exit;
}

if (!is_numeric($stock) || $stock < 0) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'El stock debe ser un número válido']);
    exit;
}

try {
    $sql = "UPDATE productos 
            SET categoria_id = :categoria_id,
                nombre = :nombre,
                descripcion = :descripcion,
                precio = :precio,
                stock = :stock,
                stock_minimo = :stock_minimo
            WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'id' => $id,
        'categoria_id' => $categoria_id,
        'nombre' => $nombre,
        'descripcion' => $descripcion,
        'precio' => $precio,
        'stock' => $stock,
        'stock_minimo' => $stock_minimo,
    ]);

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Producto actualizado correctamente'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al actualizar el producto: ' . $e->getMessage()
    ]);
}