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
  const [isClient, setIsClient] = useState(false);

  // Asegurar que estamos en el cliente antes de verificar cookies
  useEffect(() => {
    setIsClient(true);
  }, []);

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

      // Guardar token con configuración más robusta
      if (res.data.token) {
        // Configuración de cookies más específica para Next.js
        Cookies.set("token", res.data.token, {
          expires: 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          domain: process.env.NODE_ENV === "production" ? undefined : "localhost"
        });
      }

      const userData = {
        id: res.data.usuario.id,
        username: res.data.usuario.username,
        email: res.data.usuario.correo,
        nombre: res.data.usuario.nombre,
        rol: res.data.usuario.rol,
        token: res.data.token || "from_cookie",
      };

      console.log("Datos del usuario a guardar:", userData);

      // Verificar que tenemos un ID válido
      if (!userData.id) {
        console.error("No se pudo obtener el ID del usuario:", res.data);
        throw new Error("Datos de usuario incompletos");
      }

      // Guardar en localStorage como backup (solo en cliente)
      if (typeof window !== "undefined") {
        localStorage.setItem("authUser", JSON.stringify(userData));
      }

      setIsAuthenticated(true);
      setUser(userData);

      return userData;
    } catch (error) {
      console.error("Error en signin:", error);

      // Limpiar cookies y localStorage
      Cookies.remove("token", { path: "/" });
      Cookies.remove("jwt", { path: "/" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("authUser");
      }
      
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

  const logout = async () => {
    try {
      // Limpiar cookies con diferentes configuraciones para asegurar eliminación completa
      Cookies.remove("token", { path: "/" });
      Cookies.remove("jwt", { path: "/" });
      
      // Intentar eliminar con diferentes configuraciones de dominio
      Cookies.remove("token", { path: "/", domain: window.location.hostname });
      Cookies.remove("jwt", { path: "/", domain: window.location.hostname });
      
      // Limpiar localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authUser");
        localStorage.clear(); // Limpiar todo el localStorage si es necesario
      }
      
      // Actualizar estado
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      
      // Opcional: Hacer una llamada al backend para invalidar el token
      // await logoutRequest(); // Si tienes esta función en tu API
      
      console.log("Logout completado exitosamente");
    } catch (error) {
      console.error("Error durante el logout:", error);
      // Asegurar que el estado se limpie incluso si hay error
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  };

  // Función para verificar la autenticación desde múltiples fuentes
  const checkAuthFromStorage = () => {
    if (typeof window === "undefined") return null;
    
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      localStorage.removeItem("authUser");
    }
    return null;
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
      // Solo ejecutar en el cliente
      if (!isClient) return;

      try {
        // Verificar token en cookies
        const token = Cookies.get("token") || Cookies.get("jwt");
        
        if (!token) {
          console.log("No hay token disponible");
          
          // Verificar si hay datos en localStorage como fallback
          const storedUser = checkAuthFromStorage();
          if (storedUser && storedUser.token && storedUser.token !== "from_cookie") {
            console.log("Intentando restaurar desde localStorage");
            try {
              const res = await verifyTokenRequest(storedUser.token);
              if (res.data) {
                setIsAuthenticated(true);
                setUser(storedUser);
                setLoading(false);
                return;
              }
            } catch (error) {
              console.log("Token en localStorage inválido, limpiando");
              localStorage.removeItem("authUser");
            }
          }
          
          setIsAuthenticated(false);
          setLoading(false);
          setUser(null);
          return;
        }

        console.log("Verificando token:", token);
        const res = await verifyTokenRequest(token);
        console.log("Verificación de token exitosa:", res);

        if (!res.data) {
          console.log("Respuesta sin datos, limpiando cookies");
          Cookies.remove("token", { path: "/" });
          Cookies.remove("jwt", { path: "/" });
          localStorage.removeItem("authUser");
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
          token: token,
          ...res.data.user,
          ...res.data,
        };

        console.log("Usuario verificado:", userData);

        // Sincronizar localStorage con los datos verificados
        localStorage.setItem("authUser", JSON.stringify(userData));

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
        
        // Limpiar cookies, localStorage y estado
        Cookies.remove("token", { path: "/" });
        Cookies.remove("jwt", { path: "/" });
        localStorage.removeItem("authUser");
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    }
    
    checkLogin();
  }, [isClient]); // Dependencia de isClient

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