# Base de datos de Tienda 3V

Esquema relacional para MySQL 8.0.16 o posterior, ajustado a las páginas actuales y al PDF de reglas de negocio. Esta carpeta incluye el modelo, scripts por actividad, datos de prueba, plantilla de conexión y guías PDF.

## Archivos

- [Reglas de negocio (PDF)](./documentos/reglas_de_negocio.pdf)
- [Modelo entidad-relación (Mermaid)](./modelo_entidad_relacion.mmd)
- [Guía paso a paso (PDF)](./documentos/guia_paso_a_paso.pdf)
- [Plantilla de usuario MySQL](./plantillas/crear_usuario_prueba.sql)
- [Plantilla de variables de conexión](./plantillas/conexion.env.example)

## Orden de ejecución

Ejecuta desde la raíz del repositorio, en una terminal. MySQL pedirá la contraseña de una cuenta que ya tenga permiso para crear la base:

```sh
mysql -u root -p < database/scripts/01_crear_base.sql
mysql -u root -p tienda3v < database/scripts/02_catalogos_y_sucursales.sql
mysql -u root -p tienda3v < database/scripts/03_usuarios.sql
mysql -u root -p tienda3v < database/scripts/04_catalogo_inventario_promociones.sql
mysql -u root -p tienda3v < database/scripts/05_pedidos_detalles_cupones.sql
mysql -u root -p tienda3v < database/scripts/06_contacto.sql
mysql -u root -p tienda3v < database/scripts/07_reglas_y_vistas.sql
mysql -u root -p tienda3v < database/scripts/08_datos_prueba.sql
```

Usa estos scripts como esquema vigente. `schema.sql` es un borrador monolítico anterior; no lo combines con los scripts 01–08.

Los scripts de estructura crean relaciones y restricciones. Ejecuta `08_datos_prueba.sql` una sola vez en una base vacía. El script inserta al menos cinco filas por entidad, salvo las tres sucursales; roles y métodos de pago conservan únicamente las opciones reales que establecen las reglas.

## Reglas implementadas

- Un pedido requiere un usuario y una sucursal; cliente, sucursal y método de pago deben existir.
- La clave primaria de detalle es `(id_pedido_fk, id_producto_fk)`, por lo que el producto aparece una sola vez por pedido; la cantidad debe ser un entero mayor que cero.
- El precio unitario y descuento de producto se guardan como fotografías del momento de compra.
- Promociones por producto y cupones globales son entidades distintas. Se aplica como máximo un cupón en el primer pedido; puede combinarse con descuentos por producto, y su uso se consume al crear el pedido aun si después se cancela.
- El total y el importe de línea no se almacenan: se calculan en `vw_totales_pedido` y `vw_importes_detalle_pedido`.
- El efectivo solo se permite en sucursal; tarjeta de crédito y débito son las opciones de tarjeta web.
- La contraseña persistida es un hash. Los valores `password_hash` de prueba son marcadores inválidos, nunca contraseñas reales.
- La recuperación de contraseña persiste únicamente hashes de tokens de un solo uso y con vencimiento; el flujo actual del frontend debe migrar a backend para aplicarlo.
- El carrito continúa en `localStorage` según el frontend actual; no se agrega una tabla de carrito persistente.

## Conexión local

Revisa [la guía PDF](./documentos/guia_paso_a_paso.pdf). Si prefieres una cuenta dedicada, edita el marcador de la plantilla SQL antes de ejecutarla con una cuenta administradora existente. La cuenta propuesta queda restringida a `tienda3v.*`; no uses credenciales de ejemplo fuera del desarrollo local.
