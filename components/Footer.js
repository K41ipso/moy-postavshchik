export default function Footer() {
  return (
    <footer className="w-full">
      <div className="max-w-7xl mx-auto bg-slate-900/95 backdrop-blur-md py-8 px-6 rounded-t-3xl">
        <div className="text-center">
          <p className="text-white/90 text-lg mb-2 font-semibold">
            © 2026 Мой.ПоставщИИк — Все права защищены
          </p>
          <p className="text-white/70 text-sm mb-4">
            Разработано для поиска лучших поставщиков продуктов питания
          </p>
          <a 
            href="mailto:karandawwik@gmail.com" 
            className="inline-block px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-medium border border-white/20"
          >
            karandawwik@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
