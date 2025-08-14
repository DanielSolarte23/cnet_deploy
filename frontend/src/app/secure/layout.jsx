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
  const [mounted, setMounted] = useState(false);

  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle sidebar toggle
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // Handle responsive behavior
  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

  // Manejar redirección de autenticación
  useEffect(() => {
    if (!mounted) return;

    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router, mounted]);

  // Mostrar loading mientras se monta el componente o se verifica auth
  if (!mounted || loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen w-full gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-red-600 text-2xl">Cargando...</p>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se está redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  return (
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
            onClick={handleToggle}
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
          <div className="h-full">
            <nav className="h-[6rem]">
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
                      <div className="dark:bg-slate-900 w-full h-[calc(100%-6rem)]">
                        <div className="dark:bg-slate-950 w-full h-full rounded-tl-xl p-3 border-l border-t dark:border-slate-700">
                          <div className="w-full rounded-lg dark:bg-slate-900 h-full">
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
  );
}
