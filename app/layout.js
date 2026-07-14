import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Мой.ПоставщИИк',
  description: 'Умный поиск и каталог поставщиков продуктов питания',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
