# Proyecto ExpressJS con MySQL

Este proyecto está desarrollado utilizando **ExpressJS** como framework backend y **MySQL** como base de datos. Su enfoque principal es la seguridad, buenas prácticas de desarrollo y escalabilidad. El sistema implementa **usuarios con roles específicos**, **procedimientos almacenados** para la base de datos, una **API Gateway** para gestionar las solicitudes y **certificados SSL** para garantizar la seguridad de las comunicaciones. La estructura de ramas facilita el trabajo colaborativo y el desarrollo continuo del proyecto.

## Descripción del Proyecto

Este sistema maneja operaciones críticas como la gestión de usuarios y roles, asegurando que cada usuario tenga los permisos adecuados según su rol, ya sea **administrador**, **editor** o **viewer**. Además, todas las interacciones con la base de datos se realizan a través de **procedimientos almacenados**, lo que garantiza la seguridad y la consistencia en el manejo de los datos.

### Características principales

1. **Roles de usuarios**: El sistema permite la asignación de roles a los usuarios, como **administrador**, **editor** y **viewer**, lo que permite controlar el acceso a funcionalidades específicas. Los administradores tienen acceso completo, mientras que los editores y viewers tienen permisos limitados.
   
2. **Procedimientos almacenados**: Las operaciones sobre la base de datos, como la creación de usuarios, la asignación de roles y otras operaciones críticas, se realizan mediante procedimientos almacenados en MySQL. Esto garantiza una mayor seguridad y control en las operaciones.

3. **API Gateway**: Se implementa una **API Gateway** en el servidor ExpressJS para centralizar todas las solicitudes de la aplicación. La API Gateway autentica y redirige las solicitudes a los microservicios o controladores correspondientes, asegurando un manejo eficiente y escalable del tráfico.

4. **Certificados SSL**: El proyecto está configurado para utilizar **SSL** en todas las comunicaciones entre el cliente y el servidor. Los certificados SSL están almacenados en la carpeta `certificates/` y se configuran automáticamente para asegurar las comunicaciones en modo de producción.

## Estructura del Proyecto

Este proyecto sigue una estructura clara y organizada para facilitar el desarrollo escalable y mantenible:

```bash
SERVER
├── certificates/       # Certificados SSL para la comunicación segura
├── logs/               # Archivos de logs del servidor
├── node_modules/       # Módulos de Node.js instalados
├── public/             # Archivos públicos (estáticos)
├── request/            # Solicitudes de API y otros archivos relacionados con peticiones
├── src/
│   ├── config/         # Configuración de la base de datos y otros ajustes
│   ├── controllers/    # Lógica de los controladores de la API
│   ├── middlewares/    # Middlewares personalizados
│   ├── models/         # Modelos y acceso a la base de datos
│   ├── routes/         # Definición de rutas de la API
│   └── utils/          # Funciones de utilidad como logs y manejo de errores
├── index.js            # Punto de entrada de la aplicación
├── server.js           # Configuración del servidor ExpressJS
├── .env.development    # Variables de entorno para desarrollo
├── .gitignore          # Archivos y directorios que Git debe ignorar
├── package-lock.json   # Bloqueo de dependencias de npm
├── package.json        # Dependencias y scripts de npm
└── README.md           # Documentación del proyecto