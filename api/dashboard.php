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

    // ---- Productos con stock bajo ----
    $stmt = $pdo->prepare(
        "SELECT id, nombre, stock, stock_minimo
         FROM productos
         WHERE stock <= stock_minimo AND activo = 1
         ORDER BY stock ASC"
    );
    $stmt->execute();
    $stockBajo = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ---- Productos más vendidos (ahora con stock y categoría) ----
    $stmt = $pdo->prepare(
        "SELECT p.id, p.nombre, p.stock, c.nombre AS categoria_nombre, SUM(dv.cantidad) AS total_vendido
         FROM detalle_venta dv
         INNER JOIN productos p ON dv.producto_id = p.id
         INNER JOIN categorias c ON p.categoria_id = c.id
         INNER JOIN ventas v ON dv.venta_id = v.id
         WHERE v.estado = 'completada'
         GROUP BY p.id, p.nombre, p.stock, c.nombre
         ORDER BY total_vendido DESC
         LIMIT 5"
    );
    $stmt->execute();
    $masVendidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ---- NUEVO: Ventas de los últimos 6 meses (para el gráfico) ----
    $stmt = $pdo->prepare(
        "SELECT 
            DATE_FORMAT(fecha, '%Y-%m') AS mes,
            DATE_FORMAT(fecha, '%b') AS mes_nombre,
            COALESCE(SUM(total), 0) AS total
         FROM ventas
         WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
           AND estado = 'completada'
         GROUP BY mes, mes_nombre
         ORDER BY mes ASC"
    );
    $stmt->execute();
    $ventasPorMes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'exito' => true,
        'datos' => [
            'ventas_hoy' => $ventasHoy,
            'ventas_mes' => $ventasMes,
            'total_clientes' => (int) $totalClientes,
            'stock_bajo' => $stockBajo,
            'mas_vendidos' => $masVendidos,
            'ventas_por_mes' => $ventasPorMes,
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al obtener el dashboard: ' . $e->getMessage()
    ]);
}