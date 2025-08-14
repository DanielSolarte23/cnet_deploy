import InicioForm from "@/components/auth/InicioForm";
import React from "react";
import Image from "next/image";

function page() {
  return (
    <div className="h-screen w-full flex">
      <div className="md:w-1/2 w-full flex items-center  justify-center">
        <InicioForm />
      </div>
      <div
        className="bg-gradient-to-r from-white to-slate-900 dark:border-0  
dark:from-[#030712] dark:to-[#0a132a] dark:bg-[#040918] 
w-1/2 relative items-center justify-center hidden md:flex"
      >
        <div className="absolute  top-0 right-0">
          <Image
            src="/images/grid-01.svg"
            alt="grid-01"
            width={400}
            height={500}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-4/6 relative">
          {/* Logo para tema oscuro */}
          <Image
            src="/images/Logo_original_colombianet.svg"
            alt="Colombianet Logo Oscuro"
            width={250}
            height={80}
            className="object-cover w-full h-full hidden dark:block"
          />

          {/* Logo para tema claro */}
          <Image
            src="/images/Logo_original_colombianet_negro.svg"
            alt="Colombianet Logo Claro"
            width={250}
            height={80}
            className="object-cover w-full h-full dark:hidden"
          />
        </div>

        <div className="absolute bottom-0 left-0 rotate-180">
          <Image
            src="/images/grid-01.svg"
            alt="grid-02"
            width={400}
            height={500}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default page;
