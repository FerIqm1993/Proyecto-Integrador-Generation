-- Esquema relacional para Tienda 3V (MySQL 8+).
-- Ejecutar este archivo con un usuario que tenga permisos para crear bases de datos.
-- Identificadores en minúsculas y snake_case; claves con formato id_<entidad>.
CREATE DATABASE IF NOT EXISTS tienda3v
    CHARACTER SET utf8mb4;
USE tienda3v;

CREATE TABLE IF NOT EXISTS roles (
    id_rol BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY (id_rol),
    UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_rol BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    acepta_terminos BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_usuarios_correo (correo),
    KEY idx_usuarios_rol (id_rol),
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
    id_categoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_categoria),
    UNIQUE KEY uq_categorias_nombre (nombre),
    UNIQUE KEY uq_categorias_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS productos (
    id_producto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_categoria BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    precio DECIMAL(10,2) NOT NULL,
    precio_anterior DECIMAL(10,2) NULL,
    imagen_url LONGTEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_producto),
    KEY idx_productos_categoria_activo (id_categoria, activo),
    CONSTRAINT chk_productos_precio CHECK (precio > 0),
    CONSTRAINT chk_productos_precio_anterior
        CHECK (precio_anterior IS NULL OR precio_anterior > precio),
    CONSTRAINT fk_productos_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sucursales (
    id_sucursal BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NULL,
    horario VARCHAR(150) NULL,
    mapa_url VARCHAR(500) NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_sucursal),
    UNIQUE KEY uq_sucursales_nombre_direccion (nombre, direccion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventario_sucursal (
    id_sucursal BIGINT UNSIGNED NOT NULL,
    id_producto BIGINT UNSIGNED NOT NULL,
    existencia INT UNSIGNED NOT NULL DEFAULT 0,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_sucursal, id_producto),
    CONSTRAINT fk_inventario_sucursal
        FOREIGN KEY (id_sucursal) REFERENCES sucursales (id_sucursal)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cupones (
    id_cupon BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(30) NOT NULL,
    descuento_porcentaje DECIMAL(5,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    valido_desde DATETIME NULL,
    valido_hasta DATETIME NULL,
    maximo_usos INT UNSIGNED NULL,
    usos INT UNSIGNED NOT NULL DEFAULT 0,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cupon),
    UNIQUE KEY uq_cupones_codigo (codigo),
    CONSTRAINT chk_cupones_descuento CHECK (descuento_porcentaje > 0 AND descuento_porcentaje <= 100),
    CONSTRAINT chk_cupones_vigencia
        CHECK (valido_hasta IS NULL OR valido_desde IS NULL OR valido_hasta > valido_desde)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS metodos_pago (
    id_metodo_pago BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id_metodo_pago),
    UNIQUE KEY uq_metodos_pago_nombre (nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NULL,
    id_sucursal BIGINT UNSIGNED NOT NULL,
    id_metodo_pago BIGINT UNSIGNED NOT NULL,
    id_cupon BIGINT UNSIGNED NULL,
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
    PRIMARY KEY (id_pedido),
    KEY idx_pedidos_usuario_fecha (id_usuario, creado_en),
    KEY idx_pedidos_sucursal_estado (id_sucursal, estado),
    CONSTRAINT chk_pedidos_totales
        CHECK (subtotal >= 0 AND descuento >= 0 AND total >= 0 AND total = subtotal - descuento),
    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_pedidos_sucursal
        FOREIGN KEY (id_sucursal) REFERENCES sucursales (id_sucursal)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pedidos_metodo_pago
        FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago (id_metodo_pago)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pedidos_cupon
        FOREIGN KEY (id_cupon) REFERENCES cupones (id_cupon)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle_pedido BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_pedido BIGINT UNSIGNED NOT NULL,
    id_producto BIGINT UNSIGNED NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_detalle_pedido),
    KEY idx_detalle_pedido_pedido (id_pedido),
    KEY idx_detalle_pedido_producto (id_producto),
    CONSTRAINT chk_detalle_pedido_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_pedido_importes
        CHECK (precio_unitario >= 0 AND subtotal = cantidad * precio_unitario),
    CONSTRAINT fk_detalle_pedido_pedido
        FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_pedido_producto
        FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id_mensaje_contacto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED NULL,
    nombre VARCHAR(180) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    telefono VARCHAR(20) NULL,
    motivo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    acepta_aviso_privacidad BOOLEAN NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'nuevo',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_mensaje_contacto),
    KEY idx_mensajes_contacto_estado_fecha (estado, creado_en),
    CONSTRAINT fk_mensajes_contacto_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO roles (id_rol, nombre) VALUES
    (1, 'cliente'),
    (2, 'administrador');

INSERT IGNORE INTO categorias (id_categoria, nombre, slug) VALUES
    (1, 'Alimentos', 'alimentos'),
    (2, 'Cervezas, Vinos y Licores', 'cervezas-vinos-licores'),
    (3, 'Hogar', 'hogar'),
    (4, 'Ferretería', 'ferreteria'),
    (5, 'Bebidas', 'bebidas'),
    (6, 'Belleza y Cuidado Personal', 'belleza-cuidado-personal'),
    (7, 'Mascotas', 'mascotas');

INSERT IGNORE INTO sucursales (id_sucursal, nombre, direccion, ciudad, estado, horario, mapa_url) VALUES
    (1, 'Sucursal Insurgentes Centro', 'Av. Insurgentes Sur 240, Col. Roma Norte', 'Ciudad de México', 'CDMX', 'Lun - Dom: 7:00 AM - 10:00 PM', '../img/CDMX_Maps.png'),
    (2, 'Sucursal Guadalajara Centro', 'Av. Juárez 450, Sector Juárez', 'Guadalajara', 'Jalisco', 'Lun - Dom: 8:00 AM - 9:00 PM', '../img/GUADALAJARA_Maps.png'),
    (3, 'Sucursal Monterrey Tec', 'Av. Eugenio Garza Sada 2500', 'Monterrey', 'Nuevo León', 'Lun - Dom: 7:00 AM - 10:00 PM', '../img/MTY_Maps.png');

INSERT IGNORE INTO metodos_pago (id_metodo_pago, nombre) VALUES
    (1, 'Tarjeta'),
    (2, 'Contra entrega');

INSERT IGNORE INTO usuarios (id_usuario, id_rol, nombre, apellido, correo, telefono, password_hash, acepta_terminos, activo) VALUES
    (1, 2, 'ADMINISTRADOR', 'TIENDA 3V', 'contacto.tiendas3v@gmail.com', '5500000000', 'UG9sbGl0b3NlbmZ1Z2Ez', TRUE, TRUE);

INSERT IGNORE INTO productos (id_producto, id_categoria, nombre, descripcion, precio, precio_anterior, imagen_url, activo) VALUES
    (1, 1, 'Aceite vegetal 1L', 'Aceite vegetal de cocina botella 1L', 45.90, 65.00, 'aceite.jpg', TRUE),
    (2, 1, 'Leche entera 1L', 'Leche entera ultrapasteurizada 1L', 28.50, 34.00, 'leche.jpg', TRUE),
    (3, 2, 'Vino tinto 750ml', 'Vino tinto botella de 750ml', 145.00, 180.00, 'vino.jpg', TRUE),
    (4, 2, 'Cerveza clara 6pk', 'Paquete de 6 cervezas claras', 98.00, NULL, 'cerveza.jpg', TRUE),
    (5, 3, 'Detergente 3kg', 'Detergente en polvo multiusos 3kg', 89.00, 120.00, 'detergente.jpg', TRUE),
    (6, 3, 'Papel higiénico 12pk', 'Paquete de 12 rollos de papel higiénico', 65.00, NULL, 'papel.jpg', TRUE),
    (7, 4, 'Martillo de uña', 'Martillo de uña uso doméstico y profesional', 129.00, NULL, 'martillo.jpg', TRUE),
    (8, 4, 'Juego de desarmadores', 'Juego de desarmadores de precisión', 159.00, 179.00, 'desarmadores.jpg', TRUE),
    (9, 5, 'Refresco 2L', 'Refresco sabor cola botella 2L', 24.00, NULL, 'refresco.jpg', TRUE),
    (10, 5, 'Agua mineral 1.5L', 'Agua mineral natural botella 1.5L', 12.50, NULL, 'agua.jpg', TRUE),
    (11, 6, 'Shampoo 750ml', 'Shampoo cuidado diario 750ml', 54.90, NULL, 'shampoo.jpg', TRUE),
    (12, 6, 'Jabón 3pk', 'Paquete de 3 jabones de tocador', 42.00, NULL, 'jabon.jpg', TRUE),
    (13, 7, 'Croquetas perro 2kg', 'Alimento balanceado para perro 2kg', 189.00, 210.00, 'croquetas.jpg', TRUE),
    (14, 7, 'Arena para gato 4kg', 'Arena aglutinante para gato 4kg', 115.00, NULL, 'arena.jpg', TRUE);

INSERT IGNORE INTO cupones (id_cupon, codigo, descuento_porcentaje, activo, usos) VALUES
    (1, 'BIENVENIDO10', 10.00, TRUE, 0);
