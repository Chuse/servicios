import requests
import json
import os
from flask import Flask, jsonify, request
# No necesitamos base64, ya que el último error demostró que la metadata no estaba codificada.

app = Flask(__name__)

# --- CONFIGURACIÓN DE LA API DE KLEVER ---
# Usamos el endpoint definitivo de Testnet que validamos
KLEVER_SFT_ASSET_URL = "https://api.testnet.klever.org/v1.0/assets/sft/"
# Asignamos un ID por defecto para pruebas si no se proporciona uno en la URL
DEFAULT_ASSET_ID = "PUKR-30R2/1" 

def get_project_metadata(asset_id: str):
    """
    Consulta la API de Klever Chain para un activo SFT específico, extrae el 
    JSON de configuración y lo devuelve como objeto Python.
    """
    full_url = KLEVER_SFT_ASSET_URL + asset_id
    
    try:
        response = requests.get(full_url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # 1. Extraer la cadena JSON (el campo 'attributes' de la metadata)
        # Ruta validada: data -> asset -> meta -> metadata -> attributes
        attributes_string = data.get('data', {}).get('asset', {}).get('meta', {}).get('metadata', {}).get('attributes', None)
        
        if not attributes_string:
            # Si no se encuentra la metadata, se devuelve un error específico
            return None, "Metadata not found or asset ID is incorrect."

        # 2. Parsear la cadena extraída como JSON
        project_config = json.loads(attributes_string)
        
        return project_config, None
        
    except requests.exceptions.HTTPError as e:
        return None, f"HTTP Error: Asset not found or API error ({response.status_code})"
    except json.JSONDecodeError:
        return None, "Critical Error: Metadata is not a valid JSON string."
    except requests.exceptions.RequestException as e:
        return None, f"Connection Error: Could not connect to Klever API ({e})"
    except Exception as e:
        return None, f"Unexpected Error: {e}"


# --- ENDPOINT DE LA API PARA EL FRONTEND ---

@app.route('/api/project', methods=['GET'])
def project_api():
    """
    Endpoint principal para que el frontend obtenga los datos de un proyecto.
    Uso: /api/project?id=PUKR-30R2/1
    """
    # 1. Obtener el ID del activo de los parámetros de la URL
    asset_id = request.args.get('id', DEFAULT_ASSET_ID)
    
    # 2. Llamar a la lógica de la blockchain
    metadata, error = get_project_metadata(asset_id)
    
    # 3. Formatear la respuesta
    if error:
        # Devolver el error 500 (Server Error) o 404 si el activo no existe
        status_code = 500
        if "not found" in error:
            status_code = 404
        
        return jsonify({"success": False, "error": error}), status_code
    
    # Devolver el JSON limpio al frontend
    return jsonify({"success": True, "data": metadata})


# --- Ejecución Local ---
if __name__ == '__main__':
    # Usar el puerto 5000 para pruebas locales
    app.run(debug=True, port=5000)
