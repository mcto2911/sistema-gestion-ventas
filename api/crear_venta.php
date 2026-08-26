<?php
// crear_venta.php - Registra una venta completa (encabezado + detalle + descuento de stock)

require 'config.php';
session_start();
header('Content-Type: application/json');

// Solo usuarios con sesión iniciada pueden vender
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'Debes iniciar sesión']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);

$cliente_id = $datos['cliente_id'] ?? null; // puede venir null (cliente ocasional)
$productos = $datos['productos'] ?? [];      // array: [{producto_id, cantidad}, ...]
$usuario_id = $_SESSION['usuario_id'];       // NUNCA confiar en un usuario_id mandado por el frontend

if (empty($productos) || !is_array($productos)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'La venta debe tener al menos un producto']);
    exit;
}

try {
    // ---- Iniciamos la transacción: todo lo de aquí abajo es "todo o nada" ----
    $pdo->beginTransaction();

    $total = 0;
    $detallesParaInsertar = [];

    // Primero: revisamos y calculamos todo, sin insertar nada aún
    foreach ($productos as $item) {
        $producto_id = $item['producto_id'] ?? null;
        $cantidad = $item['cantidad'] ?? null;

        if (empty($producto_id) || empty($cantidad) || $cantidad <= 0) {
            throw new Exception('Datos de producto inválidos en la venta');
        }

        // FOR UPDATE: bloquea esta fila hasta que termine la transacción,
        // para que otro usuario no pueda vender el mismo stock al mismo tiempo
        $stmt = $pdo->prepare("SELECT id, nombre, precio, stock FROM productos WHERE id = :id FOR UPDATE");
        $stmt->execute(['id' => $producto_id]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$producto) {
            throw new Exception("El producto con ID $producto_id no existe");
        }

        if ($producto['stock'] < $cantidad) {
            throw new Exception("Stock insuficiente para \"{$producto['nombre']}\". Disponible: {$producto['stock']}, solicitado: $cantidad");
        }

        $subtotal = $producto['precio'] * $cantidad;
        $total += $subtotal;

        $detallesParaInsertar[] = [
            'producto_id' => $producto_id,
            'cantidad' => $cantidad,
            'precio_unitario' => $producto['precio'],
        ];
    }

    // Segundo: creamos el encabezado de la venta
    $stmt = $pdo->prepare("INSERT INTO ventas (cliente_id, usuario_id, total) VALUES (:cliente_id, :usuario_id, :total)");
    $stmt->execute([
        'cliente_id' => empty($cliente_id) ? null : $cliente_id,
        'usuario_id' => $usuario_id,
        'total' => $total,
    ]);
    $venta_id = $pdo->lastInsertId();

    // Tercero: insertamos cada línea de detalle Y descontamos el stock
    foreach ($detallesParaInsertar as $detalle) {
        $stmt = $pdo->prepare(
            "INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
             VALUES (:venta_id, :producto_id, :cantidad, :precio_unitario)"
        );
        $stmt->execute([
            'venta_id' => $venta_id,
            'producto_id' => $detalle['producto_id'],
            'cantidad' => $detalle['cantidad'],
            'precio_unitario' => $detalle['precio_unitario'],
        ]);

        $stmt = $pdo->prepare("UPDATE productos SET stock = stock - :cantidad WHERE id = :id");
        $stmt->execute([
            'cantidad' => $detalle['cantidad'],
            'id' => $detalle['producto_id'],
        ]);
    }

    // Si llegamos hasta aquí sin errores, confirmamos todo de forma permanente
    $pdo->commit();

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Venta registrada correctamente',
        'venta_id' => $venta_id,
        'total' => $total,
    ]);

} catch (Exception $e) {
    // Si algo falló en cualquier punto, deshacemos TODO (como si nada hubiera pasado)
    $pdo->rollBack();

    http_response_code(400);
    echo json_encode([
        'exito' => false,
        'mensaje' => $e->getMessage(),
    ]);
}
