import './estilo.css'
import { 
  crearPartida, 
  responderPregunta, 
  NIVELES_DIFICULTAD,
  type EstadoPartida, 
  type Dificultad 
} from './logica.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('No se encontró el elemento #app.')
}

const raiz = app
let dificultadActual: Dificultad = 'normal'
let partida: EstadoPartida | null = null

function renderizarPantallaInicio() {
  const config = NIVELES_DIFICULTAD[dificultadActual]
  
  raiz.innerHTML = `
    <div class="card">
      <h2>JUEGO DE MEMORIA</h2>
      <h1>Testigo Ocular</h1>
      <p>Observa con atención una escena con ${config.cantidadObjetos} objetos durante ${config.duracionMs / 1000} segundos y luego responde las preguntas.</p>
      
      <div style="margin: 1.5rem 0;">
        <p style="margin-bottom: 0.5rem; font-weight: bold; color: var(--text-main);">Selecciona la Dificultad:</p>
        <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn-dif" data-dif="facil" style="padding: 0.5rem 1rem; ${dificultadActual === 'facil' ? 'background: #2563eb; border-color: #60a5fa;' : 'background: #1e293b;'}">Fácil</button>
          <button class="btn-dif" data-dif="normal" style="padding: 0.5rem 1rem; ${dificultadActual === 'normal' ? 'background: #2563eb; border-color: #60a5fa;' : 'background: #1e293b;'}">Normal</button>
          <button class="btn-dif" data-dif="pesadilla" style="padding: 0.5rem 1rem; ${dificultadActual === 'pesadilla' ? 'background: #2563eb; border-color: #60a5fa;' : 'background: #1e293b;'}">Pesadilla</button>
        </div>
      </div>

      <button id="btn-comenzar">Comenzar Partida</button>
    </div>
  `

  raiz.querySelectorAll('.btn-dif').forEach(btn => {
    btn.addEventListener('click', (e) => {
      dificultadActual = (e.currentTarget as HTMLElement).getAttribute('data-dif') as Dificultad
      renderizarPantallaInicio()
    })
  })

  raiz.querySelector('#btn-comenzar')?.addEventListener('click', () => {
    const cfg = NIVELES_DIFICULTAD[dificultadActual]
    partida = crearPartida()
    renderizarEscena(cfg.duracionMs, cfg.cantidadObjetos)
  })
}

function renderizarEscena(duracionMs: number, cantidadObjetos: number) {
  if (!partida) return

  const objetosVisibles = partida.objetosEscena.slice(0, cantidadObjetos)

  raiz.innerHTML = `
    <div class="card">
      <h2>Memoriza la escena</h2>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin: 2rem 0;">
        ${objetosVisibles.map(obj => `<span style="background: #1e293b; padding: 1rem; border-radius: 8px; border: 1px solid #60a5fa;">📦 ${obj}</span>`).join('')}
      </div>
      <p>Tiempo restante: <span id="contador">${duracionMs / 1000}</span>s</p>
    </div>
  `

  let segundosRestantes = Math.ceil(duracionMs / 1000)
  const spanContador = raiz.querySelector('#contador')

  const intervalo = setInterval(() => {
    segundosRestantes--
    if (spanContador) spanContador.textContent = String(segundosRestantes)

    if (segundosRestantes <= 0) {
      clearInterval(intervalo)
      renderizarPregunta()
    }
  }, 1000)
}

function renderizarPregunta() {
  if (!partida) return
  const preguntaActual = partida.preguntas[partida.indicePregunta]

  if (!preguntaActual) {
    renderizarResultado()
    return
  }

  raiz.innerHTML = `
    <div class="card">
      <h2>Pregunta ${partida.indicePregunta + 1} de ${partida.preguntas.length}</h2>
      <p style="font-size: 1.2rem; margin: 1.5rem 0;">¿Estaba el objeto <strong>${preguntaActual.objeto}</strong> en la escena?</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="btn-si">Sí</button>
        <button id="btn-no" style="background: #b91c1c; border-color: #f87171;">No</button>
      </div>
    </div>
  `

  raiz.querySelector('#btn-si')?.addEventListener('click', () => procesarRespuesta(true))
  raiz.querySelector('#btn-no')?.addEventListener('click', () => procesarRespuesta(false))
}

function procesarRespuesta(afirmacion: boolean) {
  if (!partida) return
  partida = responderPregunta(partida, afirmacion)
  renderizarPregunta()
}

function renderizarResultado() {
  if (!partida) return

  raiz.innerHTML = `
    <div class="card">
      <h2>¡Partida Finalizada!</h2>
      <p style="font-size: 1.5rem; margin: 1.5rem 0;">Tu puntaje final es: <strong>${partida.puntaje}</strong></p>
      <button id="btn-reiniciar">Jugar de nuevo</button>
    </div>
  `

  raiz.querySelector('#btn-reiniciar')?.addEventListener('click', () => {
    renderizarPantallaInicio()
  })
}

renderizarPantallaInicio()
