"use client";

import "@fortawesome/fontawesome-free/css/all.min.css";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function InicioForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const {
    signin,
    isAuthenticated,
    errors: signErrors,
    loading: authLoading,
    user,
  } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState("password");
  const router = useRouter();

  const onSubmit = async (data) => {
    setLocalLoading(true);
    try {
      const result = await signin(data);
      // Si el signin es exitoso, el useEffect manejará la redirección
      if (result) {
        console.log("Login exitoso:", result);
        console.log("Este es el usuario", user);
      }
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Usuario autenticado, redirigiendo...", user);
      router.push("/secure/administrador");
    }
  }, [isAuthenticated, user, router]);

  // Limpiar errores después de un tiempo
  useEffect(() => {
    if (signErrors.length > 0) {
      const timer = setTimeout(() => {
        // clearErrors si existe en el contexto
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [signErrors]);

  const isLoading = localLoading || authLoading;

  return (
    <div className="w-5/6 rounded-lg px-4 sm:px-8 md:px-10 lg:px-14 py-8 md:py-12 lg:py-10 flex flex-col">
      {/* Mostrar errores de autenticación */}
      {signErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {signErrors.map((error, i) => (
            <div key={i} className="text-sm">
              {error}
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl text-slate-950 dark:text-gray-300 font-bold">
        Inicia sesión
      </h2>
      <p className="text-gray-400 text-sm md:text-lg mt-2 md:mt-4 mb-5">
        ¡Introduce tu nombre de usuario y contraseña para iniciar sesión!
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
        <div className="mb-4">
          <div className="w-full h-12 md:h-14 relative">
            <input
              type="text"
              placeholder="Ingresa tu nombre de usuario"
              disabled={isLoading}
              {...register("username", {
                required: "El nombre de usuario es obligatorio",
                // pattern: {
                //   value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                //   message: "Introduce un correo electrónico válido",
                // },
              })}
              className={`block h-full w-full px-4 py-2 mt-2 text-verde-dos placeholder:dark:text-gray-600 placeholder:text-slate-800 dark:text-slate-400 text-slate-800 placeholder:font-thin bg-transparent border border-gray-600 rounded-lg focus:outline-none text-base md:text-xl pl-10 ${
                errors.username ? "border-red-600" : "border-gray-600"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <i className="fa-solid fa-envelope absolute text-gray-500 top-1/2 -translate-y-1/2 left-3 text-lg md:text-xl"></i>
          </div>
          {errors.username && (
            <p className="text-red-600 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mt-4 md:mt-6">
          <div className="w-full h-12 md:h-14 relative">
            <input
              type={showPassword}
              placeholder="Ingresa tu contraseña"
              disabled={isLoading}
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
              className={`block h-full w-full px-4 py-2 mt-2 text-verde-dos placeholder:dark:text-gray-600 placeholder:text-slate-800 dark:text-slate-400 text-slate-800 placeholder:font-thin bg-transparent border border-gray-600 rounded-lg focus:outline-none text-base md:text-xl pl-10 ${
                errors.password ? "border-red-600" : "border-verde"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <i className="fa-solid fa-lock absolute text-gray-500 top-1/2 -translate-y-1/2 left-3 text-lg md:text-xl"></i>
            <i
              onClick={() => {
                if (!isLoading) {
                  setShowPassword((prevState) =>
                    prevState === "password" ? "text" : "password"
                  );
                }
              }}
              className={`fa-solid absolute text-gray-500 top-1/2 -translate-y-1/2 right-3 text-lg md:text-xl ${
                isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } ${showPassword === "password" ? "fa-eye" : "fa-eye-slash"}`}
            ></i>
          </div>
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="mt-2 md:mt-3">
          <p className="text-gray-400 text-sm md:text-lg">
            ¿Olvidaste tu contraseña?{" "}
            <Link
              className="dark:text-white text-slate-950 font-semibold hover:underline"
              href="/auth/forgot-password"
            >
              Recuperar
            </Link>
          </p>
        </div>

        <div className="mt-4 md:mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-2 h-12 md:h-14 text-sm md:text-xl font-mono tracking-wide text-slate-950 capitalize transition-colors duration-300 transform bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InicioForm;
