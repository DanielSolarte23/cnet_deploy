import InicioForm from "@/components/auth/InicioForm";
import React from "react";
import Image from "next/image";

function page() {
  return (
    <div className="h-screen w-full flex">
      <div className="md:w-1/2 w-full flex items-center justify-center">
        <InicioForm />
      </div>
      <div className="bg-slate-800   border-l dark:border-0  
      dark:bg-[#040918] 
      w-1/2 relative items-center justify-center hidden md:flex">
        <div className="absolute  top-0 right-0">
          <Image
            src="/images/grid-01.svg"
            alt="Colombianet Logo"
            width={400}
            height={500}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-4/6">
          <Image
            src="/images/Logo_original_colombianet.svg"
            alt="Colombianet Logo"
            width={250}
            height={80}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="absolute bottom-0 left-0 rotate-180">
          <Image
            src="/images/grid-01.svg"
            alt="Colombianet Logo"
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
