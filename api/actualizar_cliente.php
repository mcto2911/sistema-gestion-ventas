<?php
// actualizar_cliente.php - Actualiza un cliente existente

require 'config.php';
header('Content-Type: application/json');

$datos = json_decode(file_get_contents('php://input'), true);

$id = $datos['id'] ?? null;
$nombre = trim($datos['nombre'] ?? '');
$email = trim($datos['email'] ?? '');
$telefono = trim($datos['telefono'] ?? '');
$direccion = trim($datos['direccion'] ?? '');

if (empty($id) || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'ID de cliente inválido']);
    exit;
}

if (empty($nombre)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'El nombre es obligatorio']);
    exit;
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'El email no tiene un formato válido']);
    exit;
}

try {
    $sql = "UPDATE clientes 
            SET nombre = :nombre,
                email = :email,
                telefono = :telefono,
                direccion = :direccion
            WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'id' => $id,
        'nombre' => $nombre,
        'email' => empty($email) ? null : $email,
        'telefono' => empty($telefono) ? null : $telefono,
        'direccion' => empty($direccion) ? null : $direccion,
    ]);

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Cliente actualizado correctamente'
    ]);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe un cliente con ese email']);
        exit;
    }

    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al actualizar el cliente: ' . $e->getMessage()
    ]);
}