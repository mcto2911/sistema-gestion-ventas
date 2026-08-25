<?php
// crear_producto.php - Inserta un nuevo producto

require 'config.php';
header('Content-Type: application/json');

$datos = json_decode(file_get_contents('php://input'), true);

$nombre = trim($datos['nombre'] ?? '');
$descripcion = trim($datos['descripcion'] ?? '');
$precio = $datos['precio'] ?? null;
$stock = $datos['stock'] ?? null;
$stock_minimo = $datos['stock_minimo'] ?? 5;
$categoria_id = $datos['categoria_id'] ?? null;

// Validaciones básicas del lado del servidor
// (nunca confíes solo en la validación de React, el servidor SIEMPRE debe validar también)
if (empty($nombre) || $precio === null || $stock === null || empty($categoria_id)) {
    http_response_code(400);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Nombre, precio, stock y categoría son obligatorios'
    ]);
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
    $sql = "INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, stock_minimo)
            VALUES (:categoria_id, :nombre, :descripcion, :precio, :stock, :stock_minimo)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'categoria_id' => $categoria_id,
        'nombre' => $nombre,
        'descripcion' => $descripcion,
        'precio' => $precio,
        'stock' => $stock,
        'stock_minimo' => $stock_minimo,
    ]);

    $nuevoId = $pdo->lastInsertId(); // el ID que MySQL le asignó automáticamente al nuevo producto

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Producto creado correctamente',
        'id' => $nuevoId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al crear el producto: ' . $e->getMessage()
    ]);
}
