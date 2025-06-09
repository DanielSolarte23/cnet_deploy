"use client";

import "@fortawesome/fontawesome-free/css/all.min.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function BarraLateral({ isOpen }) {
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [showText, setShowText] = useState(isOpen);
  const pathname = usePathname();

  // Control text visibility with timing for both opening and closing
  useEffect(() => {
    let timeout;
    if (isOpen) {
      // Delay showing text until sidebar is fully open
      timeout = setTimeout(() => {
        setShowText(true);
      }, 150); // 150ms delay for opening
    } else {
      // Hide text immediately when closing begins
      setShowText(false);
      // No delay needed for hiding text
    }

    return () => clearTimeout(timeout);
  }, [isOpen]);

  const toggleSubMenu = (menuName) => {
    setActiveSubMenu((prev) => (prev === menuName ? null : menuName));
  };

  // Estructura del menú con submenús
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
  ];

  return (
    <div className="w-full h-full">
      {/* Barra lateral */}
      <div
        className={`sidebar h-full scrollbar bottom-0 bg-slate-900/50 transition-all duration-300 ease-in-out fixed overflow-hidden ${
          isOpen ? "w-2/10 min-w-[250px]" : "w-[80px]"
        }`}
      >
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
              className={`${
                isOpen ? "w-20 xl:w-40 xl:h-40 2xl:h-40" : "w-10 h-10"
              } transition-all duration-400`}
            />
          </div>
        </div>

        <div className="px-2 py-2">
          {/* Menú principal */}
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index} className="menu-item">
                {/* Elemento principal del menú */}
                {item.hasSubMenu ? (
                  <div
                    onClick={() => toggleSubMenu(item.subMenuName)}
                    className={`p-3 flex items-center justify-between border border-slate-700 rounded-md px-4 duration-300 cursor-pointer hover:bg-verde-principal text-verde-dos hover:text-white group ${
                      pathname === item.pathname ||
                      pathname.startsWith(item.href + "/")
                        ? "bg-slate-950 text-white"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        isOpen ? "w-full" : "justify-center"
                      } transition-all duration-400`}
                    >
                      <i
                        className={`fa-solid ml-1 ${item.icon} text-lg xl:text-xl 2xl:text-2xl transition-all duration-400`}
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

                    {/* Flecha para submenú */}
                    {showText && (
                      <i
                        className={`fa-solid fa-chevron-${
                          activeSubMenu === item.subMenuName ? "down" : "right"
                        } transition-transform duration-300`}
                      ></i>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`p-3 flex items-center justify-between border border-slate-700 rounded-md px-4 duration-300 cursor-pointer hover:bg-verde-principal text-verde-dos hover:text-white group ${
                      pathname === item.pathname
                        ? "bg-slate-950 text-white"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex items-center ${
                        isOpen ? "w-full" : "justify-center"
                      } transition-all duration-400`}
                    >
                      <i
                        className={`fa-solid ml-1 ${item.icon} text-lg xl:text-xl 2xl:text-2xl transition-all duration-400`}
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
                  </Link>
                )}

                {/* Submenú */}
                {item.hasSubMenu && isOpen && (
                  <div
                    className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                      activeSubMenu === item.subMenuName
                        ? "max-h-60 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.subMenuItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={`p-2 flex items-center border border-slate-900 rounded-md px-4 duration-300 cursor-pointer hover:bg-slate-950 text-verde-dos hover:text-white ${
                          pathname === subItem.href
                            ? "bg-slate-800 text-white"
                            : ""
                        }`}
                      >
                        <i
                          className={`fa-solid ${subItem.icon} text-sm mr-3`}
                        ></i>
                        <span className="text-sm whitespace-nowrap">
                          {subItem.text}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
