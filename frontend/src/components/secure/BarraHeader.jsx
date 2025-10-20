"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NotificationsView from "../auth/NotificacionesModal";


function BarraHeader({ handleToggle, isOpen, isSmallScreen }) {
  const { logout, user } = useAuth();
  const [modal, setModal] = useState(false);
  const [modalNotificaciones, setModalNotificaciones] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const router = useRouter();

  // Leer tema guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  // Alternar tema
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleToggleModal = () => setModal((prev) => !prev);
  const handleToggleModalNotificaciones = () =>
    setModalNotificaciones((prev) => !prev);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setModal(false);
      logout();
      router.push("/");
    } catch (error) {
      console.error("Error durante el logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div
        className={`flex items-center bg-white dark:bg-slate-900 border-l-0 px-5 z-40 transition-all duration-300 ease-in-out fixed h-24 border-slate-200 dark:border-slate-800 ${
          isSmallScreen
            ? "w-full left-0"
            : isOpen
            ? "w-8/10"
            : "w-[calc(100%-80px)]"
        }`}
      >
        {/* Botón menú */}
        <div className="flex gap-3 w-1/2 text-slate-700 dark:text-slate-300">
          <div
            className="border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 transition-colors duration-200"
            onClick={handleToggle}
            title={isOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </div>
        </div>

        {/* Botones de usuario */}
        <div className="w-1/2 flex justify-end gap-5 text-slate-700 dark:text-slate-300">
          {/* Botón de notificaciones */}
          <div className="relative flex gap-2 items-center">
            <button
              onClick={handleToggleModalNotificaciones}
              className="border border-slate-200 dark:border-slate-800 rounded-full p-2 flex justify-center items-center hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
            >
              <i className="fa-solid fa-bell text-xl"></i>
            </button>
            {modalNotificaciones && (
              <NotificationsView className="" />
            )}
          </div>

          {/* Botón modo oscuro/claro */}
          <button
            onClick={toggleTheme}
            className="border border-slate-200 dark:border-slate-800 rounded-full p-2 flex justify-center items-center hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <i
              className={`fa-solid ${
                darkMode ? "fa-sun text-yellow-400" : "fa-moon text-slate-400"
              } text-xl`}
            ></i>
          </button>

          {/* Usuario y menú */}
          <div className="flex gap-2 items-center">
            <div className="border border-slate-200 dark:border-slate-800 rounded-full p-2 flex justify-center items-center bg-verde">
              <i className="fa-solid fa-user text-xl text-white"></i>
            </div>
            {/* <span className="text-verde-dos hidden md:block whitespace-nowrap overflow-hidden text-ellipsis max-w-32">
              {user?.nombre}
            </span> */}
            <div className="relative">
              <i
                onClick={handleToggleModal}
                className="fa-solid fa-chevron-down text-verde-dos cursor-pointer"
              ></i>
              {modal && (
                <ul className="bg-white dark:bg-slate-950 absolute top-6 -left-36 p-5 border border-slate-200 dark:border-slate-800 rounded-lg text-verde-dos flex flex-col gap-2 shadow-md z-50">
                  <li className="flex justify-between items-center gap-2 cursor-pointer hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 transition-colors duration-200 rounded-md px-2 py-1">
                    <Link
                      href="/perfil"
                      className="flex justify-between items-center gap-2 w-full"
                      onClick={() => setModal(false)}
                    >
                      Perfil <i className="fa-solid fa-user"></i>
                    </Link>
                  </li>
                  <hr className="border-slate-200 dark:border-slate-800" />
                  <li className="whitespace-nowrap flex justify-between items-center gap-2 cursor-pointer hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800 transition-colors duration-200 rounded-md px-2 py-1">
                    <button
                      className="flex justify-between items-center gap-2 w-full text-left"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          Cerrando...{" "}
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        </>
                      ) : (
                        <>
                          Cerrar Sesión{" "}
                          <i className="fa-solid fa-right-to-bracket"></i>
                        </>
                      )}
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BarraHeader;
