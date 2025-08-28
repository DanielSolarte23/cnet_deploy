"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest, logoutRequest } from "../api/auth";
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

  const signup = async (userData) => {
    try {
      const res = await registerRequest(userData);
      setErrors([res.data.message]);
    } catch (error) {
      setErrors(error.response?.data || [error.message]);
    }
  };

  const signin = async (credentials) => {
    try {
      const res = await loginRequest(credentials);
      console.log("Respuesta completa del login:", res);

      // Verificar que tenemos todos los datos necesarios
      if (!res.data || !res.data.cuenta || !res.data.perfil) {
        throw new Error("Respuesta de login inválida");
      }

      // Guardar token con configuración más robusta
      if (res.data.token) {
        Cookies.set("jwt", res.data.token, {
          expires: 1, // 1 día como está configurado en el backend
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
          domain: process.env.NODE_ENV === "production" ? undefined : "localhost"
        });
      }

      // Estructurar los datos del usuario según el tipo de cuenta
      const cuentaData = res.data.cuenta;
      const perfilData = res.data.perfil;
      
      let userData = {
        // Datos de la cuenta
        cuentaId: cuentaData.id,
        username: cuentaData.username,
        tipo: cuentaData.tipo,
        token: res.data.token || "from_cookie",
        
        // Datos del perfil (Usuario o Personal)
        id: perfilData.id,
        nombre: perfilData.nombre,
        cedula: perfilData.cedula,
        telefono: perfilData.telefono,
      };

      // Agregar campos específicos según el tipo
      if (cuentaData.tipo === "usuario") {
        userData = {
          ...userData,
          rol: perfilData.rol, 
          username: perfilData.nombre, 
        };
      } else if (cuentaData.tipo === "personal") {
        userData = {
          ...userData,
          apellido: perfilData.apellido,
          expedicion: perfilData.expedicion,
          fecha_nacimiento: perfilData.fecha_nacimiento,
          cargo: perfilData.cargo,
          departamento: perfilData.departamento,
          activo: perfilData.activo,
          firma_path: perfilData.firma_path,
          rol: "personal", // Asignar rol genérico para personal
          username: `${perfilData.nombre} ${perfilData.apellido}`, // Para compatibilidad
        };
      }

      console.log("Datos del usuario procesados:", userData);

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
      console.log("Iniciando proceso de logout...");
      
      // 1. Llamar al endpoint del backend para limpiar la cookie httpOnly
      try {
        await logoutRequest();
        console.log("Logout en backend exitoso");
      } catch (error) {
        console.warn("Error al hacer logout en backend:", error);
        // Continuar con la limpieza local aunque falle el backend
      }
      
      // 2. Limpiar cookies del lado del cliente
      Cookies.remove("jwt", { path: "/" });
      Cookies.remove("token", { path: "/" }); // Por si acaso había alguna con este nombre
      
      // Intentar eliminar con diferentes configuraciones de dominio
      if (typeof window !== "undefined") {
        Cookies.remove("jwt", { path: "/", domain: window.location.hostname });
        Cookies.remove("jwt", { path: "/", domain: `.${window.location.hostname}` });
        Cookies.remove("token", { path: "/", domain: window.location.hostname });
      }
      
      // 3. Limpiar localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authUser");
      }
      
      // 4. Actualizar estado inmediatamente
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      
      console.log("Logout completado exitosamente");
      
      // 5. Opcional: Forzar recarga de la página para limpiar cualquier estado residual
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/"; // O la ruta que uses para login
        }, 100);
      }
      
    } catch (error) {
      console.error("Error durante el logout:", error);
      // Asegurar que el estado se limpie incluso si hay error
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      
      // En caso de error, también redirigir
      if (typeof window !== "undefined") {
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
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
        const token = Cookies.get("jwt");
        
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

        console.log("Verificando token...");
        const res = await verifyTokenRequest(token);
        console.log("Verificación de token exitosa:", res);

        if (!res.data || !res.data.cuenta || !res.data.perfil) {
          console.log("Respuesta sin datos válidos, limpiando cookies");
          Cookies.remove("jwt", { path: "/" });
          localStorage.removeItem("authUser");
          setIsAuthenticated(false);
          setLoading(false);
          setUser(null);
          return;
        }

        // Procesar los datos de la misma forma que en signin
        const cuentaData = res.data.cuenta;
        const perfilData = res.data.perfil;
        
        let userData = {
          // Datos de la cuenta
          cuentaId: cuentaData.id,
          username: cuentaData.username,
          tipo: cuentaData.tipo,
          token: token,
          
          // Datos del perfil (Usuario o Personal)
          id: perfilData.id,
          nombre: perfilData.nombre,
          cedula: perfilData.cedula,
          telefono: perfilData.telefono,
        };

        // Agregar campos específicos según el tipo
        if (cuentaData.tipo === "usuario") {
          userData = {
            ...userData,
            rol: perfilData.rol,
            username: perfilData.nombre,
          };
        } else if (cuentaData.tipo === "personal") {
          userData = {
            ...userData,
            apellido: perfilData.apellido,
            expedicion: perfilData.expedicion,
            fecha_nacimiento: perfilData.fecha_nacimiento,
            cargo: perfilData.cargo,
            departamento: perfilData.departamento,
            activo: perfilData.activo,
            firma_path: perfilData.firma_path,
            rol: "personal",
            username: `${perfilData.nombre} ${perfilData.apellido}`,
          };
        }

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
        Cookies.remove("jwt", { path: "/" });
        localStorage.removeItem("authUser");
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    }
    
    checkLogin();
  }, [isClient]);

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