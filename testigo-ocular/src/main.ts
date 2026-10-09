// Versión final optimizada
import './estilo.css'
import {
  DURACION_OBSERVACION_MS,
  crearPartida,
  responderPregunta,
  type EstadoPartida,
} from './logica.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('No se encontró el elemento #app.')
}

const raiz = app
let partida: EstadoPartida | null = null
let inicioObservacion = 0
let temporizadorVisual: number | undefined

function detenerTemporizadorVisual(): void {
  if (temporizadorVisual !== undefined) {
    window.clearInterval(temporizadorVisual)
    temporizadorVisual = undefined
  }
}

function dibujarInicio(): void {
  raiz.innerHTML = `
    <main class="panel panel-inicio">
      <p class="etiqueta">JUEGO DE MEMORIA</p>
      <h1>Testigo Ocular</h1>
      <p class="introduccion">Observá con atención una escena y luego respondé las preguntas de memoria.</p>
      <ul class="instrucciones">
        <li>Memorizá los objetos que aparecen.</li>
        <li>La escena estará visible durante cinco segundos.</li>
        <li>Respondé si cada objeto estaba en la escena.</li>
      </ul>
      <button class="boton boton-principal" type="button" data-accion="iniciar">Comenzar partida</button>
    </main>
  `
}

function dibujarObservacion(): void {
  if (!partida) return

  raiz.innerHTML = `
    <main class="panel panel-escena">
      <p class="etiqueta">OBSERVÁ LA ESCENA</p>
      <h1>Memorizá estos objetos</h1>
      <p class="temporizador" aria-live="polite">Quedan <span id="cuenta-regresiva">5</span> segundos</p>
      <ul class="objetos" aria-label="Objetos de la escena">
        ${partida.objetosEscena.map((objeto) => `<li>${objeto}</li>`).join('')}
      </ul>
    </main>
  `

  inicioObservacion = performance.now()
  detenerTemporizadorVisual()
  temporizadorVisual = window.setInterval(actualizarObservacion, 100)
}

function actualizarObservacion(): void {
  if (!partida) return

  if (partida.fase !== 'observacion') {
    detenerTemporizadorVisual()
    dibujarEstadoPartida()
    return
  }

  const transcurrido = performance.now() - inicioObservacion
  const segundosRestantes = Math.ceil(
    Math.max(0, DURACION_OBSERVACION_MS - transcurrido) / 1_000,
  )
  const cuentaRegresiva = document.querySelector<HTMLSpanElement>(
    '#cuenta-regresiva',
  )
  if (cuentaRegresiva) {
    cuentaRegresiva.textContent = String(segundosRestantes)
  }
}

function dibujarPreguntas(): void {
  if (!partida) return

  const pregunta = partida.preguntas[partida.indicePregunta]
  if (!pregunta) return

  const comentario =
    partida.ultimaRespuesta === null
      ? ''
      : `<p class="comentario">Respuesta ${partida.ultimaRespuesta}.</p>`

  raiz.innerHTML = `
    <main class="panel panel-pregunta">
      <p class="etiqueta">PREGUNTA ${partida.indicePregunta + 1} DE ${partida.preguntas.length}</p>
      <h1>${pregunta.texto}</h1>
      <p class="puntaje">Puntaje: ${partida.puntaje}</p>
      ${comentario}
      <div class="acciones-respuesta">
        <button class="boton boton-respuesta" type="button" data-respuesta="true">Sí estaba</button>
        <button class="boton boton-respuesta" type="button" data-respuesta="false">No estaba</button>
      </div>
    </main>
  `
}

function dibujarResultado(): void {
  if (!partida) return

  raiz.innerHTML = `
    <main class="panel panel-resultado" aria-live="polite">
      <p class="etiqueta">PARTIDA TERMINADA</p>
      <h1>Resultado final</h1>
      <p class="resultado-puntaje">${partida.puntaje} de ${partida.preguntas.length}</p>
      <p class="introduccion">Respuestas correctas</p>
      <button class="boton boton-principal" type="button" data-accion="reiniciar">Jugar otra vez</button>
    </main>
  `
}

function dibujarEstadoPartida(): void {
  if (!partida) return

  if (partida.fase === 'observacion') {
    dibujarObservacion()
  } else if (partida.fase === 'preguntas') {
    detenerTemporizadorVisual()
    dibujarPreguntas()
  } else {
    detenerTemporizadorVisual()
    dibujarResultado()
  }
}

raiz.addEventListener('click', (evento: MouseEvent) => {
  const objetivo = evento.target
  if (!(objetivo instanceof Element)) return

  const boton = objetivo.closest<HTMLButtonElement>('button')
  if (!boton) return

  if (boton.dataset.accion === 'iniciar') {
    partida = crearPartida()
    dibujarEstadoPartida()
  } else if (boton.dataset.accion === 'reiniciar') {
    partida = null
    detenerTemporizadorVisual()
    dibujarInicio()
  } else if (boton.dataset.respuesta !== undefined && partida) {
    responderPregunta(partida, boton.dataset.respuesta === 'true')
    dibujarEstadoPartida()
  }
})

dibujarInicio()
