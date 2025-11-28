/**
 * Módulo de conexión para Klever Wallet.
 * * Gestiona la detección de la extensión, la conexión inicial y
 * la actualización del estado del botón de conexión.
 */

const MAX_RETRIES = 5; 
const RETRY_DELAY_MS = 300;
const WALLET_CONNECTED_CLASS = 'wallet-connected'; // Clase CSS para indicar estado conectado
const BACKEND_CONNECT_URL = '/api/user/connect'; // Ruta de Flask para recibir la dirección

/**
 * Envía la dirección de la billetera al backend de Flask.
 * @param {string} address La dirección de la billetera Klever.
 */
async function sendAddressToBackend(address) {
    try {
        console.log(`[Backend] Enviando dirección ${address} a Flask...`);
        
        const response = await fetch(BACKEND_CONNECT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: address })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('[Backend] Respuesta exitosa:', result.message);
            // Aquí podrías actualizar la UI con datos cargados del usuario
        } else {
            console.error('[Backend] Error del servidor:', result.message);
        }

    } catch (error) {
        console.error('[Backend] Fallo al comunicarse con el servidor:', error);
    }
}


/**
 * Función robusta para esperar que el objeto kleverWeb esté disponible.
 * @returns {Promise<boolean>} True si el objeto fue detectado, False en caso contrario.
 */
async function waitForKleverWebObject() {
    for (let i = 0; i < MAX_RETRIES; i++) {
        if (window.kleverWeb) {
            console.log('[KleverChain] Extensión Klever detectada.');
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
    console.warn('[KleverChain] Extensión Klever no detectada tras el límite de tiempo.');
    return false;
}

/**
 * Actualiza la UI del botón para mostrar el estado actual de la billetera.
 * @param {string | null} address La dirección de la billetera o null si no está conectado.
 * @param {HTMLElement} connectButton El elemento del botón.
 */
function updateButtonUI(address, connectButton) {
    if (address) {
        const shortAddress = `${address.substring(0, 8)}...${address.substring(address.length - 4)}`;
        connectButton.textContent = shortAddress;
        connectButton.classList.add(WALLET_CONNECTED_CLASS, 'bg-gradient-success'); // Clases de estado conectado
        connectButton.classList.remove('bg-gradient-info'); // Clase de estado desconectado
        connectButton.disabled = true; // Deshabilitar después de la conexión exitosa
        console.log('[KleverChain] UI actualizada a estado conectado.');
    } else {
        connectButton.textContent = 'Conectar Wallet';
        connectButton.classList.remove(WALLET_CONNECTED_CLASS, 'bg-gradient-success');
        connectButton.classList.add('bg-gradient-info');
        connectButton.disabled = false;
        console.log('[KleverChain] UI actualizada a estado desconectado.');
    }
}

/**
 * Intenta conectar a la Klever Wallet y gestiona los estados de la UI.
 */
async function connectKleverWallet() {
    const connectButton = document.getElementById('connect-wallet-btn');
    if (!connectButton || connectButton.disabled) return;

    // Temporalmente deshabilitar el botón y cambiar texto
    const originalText = connectButton.textContent;
    connectButton.disabled = true;
    connectButton.textContent = 'Conectando...';

    try {
        // 1. Verificar si el objeto existe
        if (!await waitForKleverWebObject()) {
            throw new Error("Klever Extension not found. Por favor, asegúrate de que esté instalada y desbloqueada.");
        }

        // 2. Ejecutar la inicialización (esto abre el pop-up)
        console.log('Solicitando inicialización de Klever Wallet...');
        await window.kleverWeb.initialize();

        // 3. Obtener la dirección
        const address = window.kleverWeb.getWalletAddress();
        
        if (!address) {
            throw new Error("Dirección no recuperada. Conexión rechazada o fallo.");
        }
        
        // 4. Conexión exitosa del frontend
        updateButtonUI(address, connectButton);
        console.log('[KleverChain] Conexión exitosa. Dirección:', address);
        
        // 5. ENVIAR DIRECCIÓN AL BACKEND DE FLASK
        await sendAddressToBackend(address);

    } catch (error) {
        // Fallo en la conexión
        let errorMessage = error.message || "Error desconocido.";
        console.error('[KleverChain] Error al conectar la Wallet:', error);
        
        // Restaurar botón
        connectButton.disabled = false;
        connectButton.textContent = originalText;
        // Mostrar error en la consola
        console.error(`Error al conectar la Wallet: ${errorMessage}`); 
    }
}

// Configurar el listener para el botón al cargar la ventana
window.onload = function() {
    const connectButton = document.getElementById('connect-wallet-btn');
    if (connectButton) {
        // Asignar el listener al clic
        connectButton.addEventListener('click', connectKleverWallet);
        console.log("Listener de conexión asignado al botón.");

    } else {
        console.warn("Botón 'connect-wallet-btn' no encontrado. Asegúrate de que el ID esté en templates/sections/header.html.");
    }
};

// Exponer la función para que pueda ser llamada globalmente si es necesario
window.connectKleverWallet = connectKleverWallet;
