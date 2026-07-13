import localFont from "next/font/local";
import "./globals.css";

// Если у вас были импорты шрифтов, оставьте их.
// Главное - уберите типы из функции RootLayout

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
