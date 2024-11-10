import * as authModel from '../models/auth.model.js';

export const register_user = async (req, res) => {
  try {
    const { statusMessage } = await authModel.register_user(req.body);
    if (statusMessage === 'Input validation failed') return res.status(400).send({ message: 'La validación de los datos ha fallado' });
    else if (statusMessage === 'Email already exists') return res.status(409).send({ message: 'El correo electrónico ya está registrado' });
    else if (statusMessage === 'User registered successfully') return res.status(201).send({ message: 'Usuario registrado correctamente' });
    else return res.status(500).send({ message: 'Error desconocido durante el registro' });
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