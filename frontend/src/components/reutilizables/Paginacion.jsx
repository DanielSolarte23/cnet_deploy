import React from "react";

function Paginacion({ currentPage, totalPages, paginate, getPageNumbers }) {
  return (
    <nav className="h-full w-full flex justify-center items-center">
      <div className="flex w-full space-x-1  justify-between">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex gap-2 border items-center justify-center px-4 py-1 rounded-md ${
            currentPage === 1
              ? "text-gray-800  dark:bg-slate-900 cursor-not-allowed"
              : "text-gray-500  dark:bg-slate-950 hover:border-yellow-600 dark:hover:bg-slate-950 hover:text-yellow-500 transition-colors duration-400"
          }`}
        >
          <i className="fa-solid fa-arrow-left"></i>

          <span>Anterior</span>
        </button>

        <div className="flex gap-2">
          {getPageNumbers().map((number, index) => (
            <button
              key={index}
              onClick={() => (number !== "..." ? paginate(number) : null)}
              className={`hidden sm:block px-4 py-1 rounded-md ${
                number === currentPage
                  ? "bg-yellow-500 dark:text-slate-950 font-semibold cursor-default"
                  : number === "..."
                  ? "text-gray-500 cursor-default"
                  : "text-gray-500 dark:bg-slate-950 dark:hover:bg-slate-900 hover:text-yellow-500 border transition-colors duration-300"
              }`}
            >
              {number}
            </button>
          ))}
        </div>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex gap-2 border items-center justify-center px-4 py-1 rounded-md ${
            currentPage === totalPages
              ? "text-gray-800  dark:bg-slate-900 cursor-not-allowed"
              : "text-gray-500  dark:bg-slate-950 hover:border-yellow-600 dark:hover:bg-slate-950 hover:text-yellow-500 transition-colors duration-400"
          }`}
        >
          <span>Siguente</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </nav>
  );
}

export default Paginacion;
