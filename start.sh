#!/bin/bash
# Esta línea dice "este es un script bash"

# Entrar en la carpeta frontend
cd frontend

# Instalar las dependencias de Node (npm)
npm install

# Compilar React para producción
npm run build

# Volver a la carpeta raíz
cd ..

# Iniciar el servidor PHP en el puerto de Railway (por defecto 80)
php -S 0.0.0.0:${PORT:-80} -t .