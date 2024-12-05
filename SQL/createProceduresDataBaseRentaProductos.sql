-- #####################################################################################
-- #####################################################################################
-- #########################PROCEDIMIENTOS DE AUTENTICACIÓN#############################
-- #####################################################################################
-- #####################################################################################
DELIMITER $$
CREATE PROCEDURE register_user( 
    IN p_nombre VARCHAR(55), 
    IN p_apellido_pat VARCHAR(55), 
    IN p_apellido_mat VARCHAR(55),
    IN p_email VARCHAR(50),
    IN p_password VARCHAR(255), -- Aumentada la longitud para soportar hashes
    IN p_avatar VARCHAR(255),
    OUT p_usuario_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255) 
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Capturar el estado SQL y el mensaje de error
        ROLLBACK;
        SET p_usuario_id = NULL;
        SET p_status_message = 'Error durante el registro';
    END;
    -- Etiqueta para controlar el flujo en caso de errores
    proc_end: BEGIN
        -- Iniciar transacción
        START TRANSACTION;

        -- Validación: Campos obligatorios
        IF p_nombre IS NULL OR TRIM(p_nombre) = '' THEN
            SET p_status_message = 'El nombre es requerido';
            ROLLBACK;
            LEAVE proc_end;
        END IF;

        IF p_email IS NULL OR TRIM(p_email) = '' THEN
            SET p_status_message = 'El correo electrónico es requerido';
            ROLLBACK;
            LEAVE proc_end;
        END IF;

        IF p_password IS NULL OR TRIM(p_password) = '' THEN
            SET p_status_message = 'La contraseña es requerida';
            ROLLBACK;
            LEAVE proc_end;
        END IF;

        -- Validación: Formato de correo electrónico
        IF p_email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            SET p_status_message = 'Formato de correo electrónico inválido';
            ROLLBACK;
            LEAVE proc_end;
        END IF;

        -- Validación: Fortaleza de la contraseña
        IF LENGTH(p_password) < 8 OR p_password NOT REGEXP '[A-Za-z]' OR p_password NOT REGEXP '[0-9]' THEN
            SET p_status_message = 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
            ROLLBACK;
            LEAVE proc_end;
        END IF;

        -- Validación: Verificar si el correo electrónico ya existe
        IF EXISTS (SELECT 1 FROM Usuarios WHERE email = p_email) THEN
            SET p_status_message = 'El correo electrónico ya está registrado';
            ROLLBACK;
            LEAVE proc_end;
        END IF;

        -- Insertar el nuevo usuario
        INSERT INTO Usuarios (nombre, apellido_pat, apellido_mat, email, password, avatar, createdAt) 
        VALUES (p_nombre, p_apellido_pat, p_apellido_mat, p_email, p_password, 
                IFNULL(p_avatar, 'default_avatar.png'), NOW());

        -- Obtener el ID del usuario recién registrado
        SET p_usuario_id = LAST_INSERT_ID();

        -- Confirmar la transacción
        COMMIT;

        -- Establecer mensaje de éxito
        SET p_status_message = 'Usuario registrado exitosamente';
    END proc_end;
END$$
DELIMITER ;

-- Procedimiento almacenado para loguear un usuario
DELIMITER $$
CREATE PROCEDURE login_user( 
    IN p_email VARCHAR(100), 
    OUT p_usuario_id INT UNSIGNED,
    OUT p_hashed_password VARCHAR(255),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_sqlstate CHAR(5) DEFAULT '00000';
    DECLARE v_message_text TEXT DEFAULT '';

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Capturar el estado SQL y el mensaje de error
        GET DIAGNOSTICS CONDITION 1 v_sqlstate = RETURNED_SQLSTATE, v_message_text = MESSAGE_TEXT;
        ROLLBACK;
        SET p_usuario_id = NULL;
        SET p_hashed_password = NULL;
        SET p_status_message = CONCAT('Error durante el inicio de sesión: ', v_sqlstate, ' - ', v_message_text);
    END;
    proc_end: BEGIN
        -- Iniciar transacción
        START TRANSACTION;
        -- Validación: Verificar que el email no esté vacío
        IF p_email IS NULL OR TRIM(p_email) = '' THEN
            SET p_status_message = 'El correo electrónico es requerido';
            SET p_usuario_id = NULL;
            SET p_hashed_password = NULL;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Validación: Formato de correo electrónico
        IF p_email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            SET p_status_message = 'Formato de correo electrónico inválido';
            SET p_usuario_id = NULL;
            SET p_hashed_password = NULL;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Verificar si el email existe
        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE email = p_email) THEN
            SET p_status_message = 'El correo electrónico no existe';
            SET p_usuario_id = NULL;
            SET p_hashed_password = NULL;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Obtener el usuario_id y el hashed password
        SELECT usuario_id, password INTO p_usuario_id, p_hashed_password
        FROM Usuarios 
        WHERE email = p_email;
        -- Establecer mensaje de éxito
        SET p_status_message = 'Usuario encontrado';
        -- Confirmar transacción
        COMMIT;
    END proc_end;
