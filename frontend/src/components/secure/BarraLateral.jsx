"use client";

import "@fortawesome/fontawesome-free/css/all.min.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function BarraLateral({ isOpen }) {
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [showText, setShowText] = useState(isOpen);
  const pathname = usePathname();

  const { user } = useAuth();

  useEffect(() => {
    let timeout;
    if (isOpen) {
      timeout = setTimeout(() => setShowText(true), 150);
    } else {
      setShowText(false);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  const toggleSubMenu = (menuName, isDisabled) => {
    if (isDisabled) return; // No permitir toggle si está deshabilitado
    setActiveSubMenu((prev) => (prev === menuName ? null : menuName));
  };

  // Función para verificar si un menú debe estar deshabilitado
  const isMenuDisabled = (menuText) => {
    if (user?.rol === "coordinador") {
      // Para coordinadores, solo "Productos" está habilitado
      return menuText !== "Productos";
    }
    return false; // Para otros roles, todos los menús están habilitados
  };

  const menuItems = [
    {
      icon: "fa-home",
      text: "Inicio",
      href: "/secure/administrador",
      pathname: "/secure/administrador",
      hasSubMenu: false,
    },
    {
      icon: "fa-boxes-stacked",
      text: "Almacen",
      href: "/secure/administrador/almacen",
      pathname: "/secure/administrador/almacen",
      hasSubMenu: true,
      subMenuName: "almacen",
      subMenuItems: [
        {
          icon: "fa-cube",
          text: "Modulos",
          href: "/secure/administrador/almacen/stants",
        },
        {
          icon: "fa-tags",
          text: "Categorías",
          href: "/secure/administrador/almacen/categorias",
        },
        {
          icon: "fa-box",
          text: "Productos",
          href: "/secure/administrador/almacen/productos",
        },
        {
          icon: "fa-right-left",
          text: "Entregas/Devoluciones",
          href: "/secure/administrador/almacen/gestion",
        },
      ],
    },
    {
      icon: "fa-helmet-safety",
      text: "Personal",
      href: "/secure/administrador/personal",
      pathname: "/secure/administrador/personal",
      hasSubMenu: false,
    },
    {
      icon: "fa-box",
      text: "Productos",
      href: "/secure/coordinadores/productos",
      pathname: "/secure/coordinadores/productos",
      hasSubMenu: false,
    },
  ];

  return (
    <div className="w-full h-full border-r">
      <div
        className={`sidebar h-full scrollbar bottom-0 
          bg-white dark:bg-slate-950 
          transition-all duration-300 ease-in-out fixed overflow-hidden 
          ${isOpen ? "w-2/10 min-w-[250px]" : "w-[80px]"}`}
      >
        {/* Logo */}
        <div className="flex justify-between items-center px-4 py-4 h-[14%]">
          <div
            className={`flex items-center ${
              isOpen ? "justify-start" : "justify-center w-full"
            } transition-all duration-300`}
          >
            <Image
              src="/images/Logo_original_colombianet.svg"
              alt="Logo"
              width={isOpen ? 50 : 40}
              height={isOpen ? 50 : 40}
              className={`hidden dark:block ${
                isOpen ? "w-20 xl:w-40 xl:h-40" : "w-10 h-10"
              } transition-all duration-400`}
            />
            <Image
              src="/images/Logo_original_colombianet_negro.svg"
              alt="Logo"
              width={isOpen ? 50 : 40}
              height={isOpen ? 50 : 40}
              className={`dark:hidden ${
                isOpen ? "w-20 xl:w-40 xl:h-40" : "w-10 h-10"
              } transition-all duration-400`}
            />
          </div>
        </div>

        {/* Menú */}
        <div className="px-2 py-2">
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const isSelected =
                pathname === item.pathname ||
                (item.hasSubMenu && pathname.startsWith(item.href + "/"));
              
              const isDisabled = isMenuDisabled(item.text);

              return (
                <div key={index} className="menu-item">
                  {item.hasSubMenu ? (
                    <div
                      onClick={() => toggleSubMenu(item.subMenuName, isDisabled)}
                      className={`p-3 flex items-center justify-between 
                        border border-slate-200 dark:border-slate-800 
                        rounded-md px-4 duration-300 
                        ${
                          isDisabled
                            ? "cursor-not-allowed opacity-40 bg-slate-100 dark:bg-slate-900 text-slate-400"
                            : `cursor-pointer ${
                                isSelected
                                  ? "bg-yellow-500 text-slate-950"
                                  : "hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-300"
                              }`
                        }`}
                    >
                      <div
                        className={`flex items-center ${
                          isOpen ? "w-full" : "justify-center"
                        } transition-all duration-400`}
                      >
                        <i
                          className={`fa-solid ml-1 ${item.icon} text-lg xl:text-xl 2xl:text-2xl`}
                        ></i>
                        <span
                          className={`text-sm xl:text-base 2xl:text-lg whitespace-nowrap overflow-hidden transition-all duration-200 ${
                            showText
                              ? "opacity-100 ml-3 max-w-40"
                              : "opacity-0 max-w-0 ml-0"
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                      {showText && !isDisabled && (
                        <i
                          className={`fa-solid fa-chevron-${
                            activeSubMenu === item.subMenuName
                              ? "down"
                              : "right"
                          } transition-transform duration-300`}
                        ></i>
                      )}
                      {showText && isDisabled && (
                        <i className="fa-solid fa-lock text-xs opacity-60"></i>
                      )}
                    </div>
                  ) : (
                    <div className={isDisabled ? "pointer-events-none" : ""}>
                      <Link
                        href={isDisabled ? "#" : item.href}
                        className={`p-3 flex items-center justify-between 
                          border border-slate-200 dark:border-slate-800 
                          rounded-md px-4 duration-300 
                          ${
                            isDisabled
                              ? "cursor-not-allowed opacity-40 bg-slate-100 dark:bg-slate-900 text-slate-400"
                              : `cursor-pointer ${
                                  isSelected
                                    ? "bg-yellow-500 text-slate-950"
                                    : "hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-300"
                                }`
                          }`}
                      >
                        <div
                          className={`flex items-center ${
                            isOpen ? "w-full" : "justify-center"
                          } transition-all duration-400`}
                        >
                          <i
                            className={`fa-solid ml-1 ${item.icon} text-lg xl:text-xl 2xl:text-2xl`}
                          ></i>
                          <span
                            className={`text-sm xl:text-base 2xl:text-lg whitespace-nowrap overflow-hidden transition-all duration-200 ${
                              showText
                                ? "opacity-100 ml-3 max-w-40"
                                : "opacity-0 max-w-0 ml-0"
                            }`}
                          >
                            {item.text}
                          </span>
                          {showText && isDisabled && (
                            <i className="fa-solid fa-lock text-xs opacity-60 ml-2"></i>
                          )}
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Submenú */}
                  {item.hasSubMenu && isOpen && !isDisabled && (
                    <div
                      className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                        activeSubMenu === item.subMenuName
                          ? "max-h-60 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.subMenuItems.map((subItem, subIndex) => {
                        const isSubSelected = pathname === subItem.href;
                        return (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className={`p-2 flex items-center 
                              border border-slate-200 dark:border-slate-800 
                              rounded-md px-4 duration-300 cursor-pointer
                              ${
                                isSubSelected
                                  ? "bg-yellow-500 text-slate-950"
                                  : "hover:bg-slate-800 hover:text-white text-slate-700 dark:text-slate-300"
                              }`}
                          >
                            <i
                              className={`fa-solid ${subItem.icon} text-sm mr-3`}
                            ></i>
                            <span className="text-sm whitespace-nowrap">
                              {subItem.text}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}