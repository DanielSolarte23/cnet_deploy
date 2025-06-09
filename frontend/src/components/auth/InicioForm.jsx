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
  } = useForm();
  const {
    signin,
    isAuthenticated,
    errors: signErrors,
    // clearErrors,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPassword, setshowPassword] = useState("password");
  const router = useRouter();

  const onSubmit = handleSubmit((data) => {
    signin(data);
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/secure/administrador");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="w-5/6 rounded-lg px-4 sm:px-8 md:px-10 lg:px-14 py-8 md:py-12 lg:py-10 flex flex-col">
      {signErrors.map((error, i) => (
        <div className="text-red-500" key={i}>
          {error}
        </div>
      ))}
      <h2 className="text-2xl sm:text-3xl text-slate-950 dark:text-gray-300 font-bold">
        Inicia sesión
      </h2>
      <p className="text-gray-400 text-sm md:text-lg mt-2 md:mt-4 mb-5">
        ¡Introduce tu correo y contraseña para iniciar sesión!
      </p>
      <form onSubmit={onSubmit} className="mt-2">
        <div className="mb-4">
          <div className="w-full h-12 md:h-14 relative">
            <input
              type="email"
              placeholder="Ingresa tu correo"
              {...register("correo", {
                required: "El correo electrónico es obligatorio",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Introduce un correo electrónico válido",
                },
              })}
              className={`block h-full w-full px-4 py-2 mt-2 text-verde-dos placeholder:dark:text-gray-600 placeholder:text-slate-800 dark:text-slate-400 text-slate-800 placeholder:font-thin bg-transparent border border-gray-600  rounded-lg focus:outline-none text-base md:text-xl pl-10 ${
                errors.correo ? "border-red-600" : "border-gray-600"
              }`}
            />
            <i className="fa-solid fa-envelope absolute text-gray-500 top-1/2 -translate-y-1/2 left-3 text-lg md:text-xl"></i>
          </div>
          {errors.correo && (
            <p className="text-red-600 text-sm mt-1">
              {errors.correo.message}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-6">
          <div className="w-full h-12 md:h-14 relative">
            <input
              type={showPassword}
              placeholder="Ingresa tu contraseña"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
              className={`block h-full w-full px-4 py-2 mt-2 text-verde-dos placeholder:dark:text-gray-600 placeholder:text-slate-800 dark:text-slate-400 text-slate-800 placeholder:font-thin bg-transparent border border-gray-600  rounded-lg focus:outline-none text-base md:text-xl pl-10 ${
                errors.password ? "border-red-600" : "border-verde"
              }`}
            />
            <i className="fa-solid fa-lock absolute text-gray-500 top-1/2 -translate-y-1/2 left-3 text-lg md:text-xl"></i>
            <i
              onClick={() => {
                setshowPassword((prevState) =>
                  prevState === "password" ? "text" : "password"
                );
              }}
              className={`fa-solid absolute text-gray-500 top-1/2 -translate-y-1/2 right-3 text-lg md:text-xl cursor-pointer ${
                showPassword === "password" ? "fa-eye" : "fa-eye-slash"
              }`}
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
              className="dark:text-white text-slate-950 font-semibold "
              href="/auth/forgot-password"
            >
              Recuperar
            </Link>
          </p>
        </div>
        <div className="mt-4 md:mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-2 h-12 md:h-14 text-sm md:text-xl font-mono tracking-wide text-slate-950 capitalize transition-colors duration-300 transform bg-yellow-500 rounded-lg  ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </div>
      </form>
    </div>
  );
}
export default InicioForm;
