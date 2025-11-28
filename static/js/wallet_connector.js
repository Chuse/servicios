// URL de la API de KleverChain para la interacción con la Wallet
const KLEVER_CHAIN_API = 'https://api.klever.io/v1/klever-wallet';

// Función para inicializar y buscar el botón al cargar la página
window.onload = function() {
    console.log("Wallet Connector script loaded.");
    // Esto resuelve el error "Botón 'connect-wallet-btn' no encontrado" (si el HTML se actualiza)
    const connectButton = document.getElementById('connect-wallet-btn');
    if (!connectButton) {
        console.error("Botón 'connect-wallet-btn' no encontrado. Asegúrate de que el ID esté en el HTML.");
    }
};

/**
 * Muestra mensajes de estado al usuario, actualizando el contenido de la tarjeta de estado.
 * @param {string} title - Título del mensaje.
 * @param {string} message - Cuerpo del mensaje.
 * @param {string} color - Clase de color para el título (ej: 'text-success', 'text-danger').
 */
function updateStatusCard(title, message, color = 'text-muted') {
    const card = document.querySelector('.container.mt-n6 .card');
    if (card) {
        card.innerHTML = `
            <h2 class="h5 mb-3 ${color}">${title}</h2>
            <p class="text-muted mb-0">${message}</p>
        `;
    }
}

/**
 * Función principal para iniciar la conexión con Klever Wallet.
 *
 * ¡ATENCIÓN! La presencia de esta función en este archivo
 * resuelve el error "Uncaught ReferenceError: connectWallet is not defined"
 */
function connectWallet() {
    updateStatusCard("Conectando...", "Por favor, abre tu Klever Wallet para aprobar la conexión.", 'text-info');
    
    // Simulación de la solicitud de conexión a Klever Wallet
    console.log("Iniciando solicitud de conexión a Klever Wallet...");

    // Simulación de resultado asíncrono
    setTimeout(() => {
        const simulatedAddress = 'klv1...f4g5j6'; // Dirección simulada

        if (simulatedAddress) {
            updateStatusCard(
                "¡Conexión Exitosa!",
                `Wallet conectada: ${simulatedAddress.substring(0, 8)}...${simulatedAddress.slice(-6)}. Ahora puedes interactuar con los proyectos.`,
                'text-success'
            );
            
            // Opcional: Actualizar el botón superior
            const connectButton = document.getElementById('connect-wallet-btn');
            if (connectButton) {
                connectButton.textContent = 'Wallet Conectada';
                connectButton.classList.remove('bg-gradient-success');
                connectButton.classList.add('bg-gradient-dark');
                connectButton.onclick = () => showWalletDetails(simulatedAddress);
            }

        } else {
            updateStatusCard(
                "Error de Conexión",
                "No se pudo conectar a Klever Wallet. Asegúrate de tener la aplicación instalada y de que la solicitud no haya expirado.",
                'text-danger'
            );
        }
    }, 3000); // Simula un retraso de 3 segundos para la conexión
}

/**
 * Muestra una alerta simple con la dirección de la wallet.
 * @param {string} address - La dirección de la wallet.
 */
function showWalletDetails(address) {
    updateStatusCard(
        "Detalles de la Wallet",
        `Dirección: ${address}. Estado: Activa y lista.`,
        'text-primary'
    );
}
