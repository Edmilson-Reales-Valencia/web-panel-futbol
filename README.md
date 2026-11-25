# Panel de posiciones de fútbol

Aplicación web para registrar resultados y consultar la clasificación de seis equipos. La interfaz está desarrollada con React y Vite; un servidor API hecho con Node.js y Express entrega los equipos y administra los partidos.

## Requisitos

- Node.js instalado.
- npm, incluido con Node.js.

## Instalación

Abre una terminal en la carpeta principal del proyecto y ejecuta:

```powershell
npm.cmd install
```

## Ejecución

Se necesitan dos terminales de VS Code abiertas en la carpeta principal del proyecto.

En la primera, inicia la API:

```powershell
npm.cmd run dev:api
```

La API estará disponible en `http://localhost:3000`.

En la segunda, inicia la aplicación web:

```powershell
npm.cmd run dev
```

Abre en el navegador la dirección que Vite muestre en la terminal, normalmente `http://localhost:5173`.

Mantén ambas terminales abiertas mientras usas la aplicación.

## Funciones

- Consulta los equipos y la clasificación desde la API.
- Registra partidos con equipo local, equipo visitante y marcador.
- Impide enfrentar un equipo contra sí mismo.
- Valida que los goles sean enteros iguales o mayores que cero.
- Calcula partidos jugados, ganados, empatados y perdidos; goles a favor y en contra; diferencia de gol y puntos.
- Ordena la tabla por puntos, diferencia de gol y goles a favor.
- Muestra los últimos cinco resultados de cada equipo.
- Incluye historial con filtro por equipo y opción para eliminar partidos.
- Se adapta a pantallas pequeñas.

## Rutas de la API

| Método | Ruta | Función |
| --- | --- | --- |
| GET | `/api` | Comprueba que la API esté activa. |
| GET | `/api/equipos` | Devuelve los equipos. |
| GET | `/api/partidos` | Devuelve los partidos registrados. |
| GET | `/api/partidos?equipoId=1` | Devuelve los partidos de un equipo. |
| POST | `/api/partidos` | Registra un partido. |
| DELETE | `/api/partidos/:id` | Elimina un partido. |
| GET | `/api/tabla` | Devuelve la clasificación calculada. |

## Almacenamiento

Los partidos se guardan en la memoria del servidor, sin base de datos. Se conservan al recargar la página mientras la API siga activa. Al detener o reiniciar el servidor, los partidos se reinician.

## Tecnologías

- React
- JavaScript
- CSS
- Vite
- Node.js
- Express

## Imágenes

Los escudos están en `public/escudos/`. El logo de la liga está en `public/logo-liga.png`.

## Repositorio

[Ver el proyecto en GitHub](https://github.com/Edmilson-Reales-Valencia/web-panel-futbol)