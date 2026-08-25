<?php
// logout.php - Cierra la sesión actual

require 'config.php';
session_start();
header('Content-Type: application/json');

session_unset();
session_destroy();

echo json_encode([
    'exito' => true,
    'mensaje' => 'Sesión cerrada correctamente'
]);