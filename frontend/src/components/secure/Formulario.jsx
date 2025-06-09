"use client";
import React, { useState, useEffect } from "react";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
} from "@mui/material";

const FormularioProducto = () => {
  // Estado para controlar los pasos del formulario
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    "Seleccionar Categoría",
    "Datos del Producto",
    "Unidades con Serial (Opcional)",
  ];

  // Estado para datos de categorías y subcategorías
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [estantes, setEstantes] = useState([]);

  // Estado para el formulario de categoría
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: "" });
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState({
    nombre: "",
    CategoriumId: "",
  });
  const [dialogCategoriaOpen, setDialogCategoriaOpen] = useState(false);
  const [dialogSubcategoriaOpen, setDialogSubcategoriaOpen] = useState(false);

  // Estado para el formulario de producto
  const [producto, setProducto] = useState({
    codigo: "",
    descripcion: "",
    marca: "",
    modelo: "",
    color: "",
    unidadMedida: "",
    stock: 0,
    stockMinimo: 0,
    fechaIngreso: new Date().toISOString().split("T")[0],
    estado: "disponible",
    notas: "",
    StantId: "",
    SubcategoriumId: "",
    unidades: [],
  });

  // Estado para controlar si el producto tiene seriales
  const [tieneSerial, setTieneSerial] = useState(false);

  // Estado para errores de validación
  const [errors, setErrors] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasRes, estantesRes] = await Promise.all([
          axios.get("http://localhost:3004/api/categorias"),
          axios.get("http://localhost:3004/api/stants"),
        ]);
        setCategorias(categoriasRes.data.data || []);
        setEstantes(estantesRes.data.data || []);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    fetchData();
  }, []);

  // Cargar subcategorías cuando se selecciona una categoría
  const cargarSubcategorias = async (categoriaId) => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/categorias/${categoriaId}/subcategorias`
      );
      setSubcategorias(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar subcategorías:", error);
    }
  };

  // Manejar cambio de categoría seleccionada
  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    if (categoriaId) {
      cargarSubcategorias(categoriaId);
      setNuevaSubcategoria({ ...nuevaSubcategoria, CategoriumId: categoriaId });
    }
  };

  // Manejar cambio en los campos del formulario de producto
  const handleProductoChange = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: value });
  };

  // Manejar cambio en las unidades con serial
  const handleUnidadChange = (index, field, value) => {
    const nuevasUnidades = [...producto.unidades];
    nuevasUnidades[index] = { ...nuevasUnidades[index], [field]: value };
    setProducto({ ...producto, unidades: nuevasUnidades });
  };

  // Agregar una nueva unidad con serial
  const agregarUnidad = () => {
    setProducto({
      ...producto,
      unidades: [...producto.unidades, { serial: "", estado: "nuevo" }],
    });
  };

  // Eliminar una unidad con serial
  const eliminarUnidad = (index) => {
    const nuevasUnidades = [...producto.unidades];
    nuevasUnidades.splice(index, 1);
    setProducto({ ...producto, unidades: nuevasUnidades });
  };

  // Crear nueva categoría
  const crearCategoria = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3004/api/categorias",
        nuevaCategoria
      );
      setCategorias([...categorias, response.data.data]);
      setNuevaSubcategoria({
        ...nuevaSubcategoria,
        CategoriumId: response.data.data.id,
      });
      setDialogCategoriaOpen(false);
      alert("Categoría creada con éxito");
      return response.data.data.id;
    } catch (error) {
      console.error("Error al crear categoría:", error);
      alert(
        "Error al crear categoría: " + error.response?.data?.message ||
          error.message
      );
      return null;
    }
  };

  // Crear nueva subcategoría
  const crearSubcategoria = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3004/api/subcategorias",
        nuevaSubcategoria
      );
      setSubcategorias([...subcategorias, response.data.data]);
      setProducto({ ...producto, SubcategoriumId: response.data.data.id });
      setDialogSubcategoriaOpen(false);
      alert("Subcategoría creada con éxito");
    } catch (error) {
      console.error("Error al crear subcategoría:", error);
      alert(
        "Error al crear subcategoría: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  // Validar paso actual
  const validarPasoActual = () => {
    let errorsObj = {};

    if (activeStep === 0) {
      if (!producto.SubcategoriumId) {
        errorsObj.subcategoria = "Debe seleccionar una subcategoría";
      }
    } else if (activeStep === 1) {
      if (!producto.codigo) errorsObj.codigo = "El código es obligatorio";
      if (!producto.descripcion)
        errorsObj.descripcion = "La descripción es obligatoria";
      if (!producto.StantId) errorsObj.estante = "Debe seleccionar un estante";
      if (!tieneSerial && (!producto.stock || producto.stock <= 0)) {
        errorsObj.stock = "La cantidad debe ser mayor que 0";
      }
    } else if (activeStep === 2 && tieneSerial) {
      if (producto.unidades.length === 0) {
        errorsObj.unidades = "Debe agregar al menos una unidad con serial";
      } else {
        const serialesVacios = producto.unidades.some((u) => !u.serial);
        if (serialesVacios) {
          errorsObj.unidades = "Todos los seriales deben ser completados";
        }
      }
    }

    setErrors(errorsObj);
    return Object.keys(errorsObj).length === 0;
  };

  // Avanzar al siguiente paso
  const handleNext = () => {
    if (validarPasoActual()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // Retroceder al paso anterior
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Enviar el formulario
  const handleSubmit = async () => {
    if (!validarPasoActual()) {
      return;
    }

    try {
      // Preparar datos del producto
      const productoData = { ...producto };

      // Si no tiene serial, eliminar las unidades y usar el stock directo
      if (!tieneSerial) {
        delete productoData.unidades;
      } else {
        // Si tiene serial, el stock se calculará automáticamente en el servidor
        delete productoData.stock;
      }

      const response = await axios.post(
        "http://localhost:3004/api/productos",
        productoData
      );
      alert("Producto creado con éxito");

      // Resetear el formulario
      setProducto({
        codigo: "",
        descripcion: "",
        marca: "",
        modelo: "",
        color: "",
        unidadMedida: "",
        stock: 0,
        stockMinimo: 0,
        fechaIngreso: new Date().toISOString().split("T")[0],
        estado: "disponible",
        notas: "",
        StantId: "",
        SubcategoriumId: "",
        unidades: [],
      });
      setActiveStep(0);
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert(
        "Error al crear producto: " + error.response?.data?.message ||
          error.message
      );
    }
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Nuevo Producto
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selección de Categoría y Subcategoría
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth error={!!errors.categoria}>
                  <InputLabel>Categoría</InputLabel>
                  <Select label="Categoría" onChange={handleCategoriaChange}>
                    {categorias.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.categoria && (
                    <FormHelperText>{errors.categoria}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogCategoriaOpen(true)}
                  fullWidth
                  sx={{ height: "56px" }}
                >
                  Nueva
                </Button>
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth error={!!errors.subcategoria}>
                  <InputLabel>Subcategoría</InputLabel>
                  <Select
                    label="Subcategoría"
                    name="SubcategoriumId"
                    value={producto.SubcategoriumId}
                    onChange={handleProductoChange}
                  >
                    {subcategorias.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.subcategoria && (
                    <FormHelperText>{errors.subcategoria}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogSubcategoriaOpen(true)}
                  disabled={!nuevaSubcategoria.CategoriumId}
                  fullWidth
                  sx={{ height: "56px" }}
                >
                  Nueva
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Datos del Producto
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Código"
                  name="codigo"
                  value={producto.codigo}
                  onChange={handleProductoChange}
                  error={!!errors.codigo}
                  helperText={errors.codigo}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={producto.descripcion}
                  onChange={handleProductoChange}
                  error={!!errors.descripcion}
                  helperText={errors.descripcion}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Marca"
                  name="marca"
                  value={producto.marca}
                  onChange={handleProductoChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Modelo"
                  name="modelo"
                  value={producto.modelo}
                  onChange={handleProductoChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Color"
                  name="color"
                  value={producto.color}
                  onChange={handleProductoChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Unidad de Medida"
                  name="unidadMedida"
                  value={producto.unidadMedida}
                  onChange={handleProductoChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!errors.estante}>
                  <InputLabel>Estante</InputLabel>
                  <Select
                    label="Estante"
                    name="StantId"
                    value={producto.StantId}
                    onChange={handleProductoChange}
                  >
                    {estantes.map((estante) => (
                      <MenuItem key={estante.id} value={estante.id}>
                        {estante.nombre} (#{estante.codigo})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.estante && (
                    <FormHelperText>{errors.estante}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    label="Estado"
                    name="estado"
                    value={producto.estado}
                    onChange={handleProductoChange}
                  >
                    <MenuItem value="disponible">Disponible</MenuItem>
                    <MenuItem value="agotado">Agotado</MenuItem>
                    <MenuItem value="descontinuado">Descontinuado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="subtitle1">
                    ¿El producto tiene números de serie individuales?
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Button
                        variant={tieneSerial ? "contained" : "outlined"}
                        onClick={() => setTieneSerial(true)}
                      >
                        Sí
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant={!tieneSerial ? "contained" : "outlined"}
                        onClick={() => setTieneSerial(false)}
                      >
                        No
                      </Button>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>

              {!tieneSerial && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Cantidad (Stock)"
                      name="stock"
                      value={producto.stock}
                      onChange={handleProductoChange}
                      error={!!errors.stock}
                      helperText={errors.stock}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Stock Mínimo"
                      name="stockMinimo"
                      value={producto.stockMinimo}
                      onChange={handleProductoChange}
                    />
                  </Grid>
                </>
              )}

              {tieneSerial && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Stock Mínimo"
                    name="stockMinimo"
                    value={producto.stockMinimo}
                    onChange={handleProductoChange}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Ingreso"
                  name="fechaIngreso"
                  value={producto.fechaIngreso}
                  onChange={handleProductoChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notas"
                  name="notas"
                  value={producto.notas}
                  onChange={handleProductoChange}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 2 && tieneSerial && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Unidades con Serial
            </Typography>
            {errors.unidades && (
              <Typography color="error" variant="body2" gutterBottom>
                {errors.unidades}
              </Typography>
            )}

            {producto.unidades.map((unidad, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={`Serial #${index + 1}`}
                    value={unidad.serial}
                    onChange={(e) =>
                      handleUnidadChange(index, "serial", e.target.value)
                    }
                    error={!unidad.serial && !!errors.unidades}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      label="Estado"
                      value={unidad.estado || "nuevo"}
                      onChange={(e) =>
                        handleUnidadChange(index, "estado", e.target.value)
                      }
                    >
                      <MenuItem value="nuevo">Nuevo</MenuItem>
                      <MenuItem value="usado">Usado</MenuItem>
                      <MenuItem value="reparado">Reparado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    color="error"
                    onClick={() => eliminarUnidad(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={agregarUnidad}
              sx={{ mt: 2 }}
            >
              Agregar Unidad
            </Button>
          </Box>
        )}

        {activeStep === 2 && !tieneSerial && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resumen del Producto
            </Typography>
            <Typography variant="body1">
              Producto sin seriales individuales con una cantidad de{" "}
              {producto.stock} unidades.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={
              activeStep === steps.length - 1 ? handleSubmit : handleNext
            }
          >
            {activeStep === steps.length - 1 ? "Guardar Producto" : "Siguiente"}
          </Button>
        </Box>
      </Paper>

      {/* Dialog para crear nueva categoría */}
      <Dialog
        open={dialogCategoriaOpen}
        onClose={() => setDialogCategoriaOpen(false)}
      >
        <DialogTitle>Nueva Categoría</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de Categoría"
            fullWidth
            value={nuevaCategoria.nombre}
            onChange={(e) => setNuevaCategoria({ nombre: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCategoriaOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={crearCategoria} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear nueva subcategoría */}
      <Dialog
        open={dialogSubcategoriaOpen}
        onClose={() => setDialogSubcategoriaOpen(false)}
      >
        <DialogTitle>Nueva Subcategoría</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de Subcategoría"
            fullWidth
            value={nuevaSubcategoria.nombre}
            onChange={(e) =>
              setNuevaSubcategoria({
                ...nuevaSubcategoria,
                nombre: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogSubcategoriaOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={crearSubcategoria} variant="contained">
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormularioProducto;
// </Button></Grid></FormControl></Grid></Select></MenuItem></Grid></Box></Step></Paper>
