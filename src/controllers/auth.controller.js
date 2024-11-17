import * as authModel from '../models/auth.model.js';

export const register_user = async (req, res) => {
  try {
    const { usuario_id, statusMessage } = await authModel.register_user(req.body);
    
    if (statusMessage === 'El nombre es requerido') return res.status(400).send({ message: statusMessage });
    if (statusMessage === 'El correo electrónico es requerido') return res.status(400).send({ message: statusMessage });
    if (statusMessage === 'La contraseña es requerida') return res.status(400).send({ message: statusMessage });
    if (statusMessage === 'Formato de correo electrónico inválido') return res.status(400).send({ message: statusMessage });
    if (statusMessage === 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números') return res.status(400).send({ message: statusMessage });
    if (statusMessage === 'El correo electrónico ya está registrado') return res.status(409).send({ message: statusMessage });
    if (statusMessage === 'Usuario registrado exitosamente') return res.status(201).send({ message: statusMessage, usuario_id });
    
    return res.status(500).send({ message: 'Error desconocido durante el registro' });
  } catch (error) {
    res.status(500).json({ message: `Error al registrar el usuario: ${error.message}` });
  }
};

export const login_user = async (req, res) => {
  try {
    const { statusMessage, token } = await authModel.login_user(req.body);

    if (statusMessage === 'Login successful') return res.status(200).send({ message: 'Login exitoso', token });
    else if (statusMessage === 'Email does not exist') return res.status(404).send({ message: 'El correo electrónico no existe' });
    else if (statusMessage === 'Incorrect password') return res.status(401).send({ message: 'La contraseña es incorrecta' });
    else return res.status(500).send({ message: 'Error desconocido durante el inicio de sesión' });
  
  } catch (error) {
    res.status(500).json({ message: `Error durante el inicio de sesión: ${error.message}` });
  }
};