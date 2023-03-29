# deploy-notificator
Recibir notificaciones por email cada vez que se ejecute un deploy en un servidor

## Concepto
La idea es ejecutar el script dentro de un .sh que tambien ejecute el deploy, para poder enviar las notificaciones despues de hacer el deploy.

## Antes de comenzar
Se necesitan modificar los archivos siguientes: `/src/config/data.config.js` y `/src/config/mail.list.config.js`.
La estructura de `data.config.js` es la siguiente:
```
exports.dataConfig = {
    email_sender:"", // email desde donde se enviaran las notificaciones
    name_sender: "", // nombre de la persona que hace el deploy
    app_password:"", // password de aplicacion del correo electronico
    app_deploy_name:"", // Nombre de la aplicacion a la que se hizo deploy
    url_app_deploy:"" // url de la aplicacion a la que se le hizo deploy
}
```
y la estructura de `mail.list.config.js` es:
```
// Arreglo de strings donde iran los correos a los que se enviaran
exports.mailList = [
    '', //example@outlook.com
    '' //contact@mylitlepet.com
];
```
## Iniciar la aplicación
Es necesario ejecutar `npm install` para instalar todas las dependencias necesarias.
Despues basta con ejecutar `node src/notificator.js` para ejecutar el script y enviar los correos.

## Nota importante
Nodejs necesita un puerto para ejecutar la aplicacion mientras se envian los correos, toma un puerto disponible en el servidor y luego cierra la conexion.
