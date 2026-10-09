import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CANTIDAD_OBJETOS_ESCENA,
  CANTIDAD_PREGUNTAS,
  DURACION_OBSERVACION_MS,
  crearPartida,
  responderPregunta,
} from '../src/logica.ts'

describe('La lógica de Testigo Ocular', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('Arma el estado inicial con cinco objetos aleatorios para la escena', () => {
    vi.useFakeTimers()
    const primeraPartida = crearPartida(() => 0)
    const segundaPartida = crearPartida(() => 0.5)

    expect(primeraPartida.fase).toBe('observacion')
    expect(primeraPartida.objetosEscena).toHaveLength(CANTIDAD_OBJETOS_ESCENA)
    expect(new Set(primeraPartida.objetosEscena).size).toBe(
      CANTIDAD_OBJETOS_ESCENA,
    )
    expect(segundaPartida.objetosEscena).toHaveLength(CANTIDAD_OBJETOS_ESCENA)
    expect(segundaPartida.objetosEscena).not.toEqual(
      primeraPartida.objetosEscena,
    )
    expect(primeraPartida.preguntas).toHaveLength(CANTIDAD_PREGUNTAS)
    expect(primeraPartida.puntaje).toBe(0)
  })

  it('Inicia las preguntas al terminar los cinco segundos de observación', () => {
    vi.useFakeTimers()
    const partida = crearPartida(() => 0.25)

    expect(partida.fase).toBe('observacion')
    expect(() => responderPregunta(partida, true)).toThrow(
      'Solo se puede responder durante la fase de preguntas.',
    )

    vi.advanceTimersByTime(DURACION_OBSERVACION_MS - 1)
    expect(partida.fase).toBe('observacion')

    vi.advanceTimersByTime(1)
    expect(partida.fase).toBe('preguntas')
    expect(partida.preguntas[0]?.texto).toMatch(/^¿Estaba .+ en la escena\?$/)
  })

  it('Suma un punto cuando el usuario acierta una respuesta', () => {
    vi.useFakeTimers()
    const partida = crearPartida(() => 0.3)
    vi.advanceTimersByTime(DURACION_OBSERVACION_MS)
    const respuestaCorrecta = partida.preguntas[0]!.respuestaCorrecta

    responderPregunta(partida, respuestaCorrecta)

    expect(partida.puntaje).toBe(1)
    expect(partida.indicePregunta).toBe(1)
    expect(partida.ultimaRespuesta).toBe('correcta')
  })

  it('No suma puntos cuando el usuario falla una respuesta', () => {
    vi.useFakeTimers()
    const partida = crearPartida(() => 0.7)
    vi.advanceTimersByTime(DURACION_OBSERVACION_MS)
    const respuestaIncorrecta = !partida.preguntas[0]!.respuestaCorrecta

    responderPregunta(partida, respuestaIncorrecta)

    expect(partida.puntaje).toBe(0)
    expect(partida.indicePregunta).toBe(1)
    expect(partida.ultimaRespuesta).toBe('incorrecta')
  })

  it('Finaliza la partida después de responder todas las preguntas', () => {
    vi.useFakeTimers()
    const partida = crearPartida(() => 0.1)
    vi.advanceTimersByTime(DURACION_OBSERVACION_MS)

    for (const pregunta of partida.preguntas.slice(0, CANTIDAD_PREGUNTAS - 1)) {
      responderPregunta(partida, pregunta.respuestaCorrecta)
    }
    expect(partida.fase).toBe('preguntas')

    const ultimaPregunta = partida.preguntas[partida.indicePregunta]!
    responderPregunta(partida, ultimaPregunta.respuestaCorrecta)

    expect(partida.fase).toBe('finalizada')
    expect(partida.indicePregunta).toBe(CANTIDAD_PREGUNTAS)
    expect(partida.puntaje).toBe(CANTIDAD_PREGUNTAS)
    expect(() => responderPregunta(partida, true)).toThrow(
      'Solo se puede responder durante la fase de preguntas.',
    )
  })

  it('Permite completar una partida desde la observación hasta el resultado final', () => {
    vi.useFakeTimers()
    const partida = crearPartida(() => 0.42)

    expect(partida.fase).toBe('observacion')
    expect(partida.objetosEscena).toHaveLength(CANTIDAD_OBJETOS_ESCENA)

    vi.advanceTimersByTime(DURACION_OBSERVACION_MS)
    expect(partida.fase).toBe('preguntas')

    while (partida.fase === 'preguntas') {
      const pregunta = partida.preguntas[partida.indicePregunta]!
      responderPregunta(partida, pregunta.respuestaCorrecta)
    }

    expect(partida.fase).toBe('finalizada')
    expect(partida.indicePregunta).toBe(CANTIDAD_PREGUNTAS)
    expect(partida.puntaje).toBe(CANTIDAD_PREGUNTAS)
  })
})
