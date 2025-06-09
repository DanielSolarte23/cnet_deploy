"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import NotificacionesModal from "../auth/NotificacionesModal";

function BarraHeader({ handleToggle, isOpen, isSmallScreen }) {
  const { isAuthenticated, logout, user } = useAuth();
  const [modal, setModal] = useState(false);
  const [modalNotificaciones, setModalNotificaciones] = useState(false);

  const handleToggleModal = () => {
    setModal((prev) => !prev);
  };

  const handleToggleModalNotificaciones = () => {
    setModalNotificaciones((prev) => !prev);
  };

  return (
    <>
      <div
        className={`flex items-center bg-slate-900 2xl:h-24  border-l-0 px-5 z-40 transition-all duration-300 ease-in-out fixed h-24 ${
          isSmallScreen
            ? "w-full left-0"
            : isOpen
            ? "w-8/10"
            : "w-[calc(100%-80px)]"
        }`}
      >
        <div className="flex gap-3 w-1/2 text-slate-500">
          <div
            className="border border-slate-700 rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            onClick={handleToggle}
            title={isOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            <i className="fa-solid fa-bars text-xl"></i>
          </div>
        </div>
        <div className="w-1/2 flex justify-end gap-5 text-gray-300">
          <div className="relative flex gap-2 items-center">
            <button
              onClick={handleToggleModalNotificaciones}
              className="border border-slate-700 rounded-full p-2 flex justify-center items-center hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
              <i className="fa-solid fa-bell text-xl"></i>
            </button>
            {modalNotificaciones && <NotificacionesModal className={`absolute top-12 -left-52`} />}
          </div>
          <div className="flex gap-2 items-center">
            <div className="border border-slate-700 rounded-full p-2 flex justify-center items-center bg-verde">
              <i className="fa-solid fa-user text-xl text-white"></i>
            </div>
            <span className="text-verde-dos hidden md:block whitespace-nowrap overflow-hidden text-ellipsis max-w-32">
              {user?.nombre}
            </span>
            <div className="relative">
              <i
                onClick={handleToggleModal}
                className="fa-solid fa-chevron-down text-verde-dos cursor-pointer"
              ></i>
              {modal && (
                <ul className="bg-slate-900 absolute top-6 -left-36 p-5 border border-slate-600 rounded-lg text-verde-dos flex flex-col gap-2 shadow-md">
                  <li className="flex justify-between items-center gap-2 cursor-pointer hover:text-verde transition-colors duration-200">
                    Perfil <i className="fa-solid fa-user"></i>
                  </li>
                  <hr />
                  <li className="whitespace-nowrap flex justify-between items-center gap-2 cursor-pointer hover:text-verde transition-colors duration-200">
                    <Link
                      className="flex justify-between items-center gap-2"
                      href="/"
                      onClick={() => {
                        setTimeout(() => {
                          logout();
                        }, 500);
                      }}
                    >
                      Cerrar Sesión
                      <i className="fa-solid fa-right-to-bracket"></i>
                    </Link>
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
