"use client";
import { useState, useEffect } from "react";
import BarraLateral from "@/components/secure/BarraLateral";
import BarraHeader from "@/components/secure/BarraHeader";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { NotificacionesProvider } from "@/context/NotificacionesContext";
import { StantsProvider } from "@/context/StantContext";
import { ProductosProvider } from "@/context/ProductosContext";
import { CategoriaProvider } from "@/context/CategoriaContext";
import { EntregaProvider } from "@/context/EntregaContext";
import { PersonalProvider } from "@/context/PersonalContext";

export default function AdministradorLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Handle sidebar toggle
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // Handle responsive behavior
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        const smallScreen = window.innerWidth < 830;
        setIsSmallScreen(smallScreen);

        if (window.innerWidth >= 830) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      };

      // Initial setup
      handleResize();

      // Add event listener for window resize
      window.addEventListener("resize", handleResize);

      // Clean up event listener when component unmounts
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/"); // Redirige a la página de login si no está autenticado
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full gap-3">
        <p className="text-rojo text-2xl">Cargando...</p>
      </div>
    ); // Muestra un mensaje mientras se verifica el estado
  }

  return isAuthenticated ? (
    <>
      <main className="flex max-h-screen">
        <NotificacionesProvider>
          {/* Sidebar with overlay behavior on small screens */}
          <div
            className={`${
              isSmallScreen
                ? `fixed z-[90] ${isOpen ? "left-0" : "-left-[280px]"}`
                : `${isOpen ? "w-2/10 lg:w-2/10" : "w-[80px]"}`
            } transition-all duration-300 ease-in-out overflow-hidden h-full`}
          >
            <BarraLateral isOpen={isOpen} />
          </div>

          {/* Overlay background for small screens when sidebar is open */}
          {isSmallScreen && isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={handleToggle} // Close sidebar when clicking overlay
            />
          )}

          {/* Main content area with dynamic width - full width on small screens */}
          <div
            className={`${
              isSmallScreen
                ? "w-full"
                : `${isOpen ? "w-8/10" : "w-[calc(100%-80px)]"}`
            } bg-gris-claro min-h-screen transition-all duration-300 ease-in-out`}
          >
            <div className="h-full ">
              <nav className="h-[6rem]">
                {" "}
                {/* Altura fija en lugar de porcentaje */}
                <BarraHeader
                  handleToggle={handleToggle}
                  isOpen={isOpen}
                  isSmallScreen={isSmallScreen}
                />
              </nav>
              <StantsProvider>
                <ProductosProvider>
                  <CategoriaProvider>
                    <EntregaProvider>
                      <PersonalProvider>
                        <div className="bg-slate-900 w-full h-[calc(100%-6rem)]">
                          {/* Resta la altura del header (16px = 4rem) */}
                          <div className="bg-slate-950 w-full h-full rounded-tl-xl p-3 border-l border-t border-slate-700">
                            <div className=" w-full rounded-lg bg-slate-900  h-full">
                              {children}
                            </div>
                          </div>
                        </div>
                      </PersonalProvider>
                    </EntregaProvider>
                  </CategoriaProvider>
                </ProductosProvider>
              </StantsProvider>
            </div>
          </div>
        </NotificacionesProvider>
      </main>
    </>
  ) : null;
}
