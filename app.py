import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Configuración básica (si la necesitas)
# app.config.from_object('config.DevelopmentConfig')

@app.route('/')
def index():
    """Ruta principal que carga el index.html."""
    return render_template('index.html')

@app.route('/ranking')
def ranking():
    """Ruta de ejemplo para Ranking."""
    return "Página de Ranking"

@app.route('/swap')
def swap():
    """Ruta de ejemplo para Swap."""
    return "Página de Intercambio"

@app.route('/dashboard')
def dashboard():
    """Ruta de ejemplo para Dashboard."""
    return "Página de Dashboard"

@app.route('/api/user/connect', methods=['POST'])
def handle_wallet_connect():
    """
    Ruta API que recibe la dirección de la billetera del frontend (JS)
    y la guarda o la procesa.
    """
    if request.method == 'POST':
        try:
            data = request.get_json()
            wallet_address = data.get('address')
            
            if not wallet_address:
                return jsonify({"status": "error", "message": "Dirección no proporcionada."}), 400
            
            # --- LÓGICA DE BACKEND AQUÍ ---
            # En un entorno real, aquí guardarías la dirección en una sesión
            # o base de datos. Por ahora, solo la imprimiremos.
            print(f"Billetera conectada exitosamente: {wallet_address}")
            
            return jsonify({
                "status": "success",
                "message": "Dirección recibida y procesada.",
                "address": wallet_address
            }), 200
            
        except Exception as e:
            print(f"Error al procesar la conexión de la billetera: {e}")
            return jsonify({"status": "error", "message": "Error interno del servidor."}), 500

if __name__ == '__main__':
    # Configurar puerto para Render
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
