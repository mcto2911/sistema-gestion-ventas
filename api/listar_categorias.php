<?php
// listar_categorias.php - Devuelve todas las categorías en formato JSON

header('Content-Type: application/json'); // le decimos al navegador: "esto que te mando es JSON"
require 'config.php'; // reutilizamos la conexión que ya armamos

try {
    // Preparamos la consulta (aunque no tiene datos externos, es buena costumbre)
    $stmt = $pdo->prepare("SELECT id, nombre, descripcion FROM categorias ORDER BY nombre");
    $stmt->execute();

    // fetchAll trae TODAS las filas que devolvió la consulta
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolvemos la respuesta como JSON
    echo json_encode([
        'exito' => true,
        'datos' => $categorias
    ]);

} catch (PDOException $e) {
    http_response_code(500); // código HTTP de "error del servidor"
    echo json_encode([
        'exito' => false,
        'mensaje' => 'Error al obtener categorías: ' . $e->getMessage()
    ]);
}