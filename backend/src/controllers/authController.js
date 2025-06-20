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
    accountType,    // 'User' o 'Provider' 
    servicios,      // solo para Provider
    ciudad,         // solo para Provider
    descripcion                          //campo para ambos usuarios
  } = req.body;

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
// 3) Login para usuario o proveedor o adMIN
// ------------------------------------------------------------------
export const login = async (req, res) => {
  const { correo, clave } = req.body;
  try {
    // Primero buscar en Provider
    let user = await Provider.findOne({ correo });
    let model = 'Provider';

    // Si no es provider, buscar en User
    if (!user) {
      user = await User.findOne({ correo });
      model = 'User';
    }

    // Si no existe
    if (!user) {
      return res.status(400).json({ error: 'Correo o clave incorrectas.' });
    }

    // Comparar clave
    const match = await bcrypt.compare(clave, user.clave);
    if (!match) {
      return res.status(400).json({ error: 'Correo o clave incorrectas.' });
    }

    // Extraer role (sólo para User)
    const role = model === 'User' ? user.role : 'provider';

    // Firmar token incluyendo role y accountType
    const token = jwt.sign(
      {
        id: user._id,
        correo: user.correo,
        accountType: model,
        role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Construir objeto userResponse
    const userResponse = {
      _id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      accountType: model,
      role,
    };
    if (model === 'Provider') {
      userResponse.servicios = user.servicios;
    }

    return res.json({ message: 'Login exitoso', token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error en el servidor.' });
  }
};

/////////////////////////////////////////////////////
// (4)Obtener perfiles aleatorios de proveedores
export const randomProfiles = async (req, res) => {
  try {
    const providers = await Provider.aggregate([{ $sample: { size: 4 } }]);
    const sanitized = providers.map(p => ({
      _id: p._id,
      nombre: p.nombre,
      correo: p.correo,
      imagenUrl: p.imagenUrl, 
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
////////////////////////////////////////////
// (5)Búsqueda de proveedores
export const searchProviders = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json([]);

    // 1. Función para escapar caracteres especiales en la RegExp
    const escapeRegExp = (str) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 2. Dividir en tokens
    const tokens = q.trim().split(/\s+/);

    // 3. Para cada token, construir un sub-$or
    const andConditions = tokens.map(token => {
      const regex = new RegExp(escapeRegExp(token), 'i');
      const orSub = [
        { nombre:  { $regex: regex } },
        { servicios:{ $regex: regex } },
        { ciudad:  { $regex: regex } },
      ];
      // Si el token es numérico, añadir búsqueda por calificación
      const num = parseFloat(token);
      if (!isNaN(num)) {
        orSub.push({ calificacion: { $gte: num } });
      }
      return { $or: orSub };
    });

    // 4. Ejecutar consulta AND → OR
    const results = await Provider
      .find({ $and: andConditions })
      .select('-clave');

    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al buscar proveedores.' });
  }
};

/////////////////////////////////////////
//crear administrador
// 6) Crear admin (solo una vez o cuando sea necesario)
export const createAdmin = async (req, res) => {
  const { nombre, correo, clave } = req.body;
  try {
    const existsAdmin = await User.findOne({ role: 'admin' });
    if (existsAdmin) {
      return res.status(400).json({ error: 'Ya existe un admin registrado' });
    }

    const hashedPassword = await bcrypt.hash(clave, 10);

    const admin = new User({
      nombre,
      correo,
      clave: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    res.status(201).json({ message: 'Admin creado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear admin' });
  }
};
// ------------------------------------------------------------------
// 7) Obtener todos los usuarios y proveedores
// ------------------------------------------------------------------
export const getAllUsersAndProviders = async (req, res) => {
  try {
    // Obtener usuarios
    const users = await User.find({}).select('-clave'); // Seleccionamos todos los usuarios sin la clave
    // Obtener proveedores
    const providers = await Provider.find({}).select('-clave'); // Seleccionamos todos los proveedores sin la clave

    // Combinar los resultados de usuarios y proveedores
    const allUsersAndProviders = [...users, ...providers]; // Usamos spread operator para combinar

    console.log('Usuarios y proveedores obtenidos:', allUsersAndProviders); // Debugging para ver los datos

    return res.json(allUsersAndProviders); // Devolver todos los usuarios y proveedores
  } catch (error) {
    console.error('Error al obtener usuarios y proveedores:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios y proveedores' });
  }
};


//todo check