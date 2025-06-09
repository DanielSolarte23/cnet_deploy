"use client";

import React from "react";
// import LogoArog from "./publicas/LogoArog";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-verde border-solid rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-700">Cargando...</p>
        {/* <LogoArog className={`h-36 w-36 animate-pulse`}/> */}
      </div>
    </div>
  );
};

export default LoadingScreen;