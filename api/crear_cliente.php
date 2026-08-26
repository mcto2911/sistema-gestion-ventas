<?php
// crear_cliente.php - Inserta un nuevo cliente

require 'config.php';
header('Content-Type: application/json');

$datos = json_decode(file_get_contents('php://input'), true);

$nombre = trim($datos['nombre'] ?? '');
$email = trim($datos['email'] ?? '');
$telefono = trim($datos['telefono'] ?? '');
$direccion = trim($datos['direccion'] ?? '');

if (empty($nombre)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'El nombre es obligatorio']);
    exit;
}

// Si mandaron un email, validamos que tenga formato correcto
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'El email no tiene un formato válido']);
    exit;
}

try {
    $sql = "INSERT INTO clientes (nombre, email, telefono, direccion)
            VALUES (:nombre, :email, :telefono, :direccion)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'nombre' => $nombre,
        'email' => empty($email) ? null : $email, // si viene vacío, guardamos NULL en vez de texto vacío
        'telefono' => empty($telefono) ? null : $telefono,
        'direccion' => empty($direccion) ? null : $direccion,
    ]);

    $nuevoId = $pdo->lastInsertId();

    echo json_encode([
        'exito' => true,
        'mensaje' => 'Cliente creado correctamente',
        'id' => $nuevoId
    ]);

} catch (PDOException $e) {
    // Si el email ya existe (recuerda que en la tabla es UNIQUE), MySQL lanza un error específico
    if ($e->getCode() == 23000) {
        http_response_code(409); // "conflicto"
        echo json_encode(['exito' => false, 'mensaje' => 'Ya existe un cliente con ese email']);
        exit;
    }

    http_response_code(500);
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al crear el cliente: ' . $e->getMessage()
    ]);
}