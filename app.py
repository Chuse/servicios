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
    # Usará base.html si existe templates/ranking.html que lo extiende
    return render_template('ranking.html')

@app.route('/swap')
def swap():
    """Ruta de Intercambio/Donación (Ahora usa la plantilla Jinja)."""
    # Renderiza la nueva plantilla que extiende base.html
    return render_template('swap.html')

@app.route('/dashboard')
def dashboard():
    """Ruta de ejemplo para Dashboard."""
    # Usará base.html si existe templates/dashboard.html que lo extiende
    return render_template('dashboard.html')

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
            # 1. Guardar la dirección en una sesión o base de datos.
            # 2. Cargar datos del usuario relacionados con esta dirección.
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