END$$
DELIMITER ;
-- #####################################################################################
-- #####################################################################################
-- ##########################PROCEDIMIENTOS DE CATEGORIAS###############################
-- #####################################################################################
-- #####################################################################################
-- Procedimiento para crear categorias
DELIMITER $$
CREATE PROCEDURE create_categoria(
    IN p_nombre VARCHAR(55),
    IN p_descripcion VARCHAR(120),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error during category creation';
    END;
    START TRANSACTION;
    IF p_nombre IS NULL THEN
        SET p_status_message = 'Category name is required';
    ELSE
        INSERT INTO Categorias (nombre, descripcion)
        VALUES (p_nombre, p_descripcion);
        SET p_status_message = 'Category created successfully';
        COMMIT;
    END IF;
END$$
DELIMITER ;
-- Procedimiento para mostrar categorias
DELIMITER $$
CREATE PROCEDURE get_categorias()
BEGIN
    SELECT categoria_id, nombre, descripcion FROM Categorias;
END$$
DELIMITER ;
-- Procedimiento para actualiza categoria
DELIMITER $$
CREATE PROCEDURE update_categoria(
    IN p_categoria_id INT UNSIGNED,
    IN p_nombre VARCHAR(55),
    IN p_descripcion VARCHAR(120),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE categoria_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error during category update';
    END;
    SELECT COUNT(*) INTO categoria_exists FROM Categorias WHERE categoria_id = p_categoria_id;
    IF categoria_exists = 0 THEN
        SET p_status_message = 'Category not found';
    ELSE
        START TRANSACTION;
        UPDATE Categorias
        SET 
            nombre = IFNULL(p_nombre, nombre), 
            descripcion = IFNULL(p_descripcion, descripcion)
        WHERE categoria_id = p_categoria_id;
        SET p_status_message = 'Category updated successfully';
        COMMIT;
    END IF;
END$$
DELIMITER ;
-- Procedimiento para eliminar categoria
DELIMITER $$
CREATE PROCEDURE delete_categoria(
    IN p_categoria_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE categoria_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error during category deletion';
    END;
    SELECT COUNT(*) INTO categoria_exists FROM Categorias WHERE categoria_id = p_categoria_id;
    IF categoria_exists = 0 THEN
        SET p_status_message = 'Category not found';
    ELSE
        START TRANSACTION;
        DELETE FROM Categorias WHERE categoria_id = p_categoria_id;
        SET p_status_message = 'Category deleted successfully';
        COMMIT;
    END IF;
END$$
DELIMITER ;
-- Procedimiento para obtener categoria por id
DELIMITER $$
CREATE PROCEDURE get_categoria_by_id(
    IN p_categoria_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE categoria_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_status_message = 'Error fetching category';
    END;
    SELECT COUNT(*) INTO categoria_exists FROM Categorias WHERE categoria_id = p_categoria_id;
    IF categoria_exists = 0 THEN
        SET p_status_message = 'Category not found';
    ELSE
        SET p_status_message = 'Category found';
        SELECT categoria_id, nombre, descripcion FROM Categorias WHERE categoria_id = p_categoria_id;
    END IF;
END$$
DELIMITER ;
-- #####################################################################################
-- #####################################################################################
-- ##########################PROCEDIMIENTOS DE PRODUCTOS################################
-- #####################################################################################
-- #####################################################################################
-- Procedimientos para los productos
DELIMITER $$
CREATE PROCEDURE create_producto(
    IN p_nombre VARCHAR(55),
    IN p_descripcion VARCHAR(255),
    IN p_estado VARCHAR(15),
    IN p_tarifa_renta DECIMAL(16, 2),
    IN p_fecha_adquisicion TIMESTAMP,
    IN p_imagen VARCHAR(255),
    IN p_stock INT UNSIGNED,
    IN p_usuario_id INT UNSIGNED,
    IN p_categoria_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    -- Declaración de manejadores de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error durante la creación del producto';
    END;
    -- Iniciar transacción
    START TRANSACTION;
    -- Validación del estado del producto
    IF p_estado NOT IN ('disponible', 'no disponible') THEN
        SET p_status_message = 'Estado del producto inválido';
        ROLLBACK;
    ELSEIF p_stock < 0 THEN
        SET p_status_message = 'El stock no puede ser negativo';
        ROLLBACK;
    ELSE
        -- Insertar el nuevo producto
        INSERT INTO Productos (nombre, descripcion, estado, tarifa_renta, fecha_adquisicion, imagen, stock, usuario_id, categoria_id)
        VALUES (p_nombre, p_descripcion, p_estado, p_tarifa_renta, p_fecha_adquisicion, p_imagen, p_stock, p_usuario_id, p_categoria_id);
        -- Confirmar la transacción
        COMMIT;
        SET p_status_message = 'Producto creado exitosamente';
    END IF;
END$$
DELIMITER ;
-- Procedimiento para obtener todos los productos
DELIMITER $$
CREATE PROCEDURE get_all_productos()
BEGIN
    SELECT producto_id, nombre, descripcion, estado, tarifa_renta, fecha_adquisicion, imagen, stock, usuario_id, categoria_id
    FROM Productos;
END$$
DELIMITER ;
-- Obtener el producto por id
DELIMITER $$
CREATE PROCEDURE get_producto_by_id(
    IN p_producto_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    -- Declaración de variables
    DECLARE product_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_status_message = 'Error al obtener el producto';
    END;
    -- Verificar si el producto existe
    SELECT COUNT(*) INTO product_exists FROM Productos WHERE producto_id = p_producto_id;
    IF product_exists = 0 THEN
        SET p_status_message = 'Producto no encontrado';
    ELSE
        SET p_status_message = 'Producto encontrado';
        -- Seleccionar los detalles del producto, incluyendo stock
        SELECT producto_id, nombre, descripcion, estado, tarifa_renta, fecha_adquisicion, imagen, stock, usuario_id, categoria_id
        FROM Productos 
        WHERE producto_id = p_producto_id;
    END IF;
END$$
DELIMITER ;
-- Actualizar el producto
DELIMITER $$
CREATE PROCEDURE update_producto(
    IN p_producto_id INT UNSIGNED,
    IN p_nombre VARCHAR(55),
    IN p_descripcion VARCHAR(255),
    IN p_estado VARCHAR(15),
    IN p_tarifa_renta DECIMAL(16, 2),
    IN p_fecha_adquisicion TIMESTAMP,
    IN p_imagen VARCHAR(255),
    IN p_stock INT UNSIGNED,
    IN p_usuario_id INT UNSIGNED,
    IN p_categoria_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    -- Declaración de variables
    DECLARE product_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error durante la actualización del producto';
    END;
    -- Verificar si el producto existe
    SELECT COUNT(*) INTO product_exists FROM Productos WHERE producto_id = p_producto_id;
    IF product_exists = 0 THEN
        SET p_status_message = 'Producto no encontrado';
    ELSE
        -- Iniciar transacción
        START TRANSACTION;
        -- Validación del estado del producto si se proporciona
        IF p_estado IS NOT NULL AND p_estado NOT IN ('disponible', 'no disponible') THEN
            SET p_status_message = 'Estado del producto inválido';
            ROLLBACK;
        ELSEIF p_stock IS NOT NULL AND p_stock < 0 THEN
            SET p_status_message = 'El stock no puede ser negativo';
            ROLLBACK;
        ELSE
            -- Actualizar los campos proporcionados, manteniendo los actuales si no se proporcionan
            UPDATE Productos
            SET 
                nombre = IFNULL(p_nombre, nombre),
                descripcion = IFNULL(p_descripcion, descripcion),
                estado = IFNULL(p_estado, estado),
                tarifa_renta = IFNULL(p_tarifa_renta, tarifa_renta),
                fecha_adquisicion = IFNULL(p_fecha_adquisicion, fecha_adquisicion),
                imagen = IFNULL(p_imagen, imagen),
                stock = IFNULL(p_stock, stock),
                usuario_id = IFNULL(p_usuario_id, usuario_id),
                categoria_id = IFNULL(p_categoria_id, categoria_id)
            WHERE producto_id = p_producto_id;
            -- Confirmar la transacción
            COMMIT;
            SET p_status_message = 'Producto actualizado exitosamente';
        END IF;
    END IF;
END$$
DELIMITER ;
-- Eliminar el producto
DELIMITER $$
CREATE PROCEDURE delete_producto(
    IN p_producto_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    -- Declaración de manejadores de errores
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error durante la eliminación del producto';
    END;
    -- Iniciar transacción
    START TRANSACTION;
    -- Verificar si el producto existe
    IF (SELECT COUNT(*) FROM Productos WHERE producto_id = p_producto_id) = 0 THEN
        SET p_status_message = 'El producto no existe';
        ROLLBACK;
    ELSE
        -- Eliminar el producto
        DELETE FROM Productos WHERE producto_id = p_producto_id;
        -- Asumir que las claves foráneas con ON DELETE CASCADE manejarán las referencias en otras tablas
        SET p_status_message = 'Producto eliminado exitosamente';
        COMMIT;
    END IF;
END$$
DELIMITER ;
-- #####################################################################################
-- #####################################################################################
-- ##########################PROCEDIMIENTOS DE USUARIOS#################################
-- #####################################################################################
-- #####################################################################################
DELIMITER $$
CREATE PROCEDURE create_usuario(
    IN p_admin_id INT UNSIGNED,
    IN p_nombre VARCHAR(55),
    IN p_apellido_pat VARCHAR(55),
    IN p_apellido_mat VARCHAR(55),
    IN p_telefono VARCHAR(25),
    IN p_email VARCHAR(50),
    IN p_password VARCHAR(125),
    IN p_avatar VARCHAR(255),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error during user creation';
    END;
    START TRANSACTION;
    -- Verificar si el email ya existe
    IF EXISTS (SELECT 1 FROM Usuarios WHERE email = p_email) THEN
        SET p_status_message = 'Email already exists';
        ROLLBACK;
    -- Verificar si el teléfono ya existe (si se proporciona)
    ELSEIF p_telefono IS NOT NULL AND EXISTS (SELECT 1 FROM Usuarios WHERE telefono = p_telefono) THEN
        SET p_status_message = 'Telefono already exists';
        ROLLBACK;
    ELSE
        INSERT INTO Usuarios (admin_id, nombre, apellido_pat, apellido_mat, telefono, email, password, avatar, createdAt)
        VALUES (p_admin_id, p_nombre, p_apellido_pat, p_apellido_mat, p_telefono, p_email, p_password, p_avatar, NOW());
        SET p_status_message = 'User created successfully';
        COMMIT;
    END IF;
END$$
DELIMITER ;
DELIMITER $$
CREATE PROCEDURE get_all_usuarios()
BEGIN
    SELECT usuario_id, admin_id, nombre, apellido_pat, apellido_mat, telefono, email, avatar, createdAt
    FROM Usuarios;
END$$
DELIMITER ;
DELIMITER $$
CREATE PROCEDURE get_usuario_by_id(
    IN p_usuario_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE user_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_status_message = 'Error fetching user';
    END;
    SELECT COUNT(*) INTO user_exists FROM Usuarios WHERE usuario_id = p_usuario_id;
    IF user_exists = 0 THEN
        SET p_status_message = 'User not found';
    ELSE
        SET p_status_message = 'User found';
        SELECT usuario_id, admin_id, nombre, apellido_pat, apellido_mat, telefono, email, avatar, createdAt
        FROM Usuarios WHERE usuario_id = p_usuario_id;
    END IF;
END$$
DELIMITER ;
DELIMITER $$
CREATE PROCEDURE update_usuario(
    IN p_usuario_id INT UNSIGNED,
    IN p_admin_id INT UNSIGNED,
    IN p_nombre VARCHAR(55),
    IN p_apellido_pat VARCHAR(55),
    IN p_apellido_mat VARCHAR(55),
    IN p_telefono VARCHAR(25),
    IN p_email VARCHAR(50),
    IN p_password VARCHAR(125),
    IN p_avatar VARCHAR(255),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE user_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error during user update';
    END;

    SELECT COUNT(*) INTO user_exists FROM Usuarios WHERE usuario_id = p_usuario_id;
    IF user_exists = 0 THEN
        SET p_status_message = 'User not found';
    ELSE
        START TRANSACTION;
        -- Verificar si el nuevo email ya existe en otro usuario
        IF p_email IS NOT NULL AND EXISTS (SELECT 1 FROM Usuarios WHERE email = p_email AND usuario_id <> p_usuario_id) THEN
            SET p_status_message = 'Email already exists';
            ROLLBACK;
        -- Verificar si el nuevo teléfono ya existe en otro usuario
        ELSEIF p_telefono IS NOT NULL AND EXISTS (SELECT 1 FROM Usuarios WHERE telefono = p_telefono AND usuario_id <> p_usuario_id) THEN
            SET p_status_message = 'Telefono already exists';
            ROLLBACK;
        ELSE
            UPDATE Usuarios
            SET 
                admin_id = IFNULL(p_admin_id, admin_id),
                nombre = IFNULL(p_nombre, nombre),
                apellido_pat = IFNULL(p_apellido_pat, apellido_pat),
                apellido_mat = IFNULL(p_apellido_mat, apellido_mat),
                telefono = IFNULL(p_telefono, telefono),
                email = IFNULL(p_email, email),
                password = IFNULL(p_password, password),
                avatar = IFNULL(p_avatar, avatar)
            WHERE usuario_id = p_usuario_id;

            SET p_status_message = 'User updated successfully';
            COMMIT;
        END IF;
    END IF;
END$$
DELIMITER ;
DELIMITER $$
CREATE PROCEDURE delete_usuario(
    IN p_usuario_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error during user deletion';
    END;
    START TRANSACTION;
    IF (SELECT COUNT(*) FROM Usuarios WHERE usuario_id = p_usuario_id) = 0 THEN
        SET p_status_message = 'User does not exist';
    ELSE
        DELETE FROM Usuarios WHERE usuario_id = p_usuario_id;
        SET p_status_message = 'User deleted successfully';
        COMMIT;
    END IF;
END$$
DELIMITER ;
-- #####################################################################################
-- #####################################################################################
-- ############################PROCEDIMIENTOS DE RENTAS#################################
-- #####################################################################################
-- #####################################################################################
-- Procedimiento almacenado para crear una renta
DELIMITER $$
CREATE PROCEDURE create_renta(
    IN p_usuario_id INT UNSIGNED,
    IN p_fecha_inicio TIMESTAMP,
    IN p_fecha_fin TIMESTAMP,
    IN p_estado VARCHAR(20),
    IN p_total DECIMAL(16, 2),
    IN p_fecha_devolucion TIMESTAMP,
    OUT p_renta_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE v_sqlstate CHAR(5) DEFAULT '00000';
    DECLARE v_message_text TEXT DEFAULT '';
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Capturar el estado SQL y el mensaje de error
        GET DIAGNOSTICS CONDITION 1 v_sqlstate = RETURNED_SQLSTATE, v_message_text = MESSAGE_TEXT;
        ROLLBACK;
        SET p_renta_id = NULL;
        SET p_status_message = CONCAT('Error durante la creación de renta: ', v_sqlstate, ' - ', v_message_text);
    END;
    -- Etiqueta para controlar el flujo en caso de errores
    proc_end: BEGIN
        -- Iniciar transacción
        START TRANSACTION;
        -- Validación: Verificar que el usuario exista
        IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE usuario_id = p_usuario_id) THEN
            SET p_status_message = 'Usuario no encontrado';
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Validación: Verificar que las fechas sean lógicas
        IF p_fecha_inicio >= p_fecha_fin THEN
            SET p_status_message = 'La fecha de inicio debe ser anterior a la fecha de fin';
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        IF p_fecha_devolucion < p_fecha_fin THEN
            SET p_status_message = 'La fecha de devolución debe ser posterior a la fecha de fin';
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Validación: Verificar que el total sea positivo
        IF p_total <= 0 THEN
            SET p_status_message = 'El total debe ser un valor positivo';
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Validación: Verificar que el estado sea válido
        IF p_estado NOT IN ('pendiente', 'activa', 'finalizada', 'cancelada') THEN
            SET p_status_message = 'Estado de renta inválido';
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Insertar la nueva renta
        INSERT INTO Rentas (usuario_id, fecha_inicio, fecha_fin, estado, total, fecha_devolucion)
        VALUES (p_usuario_id, p_fecha_inicio, p_fecha_fin, p_estado, p_total, p_fecha_devolucion);
        -- Obtener el ID de la renta recién creada
        SET p_renta_id = LAST_INSERT_ID();
        -- Generar una notificación de creación de renta
        INSERT INTO Notificaciones (usuario_id, renta_id, mensaje, fecha_envio, leido, tipo)
        VALUES (p_usuario_id, p_renta_id, 'Renta creada exitosamente', NOW(), FALSE, 'recordatorio');
        -- Establecer mensaje de éxito
        SET p_status_message = 'Renta creada exitosamente';
        -- Confirmar la transacción
        COMMIT;
    END proc_end;
END$$
DELIMITER ;
-- Obtener todas las rentas de los usuarios
DELIMITER $$
CREATE PROCEDURE get_all_rentas()
BEGIN
    SELECT 
        r.renta_id,
        r.usuario_id,
        u.nombre AS nombre_usuario,
        u.apellido_pat AS apellido_paterno,
        u.apellido_mat AS apellido_materno,
        r.fecha_inicio,
        r.fecha_fin,
        r.estado,
        r.total,
        r.fecha_devolucion
    FROM Rentas r
    JOIN Usuarios u ON r.usuario_id = u.usuario_id;
END$$
DELIMITER ;
-- Obtener renta por id
DELIMITER $$
CREATE PROCEDURE get_renta_by_id(
    IN p_renta_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE renta_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_status_message = 'Error al obtener la renta';
    END;
    -- Verificar si la renta existe
    SELECT COUNT(*) INTO renta_exists FROM Rentas WHERE renta_id = p_renta_id;

    IF renta_exists = 0 THEN
        SET p_status_message = 'Renta no encontrada';
    ELSE
        SET p_status_message = 'Renta encontrada';
        -- Seleccionar detalles de la renta
        SELECT 
            r.renta_id,
            r.usuario_id,
            u.nombre AS nombre_usuario,
            u.apellido_pat AS apellido_paterno,
            u.apellido_mat AS apellido_materno,
            r.fecha_inicio,
            r.fecha_fin,
            r.estado,
            r.total,
            r.fecha_devolucion
        FROM Rentas r
        JOIN Usuarios u ON r.usuario_id = u.usuario_id
        WHERE r.renta_id = p_renta_id;
    END IF;
END$$
DELIMITER ;
-- Actualizar estado de la renta
DELIMITER $$
CREATE PROCEDURE update_renta_status(
    IN p_renta_id INT UNSIGNED,
    IN p_nuevo_estado VARCHAR(20),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE renta_exists INT DEFAULT 0;
    DECLARE valid_estado BOOLEAN DEFAULT FALSE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error durante la actualización de la renta';
    END;
    START TRANSACTION;
    -- Verificar si la renta existe
    SELECT COUNT(*) INTO renta_exists FROM Rentas WHERE renta_id = p_renta_id;
    IF renta_exists = 0 THEN
        SET p_status_message = 'Renta no encontrada';
        ROLLBACK;
    ELSE
        -- Validar el nuevo estado
        IF p_nuevo_estado IN ('pendiente', 'activa', 'completada', 'cancelada') THEN
            SET valid_estado = TRUE;
        ELSE
            SET p_status_message = 'Estado de renta inválido';
            ROLLBACK;
        END IF;
        IF valid_estado THEN
            -- Actualizar el estado de la renta
            UPDATE Rentas
            SET estado = p_nuevo_estado
            WHERE renta_id = p_renta_id;
            SET p_status_message = 'Estado de renta actualizado exitosamente';
            COMMIT;
            -- Opcional: Crear una notificación sobre el cambio de estado
            INSERT INTO Notificaciones (usuario_id, renta_id, mensaje, fecha_envio, leido, tipo)
            SELECT usuario_id, p_renta_id, CONCAT('El estado de tu renta ', p_renta_id, ' ha sido actualizado a ', p_nuevo_estado), NOW(), FALSE, 'actualizacion'
            FROM Rentas
            WHERE renta_id = p_renta_id;
        END IF;
    END IF;
END$$
DELIMITER ;
-- Eliminar renta
DELIMITER $$
CREATE PROCEDURE delete_renta(
    IN p_renta_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE renta_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error durante la eliminación de la renta';
    END;
    START TRANSACTION;
    -- Verificar si la renta existe
    SELECT COUNT(*) INTO renta_exists FROM Rentas WHERE renta_id = p_renta_id;
    IF renta_exists = 0 THEN
        SET p_status_message = 'Renta no encontrada';
        ROLLBACK;
    ELSE
        -- Eliminar la renta (se eliminarán automáticamente las asociaciones en ProductoxRenta)
        DELETE FROM Rentas WHERE renta_id = p_renta_id;
        SET p_status_message = 'Renta eliminada exitosamente';
        COMMIT;
    END IF;
END$$
DELIMITER ;
-- Finalizar la renta
DELIMITER $$
CREATE PROCEDURE finalize_renta(
    IN p_renta_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE renta_estado VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error al finalizar la renta';
    END;

    START TRANSACTION;

    -- Verificar si la renta existe y obtener su estado
    SELECT estado INTO renta_estado FROM Rentas WHERE renta_id = p_renta_id FOR UPDATE;

    IF renta_estado IS NULL THEN
        SET p_status_message = 'Renta no encontrada';
        ROLLBACK;
    ELSEIF renta_estado NOT IN ('activa', 'pendiente') THEN
        SET p_status_message = 'La renta no está en un estado válido para finalizar';
        ROLLBACK;
    ELSE
        -- Actualizar el estado de la renta a 'completada' y establecer la fecha de devolución
        UPDATE Rentas 
        SET estado = 'completada', fecha_devolucion = NOW()
        WHERE renta_id = p_renta_id;

        -- Crear una notificación sobre la finalización de la renta
        INSERT INTO Notificaciones (
            usuario_id, 
            renta_id, 
            mensaje, 
            fecha_envio, 
            leido, 
            tipo
        )
        SELECT 
            usuario_id, 
            p_renta_id, 
            CONCAT('Tu renta ', p_renta_id, ' ha sido finalizada'), 
            NOW(), 
            FALSE, 
            'actualizacion'
        FROM Rentas 
        WHERE renta_id = p_renta_id;

        SET p_status_message = 'Renta finalizada exitosamente';
        COMMIT;
    END IF;
END$$
DELIMITER ;
-- #####################################################################################
-- #####################################################################################
-- #####################PROCEDIMIENTOS DE PRODUCTOS RENTAS##############################
-- #####################################################################################
-- #####################################################################################
-- Procedimiento almacenado para agregar un producto a una renta
DELIMITER $$
CREATE PROCEDURE add_producto_to_renta(
    IN p_renta_id INT UNSIGNED,
    IN p_producto_id INT UNSIGNED,
    IN p_cantidad INT UNSIGNED,
    OUT p_renta_producto_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    -- Declaraciones de variables al inicio del bloque
    DECLARE v_tarifa_renta DECIMAL(16, 2);
    DECLARE v_usuario_id INT;
    DECLARE v_estado VARCHAR(15);
    DECLARE v_error BOOLEAN DEFAULT FALSE;
    DECLARE v_sqlstate CHAR(5) DEFAULT '00000';
    DECLARE v_message_text TEXT DEFAULT '';
    DECLARE v_stock INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Capturar el estado SQL y el mensaje de error
        GET DIAGNOSTICS CONDITION 1 v_sqlstate = RETURNED_SQLSTATE, v_message_text = MESSAGE_TEXT;
        ROLLBACK;
        SET p_renta_producto_id = NULL;
        SET p_status_message = CONCAT('Error al agregar producto a la renta: ', v_sqlstate, ' - ', v_message_text);
    END;
    proc_end: BEGIN
        -- Iniciar transacción
        START TRANSACTION;
        -- Validación: Verificar que la renta exista y obtener el usuario_id
        IF NOT EXISTS (SELECT 1 FROM Rentas WHERE renta_id = p_renta_id) THEN
            SET p_status_message = 'Renta no encontrada';
            SET v_error = TRUE;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        SELECT usuario_id INTO v_usuario_id FROM Rentas WHERE renta_id = p_renta_id;
        -- Validación: Verificar que el producto exista y obtener la tarifa de renta y estado
        IF NOT EXISTS (SELECT 1 FROM Productos WHERE producto_id = p_producto_id) THEN
            SET p_status_message = 'Producto no encontrado';
            SET v_error = TRUE;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        SELECT tarifa_renta, estado INTO v_tarifa_renta, v_estado FROM Productos WHERE producto_id = p_producto_id;
        -- Validación: Verificar que el estado del producto sea 'disponible'
        IF v_estado <> 'disponible' THEN
            SET p_status_message = 'El producto no está disponible para renta';
            SET v_error = TRUE;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Validación: Verificar que la cantidad sea mayor que cero
        IF p_cantidad <= 0 THEN
            SET p_status_message = 'La cantidad debe ser mayor que cero';
            SET v_error = TRUE;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Validación: Verificar que la cantidad solicitada no exceda el inventario disponible
        SELECT stock INTO v_stock FROM Productos WHERE producto_id = p_producto_id;
        IF v_stock < p_cantidad THEN
            SET p_status_message = CONCAT('Cantidad solicitada excede el stock disponible: ', v_stock);
            SET v_error = TRUE;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Validación: Verificar que el producto no esté ya asociado con la renta
        IF EXISTS (SELECT 1 FROM ProductoxRenta WHERE renta_id = p_renta_id AND producto_id = p_producto_id) THEN
            SET p_status_message = 'El producto ya está asociado con esta renta';
            SET v_error = TRUE;
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Insertar producto en la renta
        INSERT INTO ProductoxRenta (producto_id, renta_id, cantidad)
        VALUES (p_producto_id, p_renta_id, p_cantidad);
        SET p_renta_producto_id = LAST_INSERT_ID();
        -- Actualizar el total en la tabla Rentas
        UPDATE Rentas 
        SET total = total + (p_cantidad * v_tarifa_renta)
        WHERE renta_id = p_renta_id;
        -- Actualizar el stock del producto
        UPDATE Productos 
        SET stock = stock - p_cantidad 
        WHERE producto_id = p_producto_id;
        -- Crear notificación de producto añadido
        INSERT INTO Notificaciones (usuario_id, renta_id, mensaje, fecha_envio, leido, tipo)
        VALUES (v_usuario_id, p_renta_id, 'Producto añadido exitosamente a la renta', NOW(), FALSE, 'recordatorio');
        -- Establecer mensaje de éxito
        SET p_status_message = 'Producto agregado exitosamente a la renta';
        -- Confirmar la transacción
        COMMIT;
    END proc_end;
END$$
DELIMITER ;
-- Eliminar producto de la renta
DELIMITER $$
CREATE PROCEDURE remove_producto_from_renta(
    IN p_renta_id INT UNSIGNED,
    IN p_producto_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE renta_producto_exists INT DEFAULT 0;
    DECLARE v_cantidad INT;
    DECLARE v_tarifa_renta DECIMAL(16,2);
    DECLARE v_usuario_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error al remover el producto de la renta';
    END;
    START TRANSACTION;
    -- Verificar si la asociación existe
    SELECT COUNT(*), cantidad INTO renta_producto_exists, v_cantidad 
    FROM ProductoxRenta 
    WHERE renta_id = p_renta_id AND producto_id = p_producto_id;

    IF renta_producto_exists = 0 THEN
        SET p_status_message = 'Producto no asociado con esta renta';
        ROLLBACK;
    ELSE
        -- Obtener tarifa de renta y usuario_id
        SELECT tarifa_renta, usuario_id INTO v_tarifa_renta, v_usuario_id 
        FROM Productos 
        WHERE producto_id = p_producto_id;
        -- Eliminar la asociación
        DELETE FROM ProductoxRenta 
        WHERE renta_id = p_renta_id AND producto_id = p_producto_id;
        -- Actualizar el total de la renta
        UPDATE Rentas 
        SET total = total - (v_cantidad * v_tarifa_renta)
        WHERE renta_id = p_renta_id;
        -- Actualizar el stock del producto
        UPDATE Productos 
        SET stock = stock + v_cantidad 
        WHERE producto_id = p_producto_id;
        SET p_status_message = 'Producto removido exitosamente de la renta';
        COMMIT;
        -- Crear una notificación sobre la remoción del producto
        INSERT INTO Notificaciones (usuario_id, renta_id, mensaje, fecha_envio, leido, tipo)
        VALUES (v_usuario_id, p_renta_id, CONCAT('El producto ', p_producto_id, ' ha sido removido de tu renta ', p_renta_id), NOW(), FALSE, 'actualizacion');
    END IF;
END$$
DELIMITER ;
-- #####################################################################################
-- #####################################################################################
-- #######################PROCEDIMIENTOS DE METODO DE PAGO##############################
-- #####################################################################################
-- #####################################################################################
-- Crear metodo de pago
DELIMITER $$
CREATE PROCEDURE create_metodoPago(
    IN p_renta_id INT UNSIGNED,
    IN p_monto DECIMAL(16, 2),
    IN p_fecha_pago TIMESTAMP,
    IN p_metodo VARCHAR(20),
    IN p_estado VARCHAR(20),
    OUT p_metodopago_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    -- Manejador de errores para capturar excepciones SQL
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error procesando el pago';
    END;
    -- Etiqueta para controlar el flujo en caso de errores o validaciones fallidas
    proc_end: BEGIN
        -- Declaración de variables locales al inicio del bloque
        DECLARE v_tipo_notificacion VARCHAR(25);
        -- Validaciones de entrada
        IF p_metodo NOT IN ('tarjeta', 'efectivo', 'transferencia') THEN
            SET p_status_message = 'Método de pago inválido';
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        IF p_estado NOT IN ('pendiente', 'completado', 'fallido') THEN
            SET p_status_message = 'Estado de pago inválido';
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Iniciar transacción
        START TRANSACTION;
        -- Verificar que la renta existe
        IF NOT EXISTS (SELECT 1 FROM Rentas WHERE renta_id = p_renta_id) THEN
            SET p_status_message = 'Renta no encontrada';
            ROLLBACK;
            LEAVE proc_end;
        END IF;
        -- Crear el registro de pago
        INSERT INTO metodoPago (renta_id, monto, fecha_pago, metodo, estado)
        VALUES (p_renta_id, p_monto, p_fecha_pago, p_metodo, p_estado);
        -- Capturar el ID del método de pago recién creado
        SET p_metodopago_id = LAST_INSERT_ID();
        -- Actualizar estado de la renta si el pago es 'completado'
        IF p_estado = 'completado' THEN
            UPDATE Rentas
            SET estado = 'activa'
            WHERE renta_id = p_renta_id;
        END IF;
        -- Determinar el tipo de notificación basado en el estado del pago
        IF p_estado = 'pendiente' THEN
            SET v_tipo_notificacion = 'pago pendiente';
        ELSE
            SET v_tipo_notificacion = 'actualizacion';
        END IF;
        -- Crear notificación correspondiente
        INSERT INTO Notificaciones (usuario_id, renta_id, mensaje, fecha_envio, leido, tipo)
        VALUES (
            (SELECT usuario_id FROM Rentas WHERE renta_id = p_renta_id),
            p_renta_id,
            CONCAT('Se ha registrado un pago ', p_estado, ' para tu renta ', p_renta_id),
            NOW(),
            FALSE,
            v_tipo_notificacion
        );
        -- Establecer mensaje de éxito
        SET p_status_message = 'Pago procesado exitosamente';
        -- Confirmar la transacción
        COMMIT;
        -- Salir del bloque etiquetado
        LEAVE proc_end;
    END proc_end;
END$$
DELIMITER ;
-- Obtener todos los registros de metodos pago
DELIMITER $$
CREATE PROCEDURE get_all_metodosPago()
BEGIN
    SELECT 
        m.metodopago_id,
        m.renta_id,
        r.usuario_id,
        u.nombre AS nombre_usuario,
        u.apellido_pat AS apellido_paterno,
        u.apellido_mat AS apellido_materno,
        m.monto,
        m.fecha_pago,
        m.metodo,
        m.estado
    FROM metodoPago m
    JOIN Rentas r ON m.renta_id = r.renta_id
    JOIN Usuarios u ON r.usuario_id = u.usuario_id;
END$$
DELIMITER ;
-- Obtener el metodo de pago por id
DELIMITER $$
CREATE PROCEDURE get_metodoPago_by_id(
    IN p_metodopago_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE metodoPago_exists INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_status_message = 'Error al obtener el método de pago';
    END;
    -- Verificar si el método de pago existe
    SELECT COUNT(*) INTO metodoPago_exists FROM metodoPago WHERE metodopago_id = p_metodopago_id;
    IF metodoPago_exists = 0 THEN
        SET p_status_message = 'Método de pago no encontrado';
    ELSE
        SET p_status_message = 'Método de pago encontrado';
        -- Seleccionar detalles del método de pago
        SELECT 
            m.metodopago_id,
            m.renta_id,
            r.usuario_id,
            u.nombre AS nombre_usuario,
            u.apellido_pat AS apellido_paterno,
            u.apellido_mat AS apellido_materno,
            m.monto,
            m.fecha_pago,
            m.metodo,
            m.estado
        FROM metodoPago m
        JOIN Rentas r ON m.renta_id = r.renta_id
        JOIN Usuarios u ON r.usuario_id = u.usuario_id
        WHERE m.metodopago_id = p_metodopago_id;
    END IF;
END$$
DELIMITER ;
-- Actualizar método de pago
DELIMITER $$
CREATE PROCEDURE update_metodoPago(
    IN p_metodopago_id INT UNSIGNED,
    IN p_monto DECIMAL(16, 2),
    IN p_fecha_pago TIMESTAMP,
    IN p_metodo VARCHAR(20),
    IN p_estado VARCHAR(20),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE metodoPago_exists INT DEFAULT 0;
    DECLARE valid_metodo BOOLEAN DEFAULT TRUE; -- Inicializar en TRUE
    DECLARE valid_estado BOOLEAN DEFAULT TRUE; -- Inicializar en TRUE
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'Error durante la actualización del método de pago';
    END;
    
    START TRANSACTION;
    
    -- Verificar si el método de pago existe
    SELECT COUNT(*) INTO metodoPago_exists FROM metodoPago WHERE metodopago_id = p_metodopago_id;
    IF metodoPago_exists = 0 THEN
        SET p_status_message = 'Método de pago no encontrado';
        ROLLBACK;
    ELSE
        -- Validar el método de pago solo si se proporciona
        IF p_metodo IS NOT NULL THEN
            IF p_metodo IN ('tarjeta', 'efectivo', 'transferencia') THEN
                SET valid_metodo = TRUE;
            ELSE
                SET p_status_message = 'Método de pago inválido';
                ROLLBACK;
            END IF;
        END IF;
        
        -- Validar el estado del pago solo si se proporciona
        IF p_estado IS NOT NULL THEN
            IF p_estado IN ('pendiente', 'completado', 'fallido') THEN
                SET valid_estado = TRUE;
            ELSE
                SET p_status_message = 'Estado de pago inválido';
                ROLLBACK;
            END IF;
        END IF;
        
        IF valid_metodo AND valid_estado THEN
            -- Actualizar el método de pago
            UPDATE metodoPago
            SET 
                monto = IFNULL(p_monto, monto),
                fecha_pago = IFNULL(p_fecha_pago, fecha_pago),
                metodo = IFNULL(p_metodo, metodo),
                estado = IFNULL(p_estado, estado)
            WHERE metodopago_id = p_metodopago_id;

            SET p_status_message = 'Método de pago actualizado exitosamente';
            COMMIT;
            
            -- Crear una notificación sobre la actualización del método de pago
            INSERT INTO Notificaciones (usuario_id, renta_id, mensaje, fecha_envio, leido, tipo)
            SELECT 
                r.usuario_id, 
                m.renta_id, 
                CONCAT('Tu método de pago ', p_metodopago_id, ' ha sido actualizado'), 
                NOW(), 
                FALSE, 
                'actualizacion'
            FROM metodoPago m
            JOIN Rentas r ON m.renta_id = r.renta_id
            WHERE m.metodopago_id = p_metodopago_id;
        END IF;
    END IF;
END$$
DELIMITER ;
-- ------------------------------------------------------------------
-- ------------------------------------------------------------------
-- Prueba de procedimientos y flujo del funcionamiento del sistema --
-- ------------------------------------------------------------------
-- ------------------------------------------------------------------
select * from usuarios;
-- ------------------------------------------------------------------
-- Crear Categoría 1
SET @status_message = NULL;
CALL create_categoria(
    'Deportes',                -- p_nombre
    'Equipamiento y accesorios deportivos', -- p_descripcion
    @status_message            -- p_status_message
);
SELECT @status_message AS status_message;
-- Crear Categoría 2
CALL create_categoria(
    'Electrónicos',
    'Dispositivos y gadgets electrónicos',
    @status_message
);
SELECT @status_message AS status_message;
select * from categorias;
-- ------------------------------------------------------------------
-- Crear Producto 1: Bicicleta
SET @status_message = NULL;
CALL create_producto(
    'Bicicleta',                            -- p_nombre
    'Bicicleta de montaña',                 -- p_descripcion
    'disponible',                           -- p_estado
    15.00,                                  -- p_tarifa_renta
    '2024-01-01 00:00:00',                  -- p_fecha_adquisicion
    'https://dropbox.com/path/to/bike.jpg', -- p_imagen
    10,                                     -- p_stock
    5,                                      -- p_usuario_id (Christian)
    9,                                      -- p_categoria_id (Deportes)
    @status_message                         -- p_status_message
);
SELECT @status_message AS status_message;
-- Crear Producto 2: Patinete
CALL create_producto(
    'Patinete',                             -- p_nombre
    'Patinete eléctrico',                   -- p_descripcion
    'disponible',                           -- p_estado
    10.00,                                  -- p_tarifa_renta
    '2024-02-15 00:00:00',                  -- p_fecha_adquisicion
    'https://dropbox.com/path/to/scooter.jpg', -- p_imagen
    5,                                      -- p_stock
    5,                                      -- p_usuario_id (Christian)
    9,                                      -- p_categoria_id (Deportes)
    @status_message
);
SELECT @status_message AS status_message;
-- Crear Producto 3: Smartphone
CALL create_producto(
    'Smartphone',                           -- p_nombre
    'Smartphone de última generación',       -- p_descripcion
    'disponible',                           -- p_estado
    20.00,                                  -- p_tarifa_renta
    '2024-03-10 00:00:00',                  -- p_fecha_adquisicion
    'https://dropbox.com/path/to/smartphone.jpg', -- p_imagen
    8,                                      -- p_stock
    6,                                      -- p_usuario_id (Fabiola)
    10,                                      -- p_categoria_id (Electrónicos)
    @status_message
);
SELECT @status_message AS status_message;
select * from productos;
-- ------------------------------------------------------------------
-- Crear Renta
SET @renta_id = NULL;
SET @status_message = NULL;
CALL create_renta(
    16,                                      -- p_usuario_id (Carlos)
    '2024-04-01 10:00:00',                  -- p_fecha_inicio
    '2024-04-05 10:00:00',                  -- p_fecha_fin
    'pendiente',                            -- p_estado
    60.00,                                   -- p_total
    '2024-04-05 12:00:00',                  -- p_fecha_devolucion
    @renta_id,                               -- p_renta_id
    @status_message                          -- p_status_message
);
SELECT @renta_id AS renta_id, @status_message AS status_message;
SELECT * FROM Rentas WHERE renta_id = @renta_id;
select * from rentas;
-- ------------------------------------------------------------------
-- Agregar 2 Bicicletas a la Renta 1
SET @renta_producto_id = NULL;
SET @status_message = NULL;
CALL add_producto_to_renta(
    @renta_id,          -- p_renta_id
    48,                  -- p_producto_id (Bicicleta)
    2,                  -- p_cantidad
    @renta_producto_id, -- p_renta_producto_id
    @status_message     -- p_status_message
);
SELECT @renta_producto_id AS renta_producto_id, @status_message AS status_message;
-- Agregar 1 Smartphone a la Renta 1
CALL add_producto_to_renta(
    @renta_id,          -- p_renta_id
    50,                  -- p_producto_id (Smartphone)
    1,                  -- p_cantidad
    @renta_producto_id, -- p_renta_producto_id
    @status_message     -- p_status_message
);
SELECT @renta_producto_id AS renta_producto_id, @status_message AS status_message;
select * from productoxrenta;
-- ------------------------------------------------------------------
-- Supongamos que ya tienes una renta creada con renta_id = 1
SET @renta_id = 10;
-- Declarar variables para capturar los parámetros de salida
SET @metodopago_id = NULL;
SET @status_message = NULL;
-- Llamar al procedimiento almacenado para procesar el pago
CALL create_metodoPago(
    @renta_id,               -- p_renta_id
    60.00,                   -- p_monto
    '2024-04-01 11:00:00',   -- p_fecha_pago
    'tarjeta',               -- p_metodo
    'pendiente',             -- p_estado
    @metodopago_id,          -- p_metodopago_id
    @status_message          -- p_status_message
);
-- Verificar los resultados
SELECT @metodopago_id AS metodopago_id, @status_message AS status_message;
-- Declarar variables para capturar los parámetros de salida
SET @metodopago_id = NULL;
SET @status_message = NULL;
-- Llamar al procedimiento almacenado para procesar el pago como 'completado'
CALL create_metodoPago(
    @renta_id,               -- p_renta_id
    60.00,                   -- p_monto
    '2024-04-02 15:00:00',   -- p_fecha_pago
    'tarjeta',               -- p_metodo
    'completado',            -- p_estado
    @metodopago_id,          -- p_metodopago_id
    @status_message          -- p_status_message
);
-- Verificar los resultados
SELECT @metodopago_id AS metodopago_id, @status_message AS status_message;
SELECT * FROM metodoPago;
-- ------------------------------------------------------------------
select * from notificaciones;
-- ------------------------------------------------------------------
-- Visualizar los permisos del usuario
SHOW GRANTS FOR 'usersProd'@'%';
-- Permisos para ejecutar procedimientos almacenados
GRANT EXECUTE ON PROCEDURE db_rentaProductos.update_metodoPago TO 'usersProd'@'%';
-- Eliminar procedimiento almacenado
DROP PROCEDURE update_metodoPago;
-- ------------------------------------------------------------------
select * from rentas;
select * from usuarios;
select * from metodoPago;