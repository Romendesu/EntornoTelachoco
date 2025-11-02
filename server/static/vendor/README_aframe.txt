Instrucciones para añadir aframe.min.js localmente

Si tu navegador o red bloquea la carga desde el CDN, descarga una copia de A-Frame y colócala en:

    server/static/vendor/aframe.min.js

Opciones para descargar (PowerShell):

1) Usando Invoke-WebRequest (PowerShell):

Invoke-WebRequest -Uri "https://aframe.io/releases/1.5.0/aframe.min.js" -OutFile "c:\\Users\\rodri\\Desktop\\reconocimientoPython\\server\\static\\vendor\\aframe.min.js"

2) Descargar manualmente desde el navegador y guardar el archivo con ese nombre en la carpeta indicada.

Después de colocar el archivo, recarga la página del minijuego; el cargador intentará usar la copia local si el CDN falla.

Notas:
- El fichero aframe.min.js es relativamente grande (~300KB+). Añadirlo al repositorio aumentará su tamaño.
- Si prefieres que lo añada yo al repositorio, indícamelo y lo incluiré (ten en cuenta que el repo crecerá en tamaño).