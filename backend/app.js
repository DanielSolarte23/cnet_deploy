const express = require("express");
const cors = require("cors");
const path = require('path');
const bodyParser = require("body-parser");
const usuarioRoutes = require("./routes/user.Routes");
const authRoutes = require("./routes/auth.Routes");
const stantRoutes = require("./routes/Stant.Routes");
const productoRoutes = require("./routes/producto.Routes");
const categoriaRoutes = require("./routes/categoria.Routes");
const personalRoutes = require("./routes/Personal.Routes");
const EntregaRoutes = require("./routes/Entrega.Routes");
const ReintegroRoutes = require("./routes/Reintegro.Routes");
const NotificacionRoutes = require("./routes/Notificacion.Routes");
const cookieParser = require("cookie-parser");
const { sequelize } = require("./models");
const morgan = require("morgan");

const PORT = process.env.PORT || 3004;
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json());
app.use("/api", usuarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", stantRoutes);
app.use("/api", productoRoutes);
app.use("/api", categoriaRoutes);
app.use("/api", personalRoutes);
app.use("/api", EntregaRoutes);
app.use("/api", ReintegroRoutes);
app.use("/api", NotificacionRoutes);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // await sequelize.sync();
    console.log("Database synchronized");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
  }
}

startServer();
