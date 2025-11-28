/**
 * Archivo: wallet_connector.js
 * Función robusta para conectar a Klever Wallet,
 * y actualizar la UI de manera consistente.
 */

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 300;

// Elementos de la UI que vamos a controlar (IDs del index.html)
const CONNECT_BUTTON = document.getElementById('connect-wallet-btn');
const STATUS_CARD = document.getElementById('initial-status-card');

/**
 * Función utilitaria para actualizar el estado visual de la tarjeta flotante y el botón.
 * @param {string} title - Título del mensaje.
 * @param {string} message - Cuerpo del mensaje.
 * @param {string} type - 'info', 'success', 'error'.
 * @param {string | null} address - Dirección de la billetera si la conexión es exitosa.
 */
function updateUI(title, message, type, address = null) {
    if (STATUS_CARD) {
        // 1. Actualizar la tarjeta flotante
        STATUS_CARD.innerHTML = `
            <h2 class="h5 mb-3 text-gradient text-${type === 'success' ? 'success' : 'dark'}">
                ${title}
            </h2>
            <p class="text-muted mb-0">
                ${message}
            </p>
        `;
    }
    
    if (CONNECT_BUTTON) {
        // 2. Actualizar el botón
        if (type === 'success' && address) {
            const shortAddress = `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
            CONNECT_BUTTON.innerHTML = `<i class="fas fa-check-circle me-1"></i> ${shortAddress}`;
            CONNECT_BUTTON.classList.remove('bg-gradient-success');
            CONNECT_BUTTON.classList.add('bg-gradient-dark'); // Se pone oscuro al estar conectado
            CONNECT_BUTTON.disabled = true;
        } else if (type === 'error') {
            CONNECT_BUTTON.innerHTML = `<i class="fas fa-wallet me-1"></i> Error al Conectar`;
            CONNECT_BUTTON.classList.remove('bg-gradient-dark');
            CONNECT_BUTTON.classList.add('bg-gradient-danger'); // Usa danger para errores
            CONNECT_BUTTON.disabled = false;
        } else {
            // Estado inicial/información
            CONNECT_BUTTON.innerHTML = `<i class="fas fa-wallet me-1"></i> Conectar Wallet`;
            CONNECT_BUTTON.classList.remove('bg-gradient-dark', 'bg-gradient-danger');
            CONNECT_BUTTON.classList.add('bg-gradient-success');
            CONNECT_BUTTON.disabled = false;
        }
    }
}


/**
 * Espera de forma asíncrona hasta que window.kleverWeb esté disponible.
 */
async function waitForKleverWeb() {
    for (let i = 0; i < MAX_RETRIES; i++) {
        if (window.kleverWeb && typeof window.kleverWeb.getAccounts === 'function') {
            console.log('[KleverChain] Extensión Klever detectada y método getAccounts listo.');
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
    console.warn('[KleverChain] La extensión Klever no fue detectada o no cargó completamente.');
    return false;
}

/**
 * Intenta conectar a la Klever Wallet.
 */
async function connectWallet() {
    if (!CONNECT_BUTTON) return;
    
    CONNECT_BUTTON.disabled = true;

    try {
        updateUI('Verificando Conexión', 'Esperando respuesta de la extensión Klever Wallet.', 'info');

        // 1. Verificar y esperar por el objeto kleverWeb y el método
        if (!await waitForKleverWeb()) {
            throw new Error("Extensión Klever Wallet no detectada. Por favor, asegúrate de que esté instalada y activa.");
        }

        // 2. Llamar al método getAccounts
        const accounts = await window.kleverWeb.getAccounts();

        if (accounts && accounts.length > 0) {
            const walletAddress = accounts[0].address;
            
            // 3. Notificar al backend sobre la conexión exitosa (opcional)
            fetch('/api/user/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: walletAddress })
            }).then(response => {
                if (response.ok) {
                    console.log("Dirección de Wallet enviada al servidor.");
                }
            }).catch(e => console.error("Error al enviar la dirección al servidor:", e));


            // 4. Actualizar la UI a estado de éxito
            updateUI(
                '¡Conexión Exitosa!',
                `Wallet conectada: ${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}. ¡Ya puedes interactuar con los proyectos!`,
                'success',
                walletAddress
            );

        } else {
            // Conexión rechazada o cancelada
            updateUI(
                'Conexión Rechazada', 
                'No se seleccionó ninguna cuenta o la conexión fue cancelada por el usuario.', 
                'error'
            );
            CONNECT_BUTTON.disabled = false; // Re-habilitar
        }

    } catch (error) {
        // Capturar cualquier error inesperado
        console.error('[KleverChain] Error al conectar la Wallet:', error);
        updateUI(
            'Error Grave', 
            `Ocurrió un error: ${error.message}. Asegúrate de que la extensión esté desbloqueada.`, 
            'error'
        );
        CONNECT_BUTTON.disabled = false; // Re-habilitar
    }
}

// Configurar el listener para el botón al cargar la ventana
window.onload = function() {
    if (CONNECT_BUTTON) {
        CONNECT_BUTTON.addEventListener('click', connectWallet);
        // Establecer el estado inicial en la tarjeta
        updateUI('Integración de Billetera Exitosa', 'La lógica de conexión está cargada. Haz clic en el botón "Conectar Wallet" en la barra superior.', 'info');
    } else {
        console.error("Botón 'connect-wallet-btn' no encontrado.");
    }
};
