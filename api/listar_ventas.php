<?php
// listar_ventas.php - Devuelve el historial de ventas con su detalle

require 'config.php';
header('Content-Type: application/json');

try {
    // Traemos el encabezado de cada venta, con el nombre del cliente y del usuario que la hizo
    $sqlVentas = "SELECT 
                    v.id,
                    v.fecha,
                    v.total,
                    v.estado,
                    c.nombre AS cliente_nombre,
                    u.nombre AS usuario_nombre
                FROM ventas v
                LEFT JOIN clientes c ON v.cliente_id = c.id
                INNER JOIN usuarios u ON v.usuario_id = u.id
                ORDER BY v.fecha DESC";

    $stmt = $pdo->prepare($sqlVentas);
    $stmt->execute();
    $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Por cada venta, traemos también su detalle (qué productos incluyó)
    $sqlDetalle = "SELECT 
                        dv.producto_id,
                        p.nombre AS producto_nombre,
                        dv.cantidad,
                        dv.precio_unitario,
                        dv.subtotal
                    FROM detalle_venta dv
                    INNER JOIN productos p ON dv.producto_id = p.id
                    WHERE dv.venta_id = :venta_id";

    $stmtDetalle = $pdo->prepare($sqlDetalle);

    foreach ($ventas as &$venta) { // el "&" es importante: nos permite MODIFICAR cada venta dentro del array original
        $stmtDetalle->execute(['venta_id' => $venta['id']]);
        $venta['detalle'] = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
    }
    unset($venta); // buena práctica después de un foreach con referencia (&)

    echo json_encode([
        'exito' => true,
        'datos' => $ventas
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al obtener ventas: ' . $e->getMessage()
    ]);
}