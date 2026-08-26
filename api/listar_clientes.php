<?php
// listar_clientes.php - Devuelve todos los clientes

require 'config.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT id, nombre, email, telefono, direccion FROM clientes ORDER BY nombre");
    $stmt->execute();
    $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'exito' => true,
        'datos' => $clientes
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al obtener clientes: ' . $e->getMessage()
    ]);
}