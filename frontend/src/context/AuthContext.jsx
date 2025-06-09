// 'use client'
// import { createContext, useState, useContext, useEffect } from "react";
// import { registerRequest, loginRequest, verifyTokenRequest } from "../api/auth";
// import Cookies from "js-cookie";

// export const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("El useAuth debe estar dentro de AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [errors, setErrors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isEmailVerified, setIsEmailVerified] = useState(false);

//   const signup = async (user) => {
//     try {
//       const res = await registerRequest(user);
//       setErrors([res.data.message]);
//     } catch (error) {
//       setErrors(error.response.data);
//     }
//   };

//   const signin = async (user) => {
//     try {
//       const res = await loginRequest(user);
//       console.log(res);
//       setIsAuthenticated(true);
//       setUser(res.data);
//       console.log(res.data, "este es el usuario");

//     } catch (error) {
//       if (Array.isArray(error.response.data)) {
//         return setErrors(error.response.data);
//       }
//       setErrors([error.response.data.message]);
//     }
//   };

//   const logout = () => {
//     Cookies.remove("token");
//     setIsAuthenticated(false);
//     setUser(null)
//   }

//   useEffect(() => {
//     if (errors.length > 0) {
//       const timer = setTimeout(() => {
//         setErrors([]);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [errors]);

//   useEffect(() => {
//     async function checkLogin() {
//       const cookies = Cookies.get();

//       if (!cookies.token) {
//         setIsAuthenticated(false);
//         setLoading(false)
//         return setUser(null);
//       }
//       try {
//         const res = await verifyTokenRequest(cookies.token);
//         if (!res.data) {
//           setIsAuthenticated(false);
//           setLoading(false);
//           return;
//         }

//         setIsAuthenticated(true);
//         setUser(res.data);
//         setLoading(false)
//       } catch (error) {
//         setIsAuthenticated(false);
//         setUser(null);
//         setLoading(false)
//       }
//     }
//     checkLogin();
//   }, []);

// /*   const requestPasswordReset = async (email) => {
//     try {
//       const res = await requestPasswordResetRequest(email);
//       setErrors([res.data.message]);  // Mensaje de éxito
//     } catch (error) {
//       setErrors([error.response.data.message || 'Hubo un error al solicitar el restablecimiento']);
//     }
//   }; */

//   const resetPassword = async (token, password) => {
//     try {
//       const res = await resetPasswordRequest(token, password);
//       setErrors([res.data.message]);  // Mensaje de éxito
//     } catch (error) {
//       setErrors([error.response.data.message || 'Hubo un error al restablecer la contraseña']);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         signup,
//         signin,
//         logout,
//         loading,
//         user,
//         isAuthenticated,
//         errors,
//         isEmailVerified,
//         setIsEmailVerified,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

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
  const [isEmailVerified, setIsEmailVerified] = useState(false);

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

      // Opción B: Si prefieres usar la cookie que ya está establecida por el backend
      // No necesitas establecer la cookie manualmente, ya está en 'jwt'

      // Asegurarse de que tenemos los datos del usuario
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
    Cookies.remove("token", { path: "/" }); // Importante especificar el mismo path
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
      const token = Cookies.get("token");

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return setUser(null);
      }

      try {
        const res = await verifyTokenRequest(token);
        console.log("Verificación de token:", res);

        if (!res.data) {
          Cookies.remove("token", { path: "/" });
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Asegurar que los datos del usuario son consistentes
        const userData = {
          id: res.data.id || res.data.user?.id,
          username: res.data.username || res.data.user?.username,
          email: res.data.email || res.data.user?.email,
          ...res.data.user,
          ...res.data,
        };

        console.log("Usuario verificado:", userData);

        setIsAuthenticated(true);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error("Error verificando token:", error);
        // Si hay un error, eliminamos la cookie
        Cookies.remove("token", { path: "/" });
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
        isEmailVerified,
        setIsEmailVerified,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
