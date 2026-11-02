# Base de datos de Tienda 3V

Esquema relacional para MySQL 8.0.16 o posterior. El archivo vigente es `esquema.sql`; crea la base `tienda3v`, sus 11 tablas y los datos iniciales de roles, categorías, sucursales y métodos de pago.

## Archivos

- [Esquema SQL](./esquema.sql)
- [Modelo entidad-relación (Mermaid)](./modelo_entidad_relacion.mmd)
- [Diagrama entidad-relación (PNG)](./diagrama-entidad-relacion.png)

## Ejecución

Desde la raíz del repositorio, en una terminal compatible con la redirección de entrada:

```sh
mysql -u root -p < database/esquema.sql
```

MySQL solicitará la contraseña de una cuenta que tenga permiso para crear la base de datos. En el cliente MySQL también puedes ejecutar `source database/esquema.sql` desde la raíz del repositorio.

`create table if not exists` permite conservar tablas existentes, pero no renombra sus columnas. Este archivo define el esquema para una instalación nueva; una base creada con nombres anteriores requiere una migración antes de usar los nombres actualizados.

## Convención de nombres

Los nombres de tablas, columnas, índices y restricciones están en minúsculas y usan guiones bajos. Los identificadores son descriptivos y comienzan por `id_`; las claves foráneas usan el mismo nombre que la clave primaria referenciada, sin sufijo `_fk`.

| Tabla | Clave primaria |
| --- | --- |
| `roles` | `id_rol` |
| `usuarios` | `id_usuario` |
| `categorias` | `id_categoria` |
| `productos` | `id_producto` |
| `sucursales` | `id_sucursal` |
| `inventario_sucursal` | `id_sucursal`, `id_producto` (compuesta) |
| `cupones` | `id_cupon` |
| `metodos_pago` | `id_metodo_pago` |
| `pedidos` | `id_pedido` |
| `detalle_pedido` | `id_detalle_pedido` |
| `mensajes_contacto` | `id_mensaje_contacto` |

## Reglas implementadas

- Cada usuario requiere un rol y un correo único. La contraseña se almacena en `password_hash`.
- Cada producto requiere una categoría y un precio mayor que cero. Si tiene `precio_anterior`, debe ser mayor que el precio actual.
- El inventario registra una existencia no negativa por combinación de sucursal y producto.
- Un pedido requiere sucursal y método de pago; el usuario y el cupón son opcionales. Conserva los datos de contacto del cliente.
- El subtotal, el descuento y el total del pedido se almacenan; deben ser no negativos y cumplir `total = subtotal - descuento`.
- Cada detalle tiene un identificador propio, requiere pedido y cantidad entera positiva, y conserva nombre de producto, precio unitario y subtotal. Debe cumplir `subtotal = cantidad * precio_unitario`. El producto puede quedar sin referencia si se elimina del catálogo.
- Un cupón tiene un código único y un porcentaje de descuento mayor que cero y menor o igual a cien. Si se indican ambas fechas de vigencia, el final debe ser posterior al inicio.
- Los mensajes de contacto pueden asociarse a un usuario o conservar únicamente los datos de contacto.

Las relaciones y las acciones de actualización y eliminación se definen en `esquema.sql`. El esquema no incluye vistas, promociones por producto, recuperación de contraseñas ni una tabla de carrito.
