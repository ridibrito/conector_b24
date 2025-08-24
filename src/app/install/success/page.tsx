export default function InstallSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
        {/* Logo com check */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Título de sucesso */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Instalação Concluída!
        </h1>

        {/* Mensagem */}
        <p className="text-lg text-gray-600 mb-8">
          O Bridge WhatsApp foi instalado com sucesso no seu portal Bitrix24
        </p>

        {/* Status de sucesso */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
            <span className="text-green-800 font-semibold">Conectado com Sucesso</span>
          </div>
          <p className="text-green-700 text-sm">
            O conector personalizado está ativo e pronto para receber mensagens do WhatsApp
          </p>
        </div>

        {/* Próximos passos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">Próximos Passos:</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
              <div>
                <p className="text-blue-800 font-medium">Configurar Evolution API</p>
                <p className="text-blue-600 text-sm">Configure o webhook da Evolution para: <code className="bg-blue-100 px-2 py-1 rounded">/api/wa/webhook-in</code></p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
              <div>
                <p className="text-blue-800 font-medium">Criar Open Channel</p>
                <p className="text-blue-600 text-sm">No Contact Center, crie um canal e associe o conector &quot;Evolution WhatsApp&quot;</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
              <div>
                <p className="text-blue-800 font-medium">Testar Conexão</p>
                <p className="text-blue-600 text-sm">Envie uma mensagem do WhatsApp e verifique se aparece no Contact Center</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instrução */}
        <div className="flex justify-center">
          <div className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg">
            Instalação Concluída com Sucesso
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-gray-500 text-sm">
          <p>Bridge Bitrix24 ↔ Evolution API - Instalação Concluída</p>
        </footer>
      </div>
    </div>
  );
}
