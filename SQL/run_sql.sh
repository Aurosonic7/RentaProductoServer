#!/bin/bash
# No olvides dar permisos de ejecución al archivo
# chmod +x run_sql.sh
# Y ejecutarlo con
# ./run_sql.sh

# Configura tus credenciales de MySQL
USER="usersProd"
PASSWORD="18Kdh3ILsiO"
DATABASE="db_rentaProductos"

# Ejecuta los scripts
mysql -u $USER -p$PASSWORD < ./create_database.sql
mysql -u $USER -p$PASSWORD < ./procedures.sql

echo "Scripts SQL ejecutados correctamente."