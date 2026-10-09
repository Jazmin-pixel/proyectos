export const DURACION_OBSERVACION_MS = 5_000
export const CANTIDAD_OBJETOS_ESCENA = 5
export const CANTIDAD_PREGUNTAS = 5

const OBJETOS_DISPONIBLES = [
  'reloj',
  'libro',
  'taza',
  'llave',
  'pelota',
  'paraguas',
  'manzana',
  'teléfono',
  'gafas',
  'botella',
  'moneda',
  'cuchara',
]

export interface Pregunta {
  objeto: string
  texto: string
  respuestaCorrecta: boolean
}

export type FasePartida = 'observacion' | 'preguntas' | 'finalizada'

export interface EstadoPartida {
  fase: FasePartida
  objetosEscena: string[]
  preguntas: Pregunta[]
  indicePregunta: number
  puntaje: number
  ultimaRespuesta: 'correcta' | 'incorrecta' | null
}

function mezclar<T>(elementos: T[], aleatorio: () => number): T[] {
  const resultado = [...elementos]

  for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
    const otroIndice = Math.floor(aleatorio() * (indice + 1))
    ;[resultado[indice], resultado[otroIndice]] = [
      resultado[otroIndice],
      resultado[indice],
    ]
  }

  return resultado
}

export function crearPartida(aleatorio: () => number = Math.random): EstadoPartida {
  const objetosEscena = mezclar(OBJETOS_DISPONIBLES, aleatorio).slice(
    0,
    CANTIDAD_OBJETOS_ESCENA,
  )
  const objetosPreguntados = mezclar(OBJETOS_DISPONIBLES, aleatorio).slice(
    0,
    CANTIDAD_PREGUNTAS,
  )

  const estado: EstadoPartida = {
    fase: 'observacion',
    objetosEscena,
    preguntas: objetosPreguntados.map((objeto) => ({
      objeto,
      texto: `¿Estaba ${objeto} en la escena?`,
      respuestaCorrecta: objetosEscena.includes(objeto),
    })),
    indicePregunta: 0,
    puntaje: 0,
    ultimaRespuesta: null,
  }

  setTimeout(() => {
    if (estado.fase === 'observacion') {
      estado.fase = 'preguntas'
    }
  }, DURACION_OBSERVACION_MS)

  return estado
}

export function responderPregunta(
  estado: EstadoPartida,
  respuesta: boolean,
): EstadoPartida {
  if (estado.fase !== 'preguntas') {
    throw new Error('Solo se puede responder durante la fase de preguntas.')
  }

  const pregunta = estado.preguntas[estado.indicePregunta]
  if (!pregunta) {
    throw new Error('No hay preguntas pendientes para responder.')
  }

  const esCorrecta = respuesta === pregunta.respuestaCorrecta
  if (esCorrecta) {
    estado.puntaje += 1
  }

  estado.ultimaRespuesta = esCorrecta ? 'correcta' : 'incorrecta'
  estado.indicePregunta += 1

  if (estado.indicePregunta === estado.preguntas.length) {
    estado.fase = 'finalizada'
  }

  return estado
}
