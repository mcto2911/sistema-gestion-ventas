<?php
// dashboard.php - Devuelve estadísticas resumidas para el panel principal

require 'config.php';
header('Content-Type: application/json');

try {
    // ---- Ventas del día ----
    $stmt = $pdo->prepare(
        "SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS cantidad
         FROM ventas
         WHERE DATE(fecha) = CURDATE() AND estado = 'completada'"
    );
    $stmt->execute();
    $ventasHoy = $stmt->fetch(PDO::FETCH_ASSOC);

    // ---- Ventas del mes ----
    $stmt = $pdo->prepare(
        "SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS cantidad
         FROM ventas
         WHERE MONTH(fecha) = MONTH(CURDATE()) 
           AND YEAR(fecha) = YEAR(CURDATE())
           AND estado = 'completada'"
    );
    $stmt->execute();
    $ventasMes = $stmt->fetch(PDO::FETCH_ASSOC);

    // ---- Total de clientes ----
    $stmt = $pdo->prepare("SELECT COUNT(*) AS total FROM clientes");
    $stmt->execute();
    $totalClientes = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // ---- Productos con stock bajo (stock <= stock_minimo) ----
    $stmt = $pdo->prepare(
        "SELECT id, nombre, stock, stock_minimo
         FROM productos
         WHERE stock <= stock_minimo AND activo = 1
         ORDER BY stock ASC"
    );
    $stmt->execute();
    $stockBajo = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ---- Productos más vendidos (top 5, por cantidad total vendida) ----
    $stmt = $pdo->prepare(
        "SELECT p.id, p.nombre, SUM(dv.cantidad) AS total_vendido
         FROM detalle_venta dv
         INNER JOIN productos p ON dv.producto_id = p.id
         INNER JOIN ventas v ON dv.venta_id = v.id
         WHERE v.estado = 'completada'
         GROUP BY p.id, p.nombre
         ORDER BY total_vendido DESC
         LIMIT 5"
    );
    $stmt->execute();
    $masVendidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'exito' => true,
        'datos' => [
            'ventas_hoy' => $ventasHoy,
            'ventas_mes' => $ventasMes,
            'total_clientes' => (int) $totalClientes,
            'stock_bajo' => $stockBajo,
            'mas_vendidos' => $masVendidos,
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al obtener el dashboard: ' . $e->getMessage()
    ]);
}