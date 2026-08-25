<?php
// listar_productos.php - Devuelve todos los productos con el nombre de su categoría

require 'config.php';
header('Content-Type: application/json');

try {
    // JOIN: traemos datos de dos tablas relacionadas a la vez (productos + categorias)
    $sql = "SELECT 
                p.id, 
                p.nombre, 
                p.descripcion, 
                p.precio, 
                p.stock, 
                p.stock_minimo,
                c.nombre AS categoria_nombre,
                p.categoria_id
            FROM productos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            WHERE p.activo = 1
            ORDER BY p.nombre";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'exito' => true,
        'datos' => $productos
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al obtener productos: ' . $e->getMessage()
    ]);
}