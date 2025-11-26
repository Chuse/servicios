import requests
import json
import os
from flask import Flask, jsonify, request, render_template

# Inicialización de la aplicación Flask
app = Flask(__name__)

# --- CONFIGURACIÓN DE LA API DE KLEVER ---
KLEVER_SFT_ASSET_URL = "https://api.testnet.klever.org/v1.0/assets/sft/"
DEFAULT_ASSET_ID = "PUKR-30R2/1" 


# --- LÓGICA DE LECTURA DE METADATA DESDE KLEVER CHAIN ---

def get_project_metadata(asset_id: str):
    """
    Consulta la API de Klever para obtener la metadata del SFT.
    Extrae la cadena JSON de los atributos y la parsea.
    """
    full_url = KLEVER_SFT_ASSET_URL + asset_id
    
    try:
        response = requests.get(full_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Navegación profunda para encontrar la cadena de metadata
        attributes_string = data.get('data', {}).get('asset', {}).get('meta', {}).get('metadata', {}).get('attributes', None)
        
        if not attributes_string:
            return None, "Metadata not found or asset ID is incorrect."

        # Parsear la cadena JSON a un objeto Python
        project_config = json.loads(attributes_string)
        return project_config, None
        
    except requests.exceptions.HTTPError as e:
        return None, f"HTTP Error: Asset not found or API error ({response.status_code})"
    except json.JSONDecodeError:
        return None, "Critical Error: Metadata is not a valid JSON string in the asset's attributes."
    except requests.exceptions.RequestException as e:
        return None, f"Connection Error: Could not connect to Klever API ({e})"
    except Exception as e:
        return None, f"Unexpected Error: {e}"


# =================================================================
# 1. RUTAS DEL FRONTEND (SIRVE ARCHIVOS HTML)
# =================================================================

@app.route('/')
def index():
    # Carga la página principal que lista los proyectos
    return render_template('index.html')

@app.route('/proyecto')
def project_detail():
    # Carga la página de detalle del proyecto
    return render_template('proyecto.html')

@app.route('/dashboard')
def user_dashboard():
    # Carga el Dashboard de usuario y sus recibos SFT
    return render_template('dashboard.html')
    
@app.route('/configuracion')
def user_configuration():
    # Carga la página de configuración de alias/nombre
    return render_template('configuracion.html')


# =================================================================
# 2. RUTAS DE LA API (ENDPOINTs DE DATOS)
# =================================================================

@app.route('/api/project', methods=['GET'])
def project_api():
    """Endpoint para obtener la metadata de un proyecto SFT."""
    asset_id = request.args.get('id', DEFAULT_ASSET_ID)
    metadata, error = get_project_metadata(asset_id)
    
    if error:
        return jsonify({"success": False, "error": error}), 404 if "not found" in error else 500
    
    return jsonify({"success": True, "data": metadata})


# =================================================================
# 3. EJECUCIÓN
# =================================================================

if __name__ == '__main__':
    # Ejecuta el servidor en modo debug
    app.run(debug=True, port=5000)
