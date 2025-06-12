// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import { sendConfirmationEmail } from '../utils/mailer.js';
import User from '../models/user.js';
import Provider from '../models/Provider.js';
import bcrypt from 'bcrypt';

// ------------------------------------------------------------------
// 1) Registrar nuevo usuario o proveedor (envía correo de confirmación)
// ------------------------------------------------------------------
export const register = async (req, res) => {
  const {
    nombre,
    correo,
    clave,
    accountType,    // 'User' o 'Provider' //estoo, como se hace, crea o envia????????????
    servicios,      // solo para Provider
    ciudad,         // solo para Provider
    descripcion                          //campo para ambos usuarios
  } = req.body;

  // Validaciones básicas
  if (!['User', 'Provider'].includes(accountType)) {
    return res.status(400).json({ error: 'accountType inválido.' });
  }
  if (accountType === 'Provider' && (!servicios || !servicios.length)) {
    return res.status(400).json({ error: 'Un proveedor debe enviar al menos un servicio.' });
  }

  try {
    // Verificar que el correo no exista en ninguno de los dos modelos
    const existsUser = await User.findOne({ correo });
    const existsProvider = await Provider.findOne({ correo });
    if (existsUser || existsProvider) {
      return res
        .status(400)
        .json({ error: 'Correo ya registrado, por favor prueba otro.' });
    }

    const hashedPassword = await bcrypt.hash(clave, 10);

    // Armamos el payload incluyendo la información relevante
    const payload = {
      nombre,
      correo,
      clave: hashedPassword,
      accountType
    };
    if (accountType === 'Provider') {
      payload.servicios = servicios;
      payload.ciudad = ciudad;
      payload.descripcion = descripcion;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    await sendConfirmationEmail(correo, token);
    return res
      .status(201)
      .json({ message: 'Correo de confirmación enviado. Revisa tu bandeja.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// ------------------------------------------------------------------
// 2) Confirmar cuenta al hacer clic en el enlace del correo
// ------------------------------------------------------------------
export const confirmEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { correo, accountType } = payload;

    // Verificar duplicados de nuevo
    const existsUser = await User.findOne({ correo });
    const existsProvider = await Provider.findOne({ correo });
    if (existsUser || existsProvider) {
      return res
        .status(400)
        .json({ error: 'La cuenta ya fue creada previamente.' });
    }

    if (accountType === 'Provider') {
      // Creamos proveedor con todos sus campos
      const newProvider = new Provider({
        nombre: payload.nombre,
        correo,
        clave: payload.clave,
        servicios: payload.servicios,
        ciudad: payload.ciudad || '',
        descripcion: payload.descripcion || '',
        imagenUrl: '',
        calificacion: 0,
        galeria: [],
      });
      await newProvider.save();
    } else {
      // Creamos usuario normal
      const newUser = new User({
        nombre: payload.nombre,
        correo,
        clave: payload.clave
      });
      await newUser.save();
    }

    return res.json({ message: 'Cuenta confirmada y registrada correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Token inválido o expirado.' });
  }
};

// ------------------------------------------------------------------
// 3) Login para usuario o proveedor
// ------------------------------------------------------------------
export const login = async (req, res) => {
  const { correo, clave } = req.body;
  try {
    // Primero buscamos en Provider, si no, en User
    let user = await Provider.findOne({ correo });
    let userModel = 'Provider';
    if (!user) {
      user = await User.findOne({ correo });
      userModel = 'User';
    }
    if (!user) {
      return res.status(400).json({ error: 'Correo o clave incorrectas.' });
    }

    const match = await bcrypt.compare(clave, user.clave);
    if (!match) {
      return res.status(400).json({ error: 'Correo o clave incorrectas.' });
    }

    // Incluimos el tipo de cuenta en el token
    const token = jwt.sign(
      { id: user._id, correo: user.correo, accountType: userModel },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      message: 'Login exitoso',
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        accountType: userModel,
        servicios: userModel === 'Provider' ? user.servicios : []
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error en el servidor.' });
  }
};

// Obtener perfiles aleatorios de proveedores
export const randomProfiles = async (req, res) => {
  try {
    const providers = await Provider.aggregate([{ $sample: { size: 4 } }]);
    const sanitized = providers.map(p => ({
      _id: p._id,
      nombre: p.nombre,
      correo: p.correo,
      imagenUrl: p.imagenUrl, // me carga la imagen pero solo la url, no la imagen en sí ¡?????
      servicios: p.servicios,
      ciudad: p.ciudad,
      calificacion: p.calificacion,
      descripcion: p.descripcion
    }));
    return res.json(sanitized);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: 'Error al obtener perfiles aleatorios.' });
  }
};

// Búsqueda de proveedores
export const searchProviders = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }
    const term = q.trim();
    const num = parseFloat(term);
    const isNum = !isNaN(num);
    const regex = new RegExp(term, 'i');

    const orConditions = [
      { nombre: { $regex: regex } },
      { servicios: { $regex: regex } },
      { ciudad: { $regex: regex } }
    ];
    if (isNum) {
      orConditions.push({ calificacion: { $gte: num } });
    }

    const results = await Provider.find({ $or: orConditions }).select('-clave');
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al buscar proveedores.' });
  }
};
//todo check