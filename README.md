# Entorno Telachoco - Juego con reconocimiento de gestos

Este proyecto es un juego que se controla mediante gestos de mano, combinando tecnologías de visión por computadora y WebVR.

## Estructura del Proyecto

El proyecto está organizado en dos componentes principales:

### 1. Hand Tracking (`/hand-tracking`)
Sistema de reconocimiento de gestos de mano que incluye:
- `generate_left_hand_gestures.py`: Generación de datos para gestos de mano izquierda
- `gestures_recognizer_ml.py`: Reconocimiento de gestos mediante machine learning
- `learn_gestures_ml.py`: Entrenamiento del modelo de reconocimiento
- `train_gestures.py`: Script para entrenamiento de gestos
- `gestures/`: Directorio con datos de gestos entrenados

### 2. Servidor Web (`/server`)
Aplicación web que implementa el juego en VR:
- Servidor Flask (`server.py`)
- Interfaz web con A-Frame para VR
- Assets estáticos (imágenes, sonidos, estilos)

## Requisitos

1. Python 3.x
2. Navegador web moderno con soporte para WebVR
3. Cámara web para el tracking de manos

## Instalación
IMPORTANTE: El entorno virtual debe estar en la versión 3.11.9 de python.
1. Clona el repositorio:
```bash
git clone [URL-del-repositorio]
cd EntornoTelachoco
```

2. Instala las dependencias de Python:
```bash
pip install -r hand-tracking/requeriments.txt
```

3. Inicia el servidor:
```bash
cd server
python server.py
```

4. Abre tu navegador y accede al puerto que aparezca en la terminal:
```
Ej: http://localhost:5000
```

## Características

- Reconocimiento de gestos de mano en tiempo real
- Entorno VR interactivo usando A-Frame
- Interfaz de usuario intuitiva
- Sistema de juego basado en gestos
- Múltiples niveles y desafíos

## Desarrollo

### Entrenamiento de Nuevos Gestos

Para entrenar nuevos gestos:
1. Ejecuta `generate_left_hand_gestures.py` para capturar nuevos datos
2. Utiliza `train_gestures.py` para entrenar el modelo
3. El modelo entrenado se guardará en el directorio `gestures/`

### Modificación del Juego

- Los archivos JavaScript en `server/static/js/` controlan la lógica del juego
- Los assets visuales se encuentran en `server/static/sprites/`
- Las plantillas HTML están en `server/templates/`

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

## Licencia

Este proyecto está bajo Licencia

## Contacto

Rodrigo Caminero - rodca004@gmail.com
Rodrigo Moreno - Tutifrutihd4@gmail.com/rodrigojugon@gmail.com
