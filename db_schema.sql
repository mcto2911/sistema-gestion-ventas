-- =====================================================================
-- Sistema de Gestión de Ventas e Inventario
-- Esquema de Base de Datos - MySQL
-- =====================================================================
-- Motor: InnoDB (necesario para Foreign Keys y Transacciones)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS ventas_inventario
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ventas_inventario;

-- ---------------------------------------------------------------------
-- Tabla: usuarios
-- Administradores y empleados que usan el sistema (login, roles)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,          -- guardar SIEMPRE con password_hash() de PHP, nunca en texto plano
    rol             ENUM('administrador', 'empleado') NOT NULL DEFAULT 'empleado',
    activo          TINYINT(1)      NOT NULL DEFAULT 1, -- para "desactivar" en vez de borrar usuarios
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: categorias
-- Para poder filtrar productos por categoría
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL UNIQUE,
    descripcion     VARCHAR(255)    NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabla: productos
-- ---------------------------------------------------------------------
CREATE TABLE productos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id    INT             NOT NULL,
    nombre          VARCHAR(150)    NOT NULL,
    descripcion     VARCHAR(255)    NULL,
    precio          DECIMAL(10,2)   NOT NULL,
    stock           INT             NOT NULL DEFAULT 0,
    stock_minimo    INT             NOT NULL DEFAULT 5,  -- umbral para "alerta de stock bajo"
    activo          TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_precio_positivo CHECK (precio >= 0),
    CONSTRAINT chk_stock_no_negativo CHECK (stock >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);

-- ---------------------------------------------------------------------
-- Tabla: clientes
-- ---------------------------------------------------------------------
CREATE TABLE clientes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(150)    NOT NULL,
    email           VARCHAR(150)    NULL UNIQUE,
    telefono        VARCHAR(20)     NULL,
    direccion       VARCHAR(255)    NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_clientes_nombre ON clientes(nombre);

-- ---------------------------------------------------------------------
-- Tabla: ventas (encabezado de la venta)
-- ---------------------------------------------------------------------
CREATE TABLE ventas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id      INT             NULL,      -- puede ser NULL si es "cliente ocasional"
    usuario_id      INT             NOT NULL,   -- quién hizo la venta
    fecha           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total           DECIMAL(10,2)   NOT NULL DEFAULT 0,
    estado          ENUM('completada', 'anulada') NOT NULL DEFAULT 'completada',

    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_venta_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);

-- ---------------------------------------------------------------------
-- Tabla: detalle_venta (líneas de cada venta - relación N:M ventas↔productos)
-- ---------------------------------------------------------------------
CREATE TABLE detalle_venta (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    venta_id            INT             NOT NULL,
    producto_id         INT             NOT NULL,
    cantidad            INT             NOT NULL,
    precio_unitario     DECIMAL(10,2)   NOT NULL,   -- se copia el precio del producto AL MOMENTO de la venta
    subtotal            DECIMAL(10,2)   GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,

    CONSTRAINT fk_detalle_venta
        FOREIGN KEY (venta_id) REFERENCES ventas(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_detalle_venta ON detalle_venta(venta_id);
CREATE INDEX idx_detalle_producto ON detalle_venta(producto_id);

-- =====================================================================
-- DATOS DE EJEMPLO (para probar el sistema de inmediato)
-- =====================================================================

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Admin General', 'admin@tienda.com', '$2y$10$exampleHashReemplazarEnBackend', 'administrador'),
('Empleado Uno', 'empleado1@tienda.com', '$2y$10$exampleHashReemplazarEnBackend', 'empleado');

INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica', 'Dispositivos y accesorios electrónicos'),
('Oficina', 'Artículos de oficina y papelería'),
('Hogar', 'Productos para el hogar');

INSERT INTO productos (categoria_id, nombre, descripcion, precio, stock, stock_minimo) VALUES
(1, 'Mouse inalámbrico', 'Mouse óptico USB', 25.90, 40, 10),
(1, 'Teclado mecánico', 'Teclado retroiluminado', 89.90, 15, 5),
(2, 'Cuaderno A4', '100 hojas rayadas', 4.50, 200, 30),
(3, 'Lámpara LED', 'Lámpara de escritorio regulable', 35.00, 8, 5);

INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Juan Pérez', 'juan.perez@email.com', '999888777', 'Av. Siempre Viva 123'),
('María López', 'maria.lopez@email.com', '988777666', 'Jr. Las Flores 456');

-- =====================================================================
-- NOTA IMPORTANTE SOBRE CONCURRENCIA DE STOCK
-- =====================================================================
-- Cuando el backend (PHP) registre una venta, la lógica DEBE ir dentro
-- de una transacción, con un SELECT ... FOR UPDATE sobre el producto,
-- para evitar que dos usuarios vendan el mismo stock al mismo tiempo:
--
--   START TRANSACTION;
--   SELECT stock FROM productos WHERE id = ? FOR UPDATE;
--   -- validar que stock >= cantidad solicitada
--   UPDATE productos SET stock = stock - ? WHERE id = ?;
--   INSERT INTO detalle_venta (...) VALUES (...);
--   COMMIT;
--
-- Esto es justo lo que le puedes explicar al entrevistador cuando te
-- pregunten "¿qué pasa si dos usuarios venden el último producto?".
-- =====================================================================
