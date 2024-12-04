import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const verifyToken = (req, res, next) => {
  //? console.log(req.headers); // Visualización de los encabezados de la solicitud
  let token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1]; //! Obtengo el token de la solicitud

  if (!token) return res.status(403).json({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    //! Si el token no es válido, respondo con un error 401 (Unauthorized) y un mensaje de error adecuado
    if (err) return res.status(401).json({ auth: false, message: 'Failed to authenticate token.' });
    //! Almaceno el ID del usuario en la solicitud para su uso posterior en el controlador de rutas protegidas por autenticación JWT
    req.userId = decoded.id; 
    next();
  });
};

export default verifyToken;