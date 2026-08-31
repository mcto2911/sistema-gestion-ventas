<?php
// Servir la app React compilada
$file = __DIR__ . '/frontend/dist/index.html';

if (file_exists($file)) {
    readfile($file);
    exit;
}

// Si no existe, mostrar error
http_response_code(404);
echo "Archivo no encontrado: " . $file;
?>