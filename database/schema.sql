-- Esquema relacional para Tienda 3V (MySQL 8+).
-- Ejecutar este archivo con un usuario que tenga permisos para crear bases de datos.
CREATE DATABASE IF NOT EXISTS tienda3v
    CHARACTER SET utf8mb4;
USE tienda3v;

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    rol_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    acepta_terminos BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_correo (correo),
    KEY idx_usuarios_rol (rol_id),
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (rol_id) REFERENCES roles (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categorias_nombre (nombre),
    UNIQUE KEY uq_categorias_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS productos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    categoria_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    precio DECIMAL(10,2) NOT NULL,
    precio_anterior DECIMAL(10,2) NULL,
    imagen_url VARCHAR(500) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_productos_categoria_activo (categoria_id, activo),
    CONSTRAINT chk_productos_precio CHECK (precio > 0),
    CONSTRAINT chk_productos_precio_anterior
        CHECK (precio_anterior IS NULL OR precio_anterior > precio),
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sucursales (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NULL,
    horario VARCHAR(150) NULL,
    mapa_url VARCHAR(500) NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_sucursales_nombre_direccion (nombre, direccion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventario_sucursal (
    sucursal_id BIGINT UNSIGNED NOT NULL,
    producto_id BIGINT UNSIGNED NOT NULL,
    existencia INT UNSIGNED NOT NULL DEFAULT 0,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (sucursal_id, producto_id),
    CONSTRAINT fk_inventario_sucursal
        FOREIGN KEY (sucursal_id) REFERENCES sucursales (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (producto_id) REFERENCES productos (id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cupones (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(30) NOT NULL,
    descuento_porcentaje DECIMAL(5,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    valido_desde DATETIME NULL,
    valido_hasta DATETIME NULL,
    maximo_usos INT UNSIGNED NULL,
    usos INT UNSIGNED NOT NULL DEFAULT 0,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cupones_codigo (codigo),
    CONSTRAINT chk_cupones_descuento CHECK (descuento_porcentaje > 0 AND descuento_porcentaje <= 100),
    CONSTRAINT chk_cupones_vigencia
        CHECK (valido_hasta IS NULL OR valido_desde IS NULL OR valido_hasta > valido_desde)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS metodos_pago (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE KEY uq_metodos_pago_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NULL,
    sucursal_id BIGINT UNSIGNED NOT NULL,
    metodo_pago_id BIGINT UNSIGNED NOT NULL,
    cupon_id BIGINT UNSIGNED NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    estado_pago VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    nombre_cliente VARCHAR(180) NOT NULL,
    correo_cliente VARCHAR(254) NOT NULL,
    telefono_cliente VARCHAR(20) NOT NULL,
    codigo_cupon VARCHAR(30) NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_pedidos_usuario_fecha (usuario_id, creado_en),
    KEY idx_pedidos_sucursal_estado (sucursal_id, estado),
    CONSTRAINT chk_pedidos_totales
        CHECK (subtotal >= 0 AND descuento >= 0 AND total >= 0 AND total = subtotal - descuento),
    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_pedidos_sucursal
        FOREIGN KEY (sucursal_id) REFERENCES sucursales (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pedidos_metodo_pago
        FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pedidos_cupon
        FOREIGN KEY (cupon_id) REFERENCES cupones (id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT UNSIGNED NOT NULL,
    producto_id BIGINT UNSIGNED NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_detalle_pedido_pedido (pedido_id),
    KEY idx_detalle_pedido_producto (producto_id),
    CONSTRAINT chk_detalle_pedido_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_pedido_importes
        CHECK (precio_unitario >= 0 AND subtotal = cantidad * precio_unitario),
    CONSTRAINT fk_detalle_pedido_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_pedido_producto
        FOREIGN KEY (producto_id) REFERENCES productos (id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NULL,
    nombre VARCHAR(180) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    telefono VARCHAR(20) NULL,
    motivo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    acepta_aviso_privacidad BOOLEAN NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'nuevo',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_mensajes_contacto_estado_fecha (estado, creado_en),
    CONSTRAINT fk_mensajes_contacto_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (nombre) VALUES ('cliente'), ('administrador');

INSERT IGNORE INTO categorias (nombre, slug) VALUES
    ('Alimentos', 'alimentos'),
    ('Cervezas, Vinos y Licores', 'cervezas-vinos-licores'),
    ('Hogar', 'hogar'),
    ('Ferretería', 'ferreteria'),
    ('Bebidas', 'bebidas'),
    ('Belleza y Cuidado Personal', 'belleza-cuidado-personal'),
    ('Mascotas', 'mascotas');

INSERT IGNORE INTO sucursales (nombre, direccion, ciudad, estado, horario, mapa_url) VALUES
    ('Sucursal Insurgentes Centro', 'Av. Insurgentes Sur 240, Col. Roma Norte', 'Ciudad de México', 'CDMX', 'Lun - Dom: 7:00 AM - 10:00 PM', '../img/CDMX_Maps.png'),
    ('Sucursal Guadalajara Centro', 'Av. Juárez 450, Sector Juárez', 'Guadalajara', 'Jalisco', 'Lun - Dom: 8:00 AM - 9:00 PM', '../img/GUADALAJARA_Maps.png'),
    ('Sucursal Monterrey Tec', 'Av. Eugenio Garza Sada 2500', 'Monterrey', 'Nuevo León', 'Lun - Dom: 7:00 AM - 10:00 PM', '../img/MTY_Maps.png');

INSERT IGNORE INTO metodos_pago (nombre) VALUES
    ('Tarjeta'),
    ('Contra entrega');
