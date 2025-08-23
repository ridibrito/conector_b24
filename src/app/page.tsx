export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo/Ícone */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>

        {/* Título Principal */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bridge Bitrix24 ↔ Evolution API
        </h1>

        {/* Subtítulo */}
        <p className="text-xl text-gray-600 mb-8">
          Conector personalizado para WhatsApp via Evolution API
        </p>

        {/* Descrição */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Esta aplicação funciona como um bridge 100% back-end entre o Bitrix24 (Open Channels) 
            e a Evolution API (WhatsApp não-oficial), permitindo que atendentes usem o Contact Center 
            para receber e responder mensagens do WhatsApp.
          </p>
        </div>

        {/* Status da Aplicação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-600 font-semibold">Status</div>
            <div className="text-green-800">Online</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 font-semibold">Versão</div>
            <div className="text-blue-800">1.0.0</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-purple-600 font-semibold">Tipo</div>
            <div className="text-purple-800">Back-end API</div>
          </div>
        </div>

        {/* Endpoints Disponíveis */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoints Disponíveis</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between items-center">
              <span>POST /api/b24/callback</span>
              <span className="text-green-600">✓ Ativo</span>
            </div>
            <div className="flex justify-between items-center">
              <span>POST /api/b24/events/imconnector</span>
              <span className="text-green-600">✓ Ativo</span>
            </div>
            <div className="flex justify-between items-center">
              <span>POST /api/wa/webhook-in</span>
              <span className="text-green-600">✓ Ativo</span>
            </div>
            <div className="flex justify-between items-center">
              <span>POST /api/setup</span>
              <span className="text-green-600">✓ Ativo</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-gray-500 text-sm">
          <p>© 2024 Bridge Bitrix24 ↔ Evolution API</p>
          <p className="mt-1">Desenvolvido com Next.js e TypeScript</p>
        </footer>
      </div>
    </div>
  );
}
