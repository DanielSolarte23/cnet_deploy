import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Colombianet APP",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  description: "Interface de la app colombianet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <AuthProvider>
        <body className="bg-white dark:bg-gray-950 text-gray-300">{children}</body>
      </AuthProvider>
    </html>
  );
}
