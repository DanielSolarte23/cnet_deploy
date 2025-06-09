"use client";
import { useNotificaciones } from "@/context/NotificacionesContext";
import React, { useEffect, useState } from "react";

function NotificacionesModal({ className }) {
  const { notificaciones, getNotificaciones, loading, errors } =
    useNotificaciones();

  useEffect(() => {
    getNotificaciones();
  }, []);

  return (
    <div 
      className={`bg-slate-900 border border-slate-600 py-8 px-6 max-h-[300px] overflow-y-auto rounded-lg shadow-lg ${className}`}
    >
      <h2 className="text-2xl font-bold text-start mb-2">Notificaciones</h2>

      {loading && <p>Cargando...</p>}
      {errors && <p className="text-red-500">{errors}</p>}
      {!loading && !errors && (
        <ul className="">
          {notificaciones.map((notificacion) => (
            <div key={notificacion.id}>
              <li  className="mb-1">
                {notificacion.mensaje}
              </li>
              <hr className="mb-1" />
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificacionesModal;
