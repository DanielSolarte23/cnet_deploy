"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest } from "../api/auth";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("El useAuth debe estar dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const signup = async (user) => {
    try {
      const res = await registerRequest(user);
      setErrors([res.data.message]);
    } catch (error) {
      setErrors(error.response.data);
    }
  };

  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      console.log("Respuesta completa del login:", res);

      // Verificar que tenemos todos los datos necesarios
      if (!res.data || !res.data.usuario) {
        throw new Error("Respuesta de login inválida");
      }

      // Opción A: Si modificaste el backend para enviar el token
      if (res.data.token) {
        Cookies.set("token", res.data.token, {
          expires: 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }

      const userData = {
        id: res.data.usuario.id,
        username: res.data.usuario.username,
        email: res.data.usuario.correo, // Nota: el backend usa 'correo'
        nombre: res.data.usuario.nombre,
        rol: res.data.usuario.rol,
        token: res.data.token || "from_cookie", // Indicador si viene de cookie
      };

      console.log("Datos del usuario a guardar:", userData);

      // Verificar que tenemos un ID válido
      if (!userData.id) {
        console.error("No se pudo obtener el ID del usuario:", res.data);
        throw new Error("Datos de usuario incompletos");
      }

      setIsAuthenticated(true);
      setUser(userData);

      return userData;
    } catch (error) {
      console.error("Error en signin:", error);

      // Limpiar cookies
      Cookies.remove("token", { path: "/" });
      Cookies.remove("jwt", { path: "/" }); // También limpiar la cookie del backend
      setIsAuthenticated(false);
      setUser(null);

      if (Array.isArray(error.response?.data)) {
        return setErrors(error.response.data);
      }
      setErrors([
        error.response?.data?.message ||
          error.message ||
          "Error de autenticación",
      ]);
    }
  };

  const logout = () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("jwt", { path: "/" }); // También limpiar jwt si existe
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    async function checkLogin() {
      // Verificar tanto token como jwt (dependiendo de lo que use tu backend)
      const token = Cookies.get("token") || Cookies.get("jwt");

      if (!token) {
        console.log("No hay token disponible");
        setIsAuthenticated(false);
        setLoading(false);
        setUser(null);
        return;
      }

      try {
        console.log("Verificando token:", token);
        const res = await verifyTokenRequest(token);
        console.log("Verificación de token exitosa:", res);

        if (!res.data) {
          console.log("Respuesta sin datos, limpiando cookies");
          Cookies.remove("token", { path: "/" });
          Cookies.remove("jwt", { path: "/" });
          setIsAuthenticated(false);
          setLoading(false);
          setUser(null);
          return;
        }

        // Asegurar que los datos del usuario son consistentes
        const userData = {
          id: res.data.id || res.data.user?.id,
          username: res.data.username || res.data.user?.username,
          email: res.data.email || res.data.user?.email || res.data.correo,
          nombre: res.data.nombre || res.data.user?.nombre,
          rol: res.data.rol || res.data.user?.rol,
          ...res.data.user,
          ...res.data,
        };

        console.log("Usuario verificado:", userData);

        setIsAuthenticated(true);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error verificando token:", error);
        
        // Solo mostrar error si no es 401 (token expirado es normal)
        if (error.response?.status !== 401) {
          console.error("Error inesperado:", error.response?.data);
        } else {
          console.log("Token expirado o inválido, limpiando sesión");
        }
        
        // Limpiar cookies y estado
        Cookies.remove("token", { path: "/" });
        Cookies.remove("jwt", { path: "/" });
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    }
    
    checkLogin();
  }, []);

  const resetPassword = async (token, password) => {
    try {
      const res = await resetPasswordRequest(token, password);
      setErrors([res.data.message]); // Mensaje de éxito
    } catch (error) {
      setErrors([
        error.response?.data?.message ||
          "Hubo un error al restablecer la contraseña",
      ]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signup,
        signin,
        logout,
        loading,
        user,
        isAuthenticated,
        errors,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};