export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white">Simulador Empresarial</h1>
        <div className="flex gap-4">
          <a
            href="/login"
            className="px-6 py-2 rounded-lg bg-white text-purple-600 font-semibold hover:bg-purple-50 transition"
          >
            Ingresar
          </a>
          <a
            href="/signup"
            className="px-6 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
          >
            Registrarse
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Aprende sobre Gestión Empresarial
        </h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Juega a ser empresario, toma decisiones estratégicas y compite con tus compañeros
        </p>
        <a
          href="/signup"
          className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg transition transform hover:scale-105"
        >
          Comenzar Ahora →
        </a>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '📊',
              title: 'Toma Decisiones',
              description: 'Controla producción, precios, marketing y más'
            },
            {
              icon: '📈',
              title: 'Ve Resultados',
              description: 'Ganancias, reportes financieros en tiempo real'
            },
            {
              icon: '🏆',
              title: 'Compite',
              description: 'Ranking en vivo, rivaliza con otros equipos'
            }
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg p-8 shadow-lg text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-purple-100 border-t border-purple-400">
        <p>Simulador Empresarial © 2026</p>
      </footer>
    </div>
  )
}
