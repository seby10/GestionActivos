import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export default (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = verify(token, JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Autenticación fallida' });
  }
};

