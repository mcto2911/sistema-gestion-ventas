<?php
// verificar_sesion.php - Indica si hay una sesión activa

require 'config.php'; // esto agrega los headers de CORS + conexión (aunque no usemos $pdo aquí, no hace daño)
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['usuario_id'])) {
    echo json_encode([
        'exito' => true,
        'autenticado' => true,
        'usuario' => [
            'id' => $_SESSION['usuario_id'],
            'nombre' => $_SESSION['usuario_nombre'],
            'rol' => $_SESSION['usuario_rol']
        ]
    ]);
} else {
    echo json_encode([
        'exito' => true,
        'autenticado' => false
    ]);
}