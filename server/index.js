import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';

const app = express();
const puerto = 3000;

app.use(cors());
app.use(express.json());

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

// Los partidos se guardan en la memoria del servidor.
const partidos = [];

function calcularTabla() {
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

    local.pj += 1;
    visitante.pj += 1;

    local.gf += partido.golesLocal;
    local.gc += partido.golesVisitante;
    visitante.gf += partido.golesVisitante;
    visitante.gc += partido.golesLocal;

    let resultadoLocal;
    let resultadoVisitante;

    if (partido.golesLocal > partido.golesVisitante) {
      local.g += 1;
      local.pts += 3;
      visitante.p += 1;
      resultadoLocal = 'G';
      resultadoVisitante = 'P';
    } else if (partido.golesLocal < partido.golesVisitante) {
      visitante.g += 1;
      visitante.pts += 3;
      local.p += 1;
      resultadoLocal = 'P';
      resultadoVisitante = 'G';
    } else {
      local.e += 1;
      visitante.e += 1;
      local.pts += 1;
      visitante.pts += 1;
      resultadoLocal = 'E';
      resultadoVisitante = 'E';
    }

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

function convertirMarcador(valor) {
  if (
    valor === undefined ||
    valor === null ||
    (typeof valor === 'string' && valor.trim() === '')
  ) {
    return null;
  }

  const marcador = Number(valor);

  if (!Number.isInteger(marcador) || marcador < 0) {
    return null;
  }

  return marcador;
}

// Comprueba que el servidor esté activo.
app.get('/api', (req, res) => {
  res.json({ mensaje: 'La API del torneo está activa.' });
});

// Devuelve la lista de equipos.
app.get('/api/equipos', (req, res) => {
  res.json(equipos);
});

// Devuelve los partidos. Puede filtrarlos con ?equipoId=1.
app.get('/api/partidos', (req, res) => {
  const { equipoId } = req.query;

  if (equipoId === undefined) {
    return res.json(partidos);
  }

  const id = Number(equipoId);
  const equipoExiste = equipos.some((equipo) => equipo.id === id);

  if (!equipoExiste) {
    return res.status(400).json({ error: 'El equipo indicado no existe.' });
  }

  const partidosFiltrados = partidos.filter(
    (partido) => partido.localId === id || partido.visitanteId === id,
  );

  return res.json(partidosFiltrados);
});

// Devuelve la clasificación calculada en el servidor.
app.get('/api/tabla', (req, res) => {
  res.json(calcularTabla());
});

// Registra un partido nuevo.
app.post('/api/partidos', (req, res) => {
  const { localId: localIdRecibido, visitanteId: visitanteIdRecibido } =
    req.body ?? {};

  const localId = Number(localIdRecibido);
  const visitanteId = Number(visitanteIdRecibido);
  const golesLocal = convertirMarcador(req.body?.golesLocal);
  const golesVisitante = convertirMarcador(req.body?.golesVisitante);

  if (!Number.isInteger(localId) || !Number.isInteger(visitanteId)) {
    return res.status(400).json({ error: 'Selecciona dos equipos válidos.' });
  }

  if (localId === visitanteId) {
    return res
      .status(400)
      .json({ error: 'Un equipo no puede enfrentarse contra sí mismo.' });
  }

  const equiposValidos =
    equipos.some((equipo) => equipo.id === localId) &&
    equipos.some((equipo) => equipo.id === visitanteId);

  if (!equiposValidos) {
    return res.status(400).json({ error: 'Uno de los equipos no existe.' });
  }

  if (golesLocal === null || golesVisitante === null) {
    return res
      .status(400)
      .json({ error: 'Los goles deben ser enteros iguales o mayores que cero.' });
  }

  const nuevoPartido = {
    id: randomUUID(),
    localId,
    visitanteId,
    golesLocal,
    golesVisitante,
  };

  partidos.unshift(nuevoPartido);

  return res.status(201).json(nuevoPartido);
});

// Elimina un partido por su identificador.
app.delete('/api/partidos/:id', (req, res) => {
  const indice = partidos.findIndex(
    (partido) => partido.id === req.params.id,
  );

  if (indice === -1) {
    return res.status(404).json({ error: 'No se encontró ese partido.' });
  }

  const [partidoEliminado] = partidos.splice(indice, 1);

  return res.json(partidoEliminado);
});

app.listen(puerto, () => {
  console.log(`API activa en http://localhost:${puerto}`);
});