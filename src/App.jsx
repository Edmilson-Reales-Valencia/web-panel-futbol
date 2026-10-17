import { useState } from 'react';
import './App.css';

const equipos = [
  {
    id: 1,
    nombre: 'Barcelona',
    escudo: '/escudos/barcelona.png',
  },
  {
    id: 2,
    nombre: 'Atlético Madrid',
    escudo: '/escudos/atletico.png',
  },
  {
    id: 3,
    nombre: 'Real Betis',
    escudo: '/escudos/betis.png',
  },
  {
    id: 4,
    nombre: 'Real Madrid',
    escudo: '/escudos/real-madrid.png',
  },
  {
    id: 5,
    nombre: 'Sevilla',
    escudo: '/escudos/sevilla.png',
  },
  {
    id: 6,
    nombre: 'Real Sociedad',
    escudo: '/escudos/real-sociedad.png',
  },
];

function calcularTabla(equipos, partidos) {
  const estadisticasIniciales = Object.fromEntries(
    equipos.map((equipo) => [
      equipo.id,
      {
        ...equipo,
        pj: 0,
        g: 0,
        e: 0,
        p: 0,
        gf: 0,
        gc: 0,
        pts: 0,
        forma: [],
      },
    ]),
  );

  const estadisticas = partidos.reduce((acumulado, partido) => {
    const local = acumulado[partido.localId];
    const visitante = acumulado[partido.visitanteId];

    if (!local || !visitante) {
      return acumulado;
    }

    local.pj += 1;
    visitante.pj += 1;

    local.gf += partido.golesLocal;
    local.gc += partido.golesVisitante;
    visitante.gf += partido.golesVisitante;
    visitante.gc += partido.golesLocal;

    if (partido.golesLocal > partido.golesVisitante) {
      local.g += 1;
      local.pts += 3;
      visitante.p += 1;
    } else if (partido.golesLocal < partido.golesVisitante) {
      visitante.g += 1;
      visitante.pts += 3;
      local.p += 1;
    } else {
      local.e += 1;
      visitante.e += 1;
      local.pts += 1;
      visitante.pts += 1;
    }

    const resultadoLocal =
      partido.golesLocal > partido.golesVisitante
        ? 'G'
        : partido.golesLocal < partido.golesVisitante
          ? 'P'
          : 'E';

    const resultadoVisitante =
      resultadoLocal === 'G'
        ? 'P'
        : resultadoLocal === 'P'
          ? 'G'
          : 'E';

    local.forma.push(resultadoLocal);
    visitante.forma.push(resultadoVisitante);

    return acumulado;
  }, estadisticasIniciales);

  return Object.values(estadisticas)
    .map((equipo) => ({
      ...equipo,
      dg: equipo.gf - equipo.gc,
      forma: equipo.forma.slice(0, 5).reverse(),
    }))
    .sort(
      (a, b) =>
        b.pts - a.pts ||
        b.dg - a.dg ||
        b.gf - a.gf ||
        a.nombre.localeCompare(b.nombre),
    );
}

function App() {
  const [partidos, setPartidos] = useState([]);
  const [localId, setLocalId] = useState('1');
  const [visitanteId, setVisitanteId] = useState('2');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [error, setError] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('todos');

  function eliminarPartido(id) {
    setPartidos((partidosActuales) =>
      partidosActuales.filter((partido) => partido.id !== id),
    );
  }

  function registrarPartido(event) {
    event.preventDefault();

    const marcadorLocal = Number(golesLocal);
    const marcadorVisitante = Number(golesVisitante);

    if (localId === visitanteId) {
      setError('Selecciona dos equipos diferentes.');
      return;
    }

    if (
      golesLocal === '' ||
      golesVisitante === '' ||
      !Number.isInteger(marcadorLocal) ||
      !Number.isInteger(marcadorVisitante) ||
      marcadorLocal < 0 ||
      marcadorVisitante < 0
    ) {
      setError('Ingresa goles enteros iguales o mayores que cero.');
      return;
    }

    const nuevoPartido = {
      id: crypto.randomUUID(),
      localId: Number(localId),
      visitanteId: Number(visitanteId),
      golesLocal: marcadorLocal,
      golesVisitante: marcadorVisitante,
    };

    setPartidos((partidosActuales) => [
      nuevoPartido,
      ...partidosActuales,
    ]);
    setGolesLocal('');
    setGolesVisitante('');
    setError('');
  }

  const tabla = calcularTabla(equipos, partidos);

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

      <section className="registro-partido">
        <h2>Registrar partido</h2>

        <form onSubmit={registrarPartido}>
          <label>
            Equipo local
            <select
              value={localId}
              onChange={(event) => setLocalId(event.target.value)}
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
            />
          </label>

          <label>
            Equipo visitante
            <select
              value={visitanteId}
              onChange={(event) => setVisitanteId(event.target.value)}
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
            />
          </label>

          <button type="submit">Guardar resultado</button>

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
                      {equipoLocal.nombre} {partido.golesLocal} -{' '}
                      {partido.golesVisitante} {equipoVisitante.nombre}
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarPartido(partido.id)}
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
            {tabla.map((equipo, indice) => (
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
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default App;