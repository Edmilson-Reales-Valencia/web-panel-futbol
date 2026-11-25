import { useCallback, useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [equipos, setEquipos] = useState([]);
  const [tabla, setTabla] = useState([]);
  const [partidos, setPartidos] = useState([]);

  const [localId, setLocalId] = useState('1');
  const [visitanteId, setVisitanteId] = useState('2');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('todos');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorCarga, setErrorCarga] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorCarga('');

    try {
      const respuestas = await Promise.all([
        fetch(`${API_URL}/equipos`),
        fetch(`${API_URL}/tabla`),
        fetch(`${API_URL}/partidos`),
      ]);

      if (respuestas.some((respuesta) => !respuesta.ok)) {
        throw new Error('La API respondió con un error.');
      }

      const [equiposApi, tablaApi, partidosApi] = await Promise.all(
        respuestas.map((respuesta) => respuesta.json()),
      );

      setEquipos(equiposApi);
      setTabla(tablaApi);
      setPartidos(partidosApi);
    } catch (errorApi) {
      setErrorCarga(
        errorApi.message ||
          'No se pudieron cargar los datos. Comprueba que la API esté activa.',
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  async function registrarPartido(event) {
    event.preventDefault();
    setError('');

    try {
      const respuesta = await fetch(`${API_URL}/partidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localId: Number(localId),
          visitanteId: Number(visitanteId),
          golesLocal,
          golesVisitante,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || 'No se pudo registrar el partido.');
      }

      setGolesLocal('');
      setGolesVisitante('');
      await cargarDatos();
    } catch (errorApi) {
      setError(
        errorApi.message ||
          'No se pudo registrar el partido. Comprueba que la API esté activa.',
      );
    }
  }

  async function eliminarPartido(id) {
    setError('');

    try {
      const respuesta = await fetch(`${API_URL}/partidos/${id}`, {
        method: 'DELETE',
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || 'No se pudo eliminar el partido.');
      }

      await cargarDatos();
    } catch (errorApi) {
      setError(
        errorApi.message ||
          'No se pudo eliminar el partido. Comprueba que la API esté activa.',
      );
    }
  }

  const partidosFiltrados = partidos.filter(
    (partido) =>
      filtroEquipo === 'todos' ||
      String(partido.localId) === filtroEquipo ||
      String(partido.visitanteId) === filtroEquipo,
  );

  return (
    <main className="app">
      <header className="encabezado-liga">
        <img
          className="logo-LaLiga"
          src="/logo-liga.png"
          alt="Logo de la Liga"
        />

        <div>
          <p className="etiqueta">La Liga</p>
          <h1>Posiciones</h1>
          <p>La Liga</p>
        </div>
      </header>

      {errorCarga && (
        <p className="error-validacion" role="alert">
          {errorCarga}
        </p>
      )}

      <section className="registro-partido">
        <h2>Registrar partido</h2>

        <form onSubmit={registrarPartido}>
          <label>
            Equipo local
            <select
              value={localId}
              onChange={(event) => setLocalId(event.target.value)}
              disabled={cargando}
            >
              {equipos
                .filter((equipo) => equipo.id !== Number(visitanteId))
                .map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Goles del local
            <input
              type="number"
              min="0"
              step="1"
              required
              value={golesLocal}
              onChange={(event) => setGolesLocal(event.target.value)}
              disabled={cargando}
            />
          </label>

          <label>
            Equipo visitante
            <select
              value={visitanteId}
              onChange={(event) => setVisitanteId(event.target.value)}
              disabled={cargando}
            >
              {equipos
                .filter((equipo) => equipo.id !== Number(localId))
                .map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Goles del visitante
            <input
              type="number"
              min="0"
              step="1"
              required
              value={golesVisitante}
              onChange={(event) => setGolesVisitante(event.target.value)}
              disabled={cargando}
            />
          </label>

          <button type="submit" disabled={cargando}>
            Guardar resultado
          </button>

          {error && (
            <p className="error-validacion" role="alert">
              {error}
            </p>
          )}
        </form>

        <details className="historial-partidos">
          <summary>Historial de partidos ({partidos.length})</summary>

          <label className="filtro-historial">
            Filtrar por equipo
            <select
              value={filtroEquipo}
              onChange={(event) => setFiltroEquipo(event.target.value)}
              disabled={cargando}
            >
              <option value="todos">Todos</option>
              {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
          </label>

          {partidosFiltrados.length === 0 ? (
            <p>
              {partidos.length === 0
                ? 'Aún no hay partidos registrados.'
                : 'No hay partidos de este equipo.'}
            </p>
          ) : (
            <ul>
              {partidosFiltrados.map((partido) => {
                const equipoLocal = equipos.find(
                  (equipo) => equipo.id === partido.localId,
                );
                const equipoVisitante = equipos.find(
                  (equipo) => equipo.id === partido.visitanteId,
                );

                return (
                  <li key={partido.id}>
                    <span>
                      {equipoLocal?.nombre} {partido.golesLocal} -{' '}
                      {partido.golesVisitante} {equipoVisitante?.nombre}
                    </span>

                    <button
                      type="button"
                      onClick={() => eliminarPartido(partido.id)}
                      disabled={cargando}
                    >
                      Eliminar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </details>
      </section>

      <section className="tabla-contenedor">
        <table aria-label="Clasificación del torneo">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Club</th>
              <th scope="col">PJ</th>
              <th scope="col">G</th>
              <th scope="col">E</th>
              <th scope="col">P</th>
              <th scope="col">GF</th>
              <th scope="col">GC</th>
              <th scope="col">DG</th>
              <th scope="col">Pts</th>
              <th scope="col">Últimos 5</th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="11">Cargando datos de la API…</td>
              </tr>
            ) : (
              tabla.map((equipo, indice) => (
                <tr key={equipo.id}>
                  <td>{indice + 1}</td>
                  <td>
                    <img
                      className="escudo"
                      src={equipo.escudo}
                      alt={`Escudo de ${equipo.nombre}`}
                    />
                    {equipo.nombre}
                  </td>
                  <td>{equipo.pj}</td>
                  <td>{equipo.g}</td>
                  <td>{equipo.e}</td>
                  <td>{equipo.p}</td>
                  <td>{equipo.gf}</td>
                  <td>{equipo.gc}</td>
                  <td>{equipo.dg > 0 ? `+${equipo.dg}` : equipo.dg}</td>
                  <td>
                    <strong>{equipo.pts}</strong>
                  </td>
                  <td>
                    <div className="forma-reciente">
                      {equipo.forma.length === 0 ? (
                        <span className="sin-forma">—</span>
                      ) : (
                        equipo.forma.map((resultado, indiceForma) => (
                          <span
                            key={`${equipo.id}-${indiceForma}`}
                            className={`forma-badge forma-badge--${resultado.toLowerCase()}`}
                            title={
                              resultado === 'G'
                                ? 'Victoria'
                                : resultado === 'E'
                                  ? 'Empate'
                                  : 'Derrota'
                            }
                          >
                            {resultado}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default App;