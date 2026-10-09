(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=5e3,t=[`reloj`,`libro`,`taza`,`llave`,`pelota`,`paraguas`,`manzana`,`teléfono`,`gafas`,`botella`,`moneda`,`cuchara`];function n(e,t){let n=[...e];for(let e=n.length-1;e>0;--e){let r=Math.floor(t()*(e+1));[n[e],n[r]]=[n[r],n[e]]}return n}function r(r=Math.random){let i=n(t,r).slice(0,5),a={fase:`observacion`,objetosEscena:i,preguntas:n(t,r).slice(0,5).map(e=>({objeto:e,texto:`¿Estaba ${e} en la escena?`,respuestaCorrecta:i.includes(e)})),indicePregunta:0,puntaje:0,ultimaRespuesta:null};return setTimeout(()=>{a.fase===`observacion`&&(a.fase=`preguntas`)},e),a}function i(e,t){if(e.fase!==`preguntas`)throw Error(`Solo se puede responder durante la fase de preguntas.`);let n=e.preguntas[e.indicePregunta];if(!n)throw Error(`No hay preguntas pendientes para responder.`);let r=t===n.respuestaCorrecta;return r&&(e.puntaje+=1),e.ultimaRespuesta=r?`correcta`:`incorrecta`,e.indicePregunta+=1,e.indicePregunta===e.preguntas.length&&(e.fase=`finalizada`),e}var a={facil:{nombre:`Explorador (Fácil)`,duracionMs:7e3,cantidadObjetos:4,cantidadPreguntas:2},normal:{nombre:`Testigo (Normal)`,duracionMs:5e3,cantidadObjetos:5,cantidadPreguntas:3},pesadilla:{nombre:`Pesadilla (Difícil)`,duracionMs:3e3,cantidadObjetos:6,cantidadPreguntas:4}},o=document.querySelector(`#app`);if(!o)throw Error(`No se encontró el elemento #app.`);var s=o,c=`normal`,l=null;function u(){let e=a[c];s.innerHTML=`
    <div class="card">
      <h2>JUEGO DE MEMORIA</h2>
      <h1>Testigo Ocular</h1>
      <p>Observa con atención una escena con ${e.cantidadObjetos} objetos durante ${e.duracionMs/1e3} segundos y luego responde las preguntas.</p>
      
      <div style="margin: 1.5rem 0;">
        <p style="margin-bottom: 0.5rem; font-weight: bold; color: var(--text-main);">Selecciona la Dificultad:</p>
        <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn-dif" data-dif="facil" style="padding: 0.5rem 1rem; ${c===`facil`?`background: #2563eb; border-color: #60a5fa;`:`background: #1e293b;`}">Fácil</button>
          <button class="btn-dif" data-dif="normal" style="padding: 0.5rem 1rem; ${c===`normal`?`background: #2563eb; border-color: #60a5fa;`:`background: #1e293b;`}">Normal</button>
          <button class="btn-dif" data-dif="pesadilla" style="padding: 0.5rem 1rem; ${c===`pesadilla`?`background: #2563eb; border-color: #60a5fa;`:`background: #1e293b;`}">Pesadilla</button>
        </div>
      </div>

      <button id="btn-comenzar">Comenzar Partida</button>
    </div>
  `,s.querySelectorAll(`.btn-dif`).forEach(e=>{e.addEventListener(`click`,e=>{c=e.currentTarget.getAttribute(`data-dif`),u()})}),s.querySelector(`#btn-comenzar`)?.addEventListener(`click`,()=>{let e=a[c];l=r(),d(e.duracionMs,e.cantidadObjetos)})}function d(e,t){if(!l)return;s.innerHTML=`
    <div class="card">
      <h2>Memoriza la escena</h2>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin: 2rem 0;">
        ${l.objetosEscena.slice(0,t).map(e=>`<span style="background: #1e293b; padding: 1rem; border-radius: 8px; border: 1px solid #60a5fa;">📦 ${e}</span>`).join(``)}
      </div>
      <p>Tiempo restante: <span id="contador">${e/1e3}</span>s</p>
    </div>
  `;let n=Math.ceil(e/1e3),r=s.querySelector(`#contador`),i=setInterval(()=>{n--,r&&(r.textContent=String(n)),n<=0&&(clearInterval(i),f())},1e3)}function f(){if(!l)return;let e=l.preguntas[l.indicePregunta];e?(s.innerHTML=`
    <div class="card">
      <h2>Pregunta ${l.indicePregunta+1} de ${l.preguntas.length}</h2>
      <p style="font-size: 1.2rem; margin: 1.5rem 0;">¿Estaba el objeto <strong>${e.objeto}</strong> en la escena?</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="btn-si">Sí</button>
        <button id="btn-no" style="background: #b91c1c; border-color: #f87171;">No</button>
      </div>
    </div>
  `,s.querySelector(`#btn-si`)?.addEventListener(`click`,()=>p(!0)),s.querySelector(`#btn-no`)?.addEventListener(`click`,()=>p(!1))):m()}function p(e){l&&(l=i(l,e),f())}function m(){l&&(s.innerHTML=`
    <div class="card">
      <h2>¡Partida Finalizada!</h2>
      <p style="font-size: 1.5rem; margin: 1.5rem 0;">Tu puntaje final es: <strong>${l.puntaje}</strong></p>
      <button id="btn-reiniciar">Jugar de nuevo</button>
    </div>
  `,s.querySelector(`#btn-reiniciar`)?.addEventListener(`click`,()=>{u()}))}u();