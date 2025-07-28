const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio si no existe
const uploadDir = 'uploads/firmas';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: cedula_timestamp.png
    const cedula = req.body.cedula || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `firma_${cedula}_${timestamp}${extension}`);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    // Aceptar solo PNG, JPG, JPEG
    const allowedTypes = ['image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PNG para la firma'), false);
    }
  } else {
    cb(new Error('El archivo debe ser una imagen'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Límite de 2MB
  },
  fileFilter: fileFilter
});

module.exports = upload;