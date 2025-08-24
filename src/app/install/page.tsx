export default function InstallPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Instalação do Bridge WhatsApp
        </h1>

        {/* Subtítulo */}
        <p className="text-lg text-gray-600 mb-8">
          Conectando Bitrix24 com WhatsApp via Evolution API
        </p>

        {/* Status */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-yellow-800 font-semibold">Instalação em Andamento</span>
          </div>
          <p className="text-yellow-700 text-sm">
            Aguarde enquanto configuramos a conexão entre o Bitrix24 e o WhatsApp...
          </p>
        </div>

        {/* Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">O que será configurado:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Conector personalizado no Bitrix24</li>
              <li>• Webhook para Evolution API</li>
              <li>• Eventos de mensagens</li>
              <li>• Autenticação OAuth2</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Próximos passos:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Configurar Evolution API</li>
              <li>• Criar Open Channel</li>
              <li>• Testar conexão</li>
              <li>• Iniciar atendimentos</li>
            </ul>
          </div>
        </div>

        {/* Loading */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-gray-500 text-sm">
          <p>Bridge Bitrix24 ↔ Evolution API</p>
        </footer>
      </div>
    </div>
  );
}
