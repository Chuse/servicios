import React, { useState, useEffect, useCallback } from 'react';
import {
  HeartHandshake, Wallet, Info, CheckCircle, AlertTriangle, ArrowRight, Leaf, GraduationCap, Loader2
} from 'lucide-react';

// --- Configuración de Colores y Constantes ---
const KLV_COLORS = {
  green: '#00B894',
  dark: '#1C1C1C',
  blue: '#2152ff',
  // Definiciones de Tailwind (necesarias para evitar clases dinámicas no detectadas)
  // Nota: Tailwind necesita ver estas clases completas para generarlas.
  blueText: 'text-[#2152ff]',
  blueBorder: 'border-[#2152ff]',
  blueBg: 'bg-[#2152ff]',
  blueHover: 'hover:bg-[#2152ff]/90',
  darkBg: 'bg-[#1C1C1C]',
  darkHover: 'hover:bg-[#1C1C1C]/80',
  greenBg: 'bg-[#00B894]',
  greenText: 'text-[#00B894]',
};

const MAX_RETRIES = 15;
const RETRY_DELAY_MS = 250;
const BOOTSTRAP_DELAY_MS = 1000;

// --- Componentes Reutilizables ---

/**
 * Hook personalizado para manejar la lógica de conexión de la Klever Wallet.
 */
const useWalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    title: 'Listo para Conectar',
    message: 'Haz clic en "Conectar Wallet" para buscar la extensión Klever.',
    type: 'info', // 'info', 'success', 'error'
  });
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setConnectionStatus({
      title: 'Buscando Extensión',
      message: 'Buscando Klever Wallet. Puede tomar un momento...',
      type: 'info',
    });

    try {
      // Función para esperar a que window.kleverWeb esté disponible
      const waitForKleverWeb = async () => {
        await new Promise(resolve => setTimeout(resolve, BOOTSTRAP_DELAY_MS));
        for (let i = 0; i < MAX_RETRIES; i++) {
          if (window.kleverWeb && typeof window.kleverWeb.getAccounts === 'function') {
            console.log(`[KleverChain] Extensión detectada en el intento ${i + 1}.`);
            return true;
          }
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
        console.error('[KleverChain] ERROR CRÍTICO: La extensión Klever no fue detectada.');
        return false;
      };

      if (!(await waitForKleverWeb())) {
        throw new Error("Extensión Klever Wallet no detectada. Por favor, asegúrate de que esté instalada, activa y la página se haya recargado.");
      }

      setConnectionStatus({
        title: 'Solicitando Conexión',
        message: 'Por favor, aprueba la conexión en la ventana emergente de Klever Wallet.',
        type: 'info',
      });

      const accounts = await window.kleverWeb.getAccounts();

      if (accounts && accounts.length > 0) {
        const address = accounts[0].address;
        setWalletAddress(address);

        // Notificar al "servidor" (simulación)
        fetch('/api/user/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address })
        }).catch(e => console.error("Error al comunicarse con el servidor (simulación):", e));

        setConnectionStatus({
          title: '¡Conexión Exitosa!',
          message: 'Dirección conectada.',
          type: 'success',
        });
      } else {
        setConnectionStatus({
          title: 'Conexión Rechazada',
          message: 'El usuario canceló la solicitud o no seleccionó una cuenta.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('[KleverChain] Error al conectar la Wallet:', error);
      const displayMessage = error.message.includes('Extensión Klever Wallet no detectada')
        ? 'No se pudo encontrar la extensión. Verifica si está instalada y vuelve a cargar la página.'
        : `Ocurrió un error inesperado. Mensaje: ${error.message}`;

      setConnectionStatus({
        title: 'Fallo de Conexión',
        message: displayMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { walletAddress, connectionStatus, connectWallet, isLoading };
};

/**
 * Componente Header (Cabecera)
 */
const Header = ({ walletAddress, connectWallet, isLoading }) => {
  const shortAddress = walletAddress ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}` : null;

  const buttonStyle = walletAddress
    ? `${KLV_COLORS.darkBg} ${KLV_COLORS.darkHover}`
    : `${KLV_COLORS.blueBg} ${KLV_COLORS.blueHover}`;

  const buttonContent = walletAddress ? (
    <>
      <CheckCircle size={16} className="mr-2" /> {shortAddress}
    </>
  ) : (
    <>
      <Wallet size={16} className="mr-2" /> Conectar Wallet
    </>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Sección Izquierda: Logo y Enlaces */}
          <div className="flex items-center">
            {/* LOGO BASADO EN ICONO */}
            <div className="flex-shrink-0 flex items-center mr-6">
              <HeartHandshake size={24} className={KLV_COLORS.blueText} />
              <span className={`ml-2 text-xl font-extrabold text-${KLV_COLORS.dark}`}>GlobalGive.io</span>
            </div>

            {/* Enlaces de Navegación */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* CORREGIDO: Usar href="#" en lugar de href="javascript:;" */}
              <a href="#" className={`text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 ${KLV_COLORS.blueBorder} text-sm font-medium`}>
                Inicio
              </a>
              <a href="#ranking" className="text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                Ranking
              </a>
              <a href="#swap" className="text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                Intercambiar
              </a>
              <a href="#dashboard" className="text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                Dashboard
              </a>
            </div>
          </div>

          {/* Sección Derecha: Idiomas y Botón de Wallet */}
          <div className="flex items-center space-x-6">
            {/* Códigos de Idioma */}
            <div className="flex items-center space-x-3 text-xs sm:text-sm">
              <a href="?lang=es" title="Español" className={`${KLV_COLORS.blueText} hover:text-gray-700 font-semibold transition duration-150`}>ES</a>
              <a href="?lang=en" title="English" className={`${KLV_COLORS.blueText} hover:text-gray-700 font-semibold transition duration-150`}>GB</a>
              <a href="?lang=pt" title="Português" className={`${KLV_COLORS.blueText} hover:text-gray-700 font-semibold transition duration-150`}>PT</a>
              <a href="?lang=uk" title="Українська" className={`${KLV_COLORS.blueText} hover:text-gray-700 font-semibold transition duration-150`}>UA</a>
            </div>

            {/* Botón Conectar Wallet */}
            <button
              onClick={walletAddress ? null : connectWallet}
              disabled={walletAddress || isLoading}
              className={`px-4 py-2 text-sm font-semibold rounded-lg text-white ${buttonStyle} shadow-lg transition duration-150 ease-in-out flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                // Usamos el icono Loader2 de Lucide para un spinner nativo de React
                <Loader2 size={16} className="animate-spin -ml-1 mr-3 text-white" />
              ) : (
                buttonContent
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

/**
 * Componente de la Tarjeta de Estado de Conexión
 */
const StatusCard = ({ status, walletAddress }) => {
  let IconComponent = Info;
  let borderColor = `border-klv-blue`;
  let iconColor = KLV_COLORS.blue;

  if (status.type === 'success') {
    IconComponent = CheckCircle;
    borderColor = `border-klv-green`;
    iconColor = KLV_COLORS.green;
  } else if (status.type === 'error') {
    IconComponent = AlertTriangle;
    borderColor = `border-red-600`;
    iconColor = '#DC2626'; // Red-600
  }

  // Modificación para asegurar que Tailwind detecte los colores definidos en KLV_COLORS
  const cardBorderClass = status.type === 'success' ? 'border-klv-green' : (status.type === 'error' ? 'border-red-600' : 'border-klv-blue');
  const iconColorClass = status.type === 'success' ? KLV_COLORS.greenText : (status.type === 'error' ? 'text-red-600' : KLV_COLORS.blueText);


  return (
    <div className={`mb-12 mx-4 p-5 sm:p-6 bg-white rounded-xl shadow-xl border-t-4 ${cardBorderClass} transition duration-300 ease-in-out`}>
      <div className="flex items-center space-x-4">
        <IconComponent size={24} className={iconColorClass} />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{status.title}</h2>
          <p className="text-gray-500">{status.message}</p>
          {walletAddress && (
            <p className="mt-1 text-sm font-semibold text-gray-700">Dirección: {walletAddress}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de Contenido de Proyecto/Tarjeta Individual
 */
const ProjectCard = ({ title, description, icon: Icon, iconColor, linkText, linkColor }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden">
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className={`bg-${iconColor}/10 text-${iconColor} p-3 rounded-full mr-4`}>
          <Icon size={20} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      {/* CORREGIDO: Usar href="#" en lugar de href="javascript:;" */}
      <a href="#" className={`text-sm font-medium text-${linkColor} hover:text-${linkColor}/80 flex items-center`}>
        {linkText} <ArrowRight size={12} className="ml-2" />
      </a>
    </div>
  </div>
);


/**
 * Componente del Contenido de la Página de Inicio (Home)
 */
const HomeContent = () => (
  <>
    {/* Bloque Hero/Título Principal */}
    <div className="text-center mb-12 px-4">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
        Proyectos de Transparencia Global
      </h1>
      <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
        Explora y financia proyectos auditables en tiempo real en KleverChain.
      </p>
    </div>

    {/* CUADRÍCULA DE PROYECTOS */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
      
      <ProjectCard 
        title="Caridad y Ayuda Humanitaria"
        description="Dona a causas verificadas. Cada KLV gastado es rastreado en tiempo real, garantizando el 100% de transparencia."
        icon={HeartHandshake}
        iconColor="klv-blue"
        linkText="Ver Proyectos"
        linkColor="klv-blue"
      />
      
      <ProjectCard 
        title="Inversiones de Impacto Ambiental"
        description="Invierte en proyectos de desarrollo sostenible con rendimientos auditables y transparentes. Triple impacto positivo."
        icon={Leaf}
        iconColor="klv-green"
        linkText="Ver Proyectos"
        linkColor="klv-green"
      />
      
      <ProjectCard 
        title="Desarrollo Tecnológico y Educativo"
        description="Financia programas de educación en blockchain y tecnología. Creando la próxima generación de desarrolladores."
        icon={GraduationCap}
        iconColor="indigo-500" // Usando un color estándar de Tailwind
        linkText="Ver Proyectos"
        linkColor="indigo-500"
      />
    </div>

    {/* Botón de Call to Action Final */}
    <div className="text-center mt-16 px-4">
      {/* CORREGIDO: Usar href="#" en lugar de href="javascript:;" */}
      <a href="#" className={`inline-block px-8 py-3 text-lg font-bold text-white ${KLV_COLORS.blueBg} rounded-xl shadow-xl ${KLV_COLORS.blueHover} transition duration-300 transform hover:scale-105`}>
        Ver Todos los Proyectos
      </a>
    </div>
  </>
);

/**
 * Componente Footer (Pie de Página)
 */
const Footer = () => (
  <footer className="mt-20 py-8 bg-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p className="text-sm text-gray-400">© {new Date().getFullYear()} GlobalGive.io. Desarrollado sobre KleverChain.</p>
    </div>
  </footer>
);

/**
 * Componente Principal de la Aplicación
 */
const App = () => {
  const { walletAddress, connectionStatus, connectWallet, isLoading } = useWalletConnection();
  
  // En un entorno de producción, aquí se manejaría la navegación (e.g., con un router)
  const currentPage = 'home'; 

  return (
    <div className="bg-gray-50 font-sans antialiased min-h-screen flex flex-col">
      {/* 1. Cabecera (Encapsulada y Reutilizable) */}
      <Header
        walletAddress={walletAddress}
        connectWallet={connectWallet}
        isLoading={isLoading}
      />

      {/* 2. Contenido Principal */}
      <main className="py-10 flex-grow">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          
          {/* Tarjeta de Estado (Muestra el estado de la conexión) */}
          <StatusCard status={connectionStatus} walletAddress={walletAddress} />
          
          {/* Contenido de la Página Actual */}
          {currentPage === 'home' && <HomeContent />}
          
        </div>
      </main>

      {/* 3. Footer (Encapsulado y Reutilizable) */}
      <Footer />
    </div>
  );
};

export default App;
