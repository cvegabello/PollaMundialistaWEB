/* =========================================================
   🏁 CONFIGURACIÓN GLOBAL Y VERSIÓN
   ========================================================= */
const APP_CONFIG = {
    version: "v2.1",           // El número de la versión
    environment: "BETA",       // Estado: DEV, BETA, PROD
    buildDate: "22-Dic-2025"   // Fecha de la última actualización
};

/* =========================================================
   🔥 CONEXIÓN CON FIREBASE
   ========================================================= */
// 1. Pegue aquí su objeto de configuración (El que tiene copiado)
const firebaseConfig = {
  apiKey: "AIzaSyDC81t0Ue5Ut9Z4eploqEY48yx_VVopVfY",
  authDomain: "pollamundial2026-carlos.firebaseapp.com",
  databaseURL: "https://pollamundial2026-carlos-default-rtdb.firebaseio.com/", 
  projectId: "pollamundial2026-carlos",
  storageBucket: "pollamundial2026-carlos.firebasestorage.app",
  messagingSenderId: "182293814564",
  appId: "1:182293814564:web:7b7987db956d74a86727b1"
};

// 2. Inicializar Firebase (Versión Compat)
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Firebase inicializado correctamente.");
} else {
    console.error("☠️ Error: No se cargó la librería de Firebase en el HTML.");
}

// 3. Referencia Global a la Base de Datos
// (Esta variable 'db' es la que usaremos para guardar y leer goles)
const db = firebase.database();

// Pintar la versión automáticamente al cargar
document.addEventListener('DOMContentLoaded', () => {
    const vBadge = document.getElementById('app-version-badge');
    if(vBadge) {
        // Formato: "BETA v1.0"
        vBadge.innerText = `${APP_CONFIG.environment} ${APP_CONFIG.version}`;
        
        // Colores semaforizados según el estado
        if(APP_CONFIG.environment === 'PROD') {
            vBadge.style.color = '#00ff00'; // Verde (Listo para la plata)
            vBadge.style.border = '1px solid #00ff00';
        } else if(APP_CONFIG.environment === 'BETA') {
            vBadge.style.color = '#ffaa00'; // Naranja (Estable pero cuidado)
            vBadge.style.border = '1px solid #ffaa00';
        } else {
            vBadge.style.color = '#ff4444'; // Rojo (En obra negra)
        }
    }
});


/* =========================================================
   1. ANIMACION DE PARTICULAS (FONDO)
   ========================================================= */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let particlesArray = [];

class Particle {
    constructor() { this.x = Math.random()*canvas.width; this.y = Math.random()*canvas.height; this.size = Math.random()*2; this.speedX = Math.random()*1 - 0.5; this.speedY = Math.random()*1 - 0.5; }
    update() { this.x+=this.speedX; this.y+=this.speedY; if(this.x>canvas.width||this.x<0) this.speedX*=-1; if(this.y>canvas.height||this.y<0) this.speedY*=-1; }
    draw() { ctx.fillStyle = 'rgba(0,243,255,0.5)'; ctx.beginPath(); ctx.arc(this.x,this.y,this.size,0,Math.PI*2); ctx.fill(); }
}

function initP() { particlesArray=[]; for(let i=0; i<20; i++) particlesArray.push(new Particle()); }
function animP() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0; i<particlesArray.length; i++) {
        particlesArray[i].update(); particlesArray[i].draw();
        for(let j=i; j<particlesArray.length; j++) {
            const dx = particlesArray[i].x - particlesArray[j].x;
            const dy = particlesArray[i].y - particlesArray[j].y;
            const dist = Math.sqrt(dx*dx+dy*dy);
            if(dist<100) { ctx.beginPath(); ctx.strokeStyle = `rgba(0,243,255,${1-dist/100})`; ctx.lineWidth=0.5; ctx.moveTo(particlesArray[i].x,particlesArray[i].y); ctx.lineTo(particlesArray[j].x,particlesArray[j].y); ctx.stroke(); }
        }
    }
    requestAnimationFrame(animP);
}
initP(); animP();
window.addEventListener('resize', ()=>{canvas.width=window.innerWidth; canvas.height=window.innerHeight; initP();});


/* =========================================================
   3. ESTADO GLOBAL (CORREGIDO)
   ========================================================= */

// 1. LISTA DE USUARIOS (¡Esta era la que faltaba!)
// Cargamos de 'm26_users' para seguir su nomenclatura
let users = JSON.parse(localStorage.getItem('m26_users')) || [];

// 2. USUARIO ACTUAL
// Intentamos recuperar la sesión guardada. Si no hay, creamos uno vacío.
let storedUser = JSON.parse(localStorage.getItem('m26_currentUser'));
let currentUser = storedUser || { 
    name: '', 
    preds: {}, 
    locks: { groups: false, r32: false, r16: false, qf: false, sf: false, f: false } 
};

// 3. ROL
// Si recuperamos un usuario, usamos su rol. Si no, es 'fan'.
let role = (currentUser && currentUser.role) ? currentUser.role : 'fan';

// 4. EL RESTO (Igual a como lo tenía)
let officialRes = JSON.parse(localStorage.getItem('m26_official')) || {};

let rules = JSON.parse(localStorage.getItem('m26_rules')) || { 
    exact: 5, diff: 3, winner: 1, 
    groupExact: 10, groupMix: 5, groupOne: 2 
};

let phaseControl = JSON.parse(localStorage.getItem('m26_phase_control')) || { groups: true, r32: false, r16: false, qf: false, sf: false, f: false };
let officialTeams = JSON.parse(localStorage.getItem('m26_official_teams')) || {};

// Variable para el Motor FIFA
let simulatedTeams = {};

/* =========================================================
   VARIALBES GLOBALES EXTRA
   ========================================================= */
let isEditing = false; // Bandera para saber si el usuario está escribiendo

/* =========================================================
   4. FUNCIONES DE LOGIN Y MODO
   ========================================================= */
/* =========================================================
   LOGIN INTELIGENTE (VERIFICACIÓN EN NUBE ☁️)
   ========================================================= */
function handleLogin() {
    const uInput = document.getElementById('username');
    const pInput = document.getElementById('password');
    const btn = document.querySelector('.login-btn'); // Asegúrese que su botón tenga esta clase o un ID
    
    const u = uInput.value.trim().toLowerCase(); // Guardamos en minúsculas para evitar 'Carlos' vs 'carlos'
    const p = pInput.value;

    if(!u) return alert("Por favor ingresa un nombre de usuario.");

    // --- CAMINO ADMIN (Este es local y rápido) ---
    if(p === 'admin2026') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        
        startFirebaseListener(); // Arrancamos el listener general
        
        // Configurar Admin
        setupAdminMode();
        
        // Gestión de tableros
        const fanDash = document.getElementById('fan-dashboard');
        const adminDash = document.getElementById('admin-dashboard');
        if(adminDash) adminDash.classList.remove('hidden');
        if(fanDash) fanDash.classList.add('hidden');
        
        loadView('admin', 'groups');
        return;
    }

    // --- CAMINO FAN (AQUÍ ESTÁ LA MAGIA 🎩) ---
    
    // 1. Mostrar estado de carga (Feedback visual)
    const originalBtnText = btn ? btn.innerText : 'ENTRAR';
    if(btn) {
        btn.innerText = "Buscando en la nube...";
        btn.disabled = true;
    }

    console.log(`☁️ Preguntando a Firebase por: ${u}...`);

    // 2. CONSULTA DIRECTA A FIREBASE (ONCE)
    // No dependemos del listener, vamos a buscar activamente.
    db.ref('/users').once('value')
        .then((snapshot) => {
            const allUsers = snapshot.val() || [];
            
            // Buscamos si ya existe (Búsqueda insensible a mayúsculas/minúsculas)
            let existingUserIndex = -1;
            let existingUser = null;

            if (Array.isArray(allUsers)) {
                // Si es un array
                existingUserIndex = allUsers.findIndex(user => user.name.toLowerCase() === u);
                if(existingUserIndex !== -1) existingUser = allUsers[existingUserIndex];
            } else {
                // Si Firebase lo devolvió como objeto (raro pero posible)
                const keys = Object.keys(allUsers);
                for(let key of keys) {
                    if (allUsers[key].name.toLowerCase() === u) {
                        existingUser = allUsers[key];
                        break;
                    }
                }
            }

            // 3. DECISIÓN
            if (existingUser) {
                // CASO A: EL USUARIO YA EXISTE -> RECUPERAMOS SUS DATOS ✅
                console.log("✅ Usuario encontrado en la nube. Cargando datos...");
                currentUser = existingUser;
                // Nos aseguramos que users esté actualizado localmente también
                users = Array.isArray(allUsers) ? allUsers : Object.values(allUsers);
            } else {
                // CASO B: EL USUARIO ES NUEVO -> LO CREAMOS 🆕
                console.log("✨ Usuario nuevo. Creando perfil...");
                currentUser = { 
                    name: u, // Guardamos el nombre tal cual lo escribió (pero ya validamos que no existe en lowercase)
                    preds: {}, 
                    locks: { groups: false, r32: false, r16: false, qf: false, sf: false, f: false },
                    role: 'fan'
                };
                
                // Agregamos a la lista local
                if (!Array.isArray(users)) users = [];
                users.push(currentUser);
                
                // Guardamos la nueva lista en la nube (Aquí sí usamos saveToCloud neutralizado)
                saveToCloud(); 
            }

            // 4. ENTRAR AL SISTEMA
            enterAppAsFan();

        })
        .catch((error) => {
            console.error("❌ Error conectando con Firebase:", error);
            alert("Error de conexión. Intenta de nuevo.");
            if(btn) {
                btn.innerText = originalBtnText;
                btn.disabled = false;
            }
        });
}

// Función auxiliar para ordenar la entrada del Fan (Limpia el código de arriba)
function enterAppAsFan() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    startFirebaseListener(); // Arrancamos el listener para seguir recibiendo actualizaciones

    // Gestión de Tableros
    const fanDash = document.getElementById('fan-dashboard');
    const adminDash = document.getElementById('admin-dashboard');
    if(fanDash) fanDash.classList.remove('hidden');
    if(adminDash) adminDash.classList.add('hidden');

    // Configuración visual
    setupUserModeHelper(); // Llamamos a una versión simplificada
    loadView('user', 'groups');
}

function setupAdminMode() {
    // 1. Configurar Identidad
    role = 'admin';
    currentUser = { name: 'ADMINISTRADOR', preds: {}, role: 'admin' }; 

    // 2. Gestionar Barras de Estado (Header)
    const adminBar = document.getElementById('admin-status-bar');
    const userBar = document.getElementById('user-status-bar');
    
    if(adminBar) adminBar.style.display = 'block'; // Mostrar barra morada Admin
    if(userBar) userBar.style.display = 'none';    // Ocultar barra de usuario

    // 3. Gestionar Botones de Herramientas (Toolbar)
    // const btnSaveDraft = document.getElementById('btn-save-draft');
    // const btnRefresh = document.getElementById('btn-refresh');
    const adminBracketTools = document.getElementById('admin-bracket-tools');
    
    // El admin no guarda "borradores", guarda con botones específicos en el panel
    // if(btnSaveDraft) btnSaveDraft.style.display = 'none';
    // if(btnRefresh) btnRefresh.style.display = 'flex'; 
    
    // Herramientas extra para el bracket (botón de cargar clasificados)
    if(adminBracketTools) adminBracketTools.style.display = 'block';

    // 4. Actualizar Nombre en Pantalla
    const displayUser = document.getElementById('display-username');
    if(displayUser) displayUser.innerText = "ADMINISTRADOR";

    // 5. CARGAR VALORES EN LA PESTAÑA DE CONFIGURACIÓN ⚙️
    // Esto es vital para que cuando entre a Configuración, los inputs tengan los valores reales
    if(document.getElementById('rule-exact')) {
        document.getElementById('rule-exact').value = rules.exact;
        document.getElementById('rule-diff').value = rules.diff;
        document.getElementById('rule-winner').value = rules.winner;
        // Nuevos inputs
        document.getElementById('rule-group-exact').value = rules.groupExact || 0;
        document.getElementById('rule-group-mix').value = rules.groupMix || 0;
        document.getElementById('rule-group-one').value = rules.groupOne || 0;
    }

    if(document.getElementById('check-groups')) {
        document.getElementById('check-groups').checked = phaseControl.groups;
        document.getElementById('check-r32').checked = phaseControl.r32;
        document.getElementById('check-r16').checked = phaseControl.r16;
        document.getElementById('check-qf').checked = phaseControl.qf;
        document.getElementById('check-sf').checked = phaseControl.sf;
        document.getElementById('check-f').checked = phaseControl.f;
    }

    // NOTA IMPORANTE:
    // Aquí NO tocamos los botones de navegación ni llamamos a renderGroups().
    // De mostrar el tablero correcto se encarga la función handleLogin().
}

// function setupUserMode(username) {
//     // 1. Definir Rol
//     role = 'fan';

//     // 2. Gestionar Elementos de la Interfaz (Igual que como lo tenía)
//     const adminBar = document.getElementById('admin-status-bar');
//     if(adminBar) adminBar.style.display = 'none';
    
//     const adminTools = document.getElementById('admin-bracket-tools');
//     if(adminTools) adminTools.style.display = 'none';
    
//     const btnSaveAdmin = document.getElementById('btn-save-admin');
//     if(btnSaveAdmin) btnSaveAdmin.style.display = 'none';

//     // Mostrar cosas de Fan
//     const userBar = document.getElementById('user-status-bar');
//     if(userBar) userBar.style.display = 'grid'; 
    
//     // const btnSaveDraft = document.getElementById('btn-save-draft');
//     // if(btnSaveDraft) btnSaveDraft.style.display = 'flex'; 
    
//     // const btnRefresh = document.getElementById('btn-refresh');
//     // if(btnRefresh) btnRefresh.style.display = 'flex';

//     // ============================================================
//     // 3. CARGAR DATOS DEL USUARIO (MODIFICADO PARA FIREBASE ☁️)
//     // ============================================================
    
//     // Paso A: Buscamos si el usuario ya existe en la lista global (que viene de la nube)
//     let foundUser = users.find(u => u.name === username);

//     if (foundUser) {
//         // SI EXISTE: Usamos sus datos
//         currentUser = foundUser;
//         console.log(`✅ Bienvenido de nuevo, ${currentUser.name}`);
//     } else {
//         // SI ES NUEVO: Lo creamos desde cero
//         currentUser = { 
//             name: username, 
//             preds: {}, 
//             locks: { groups: false, r32: false, r16: false, qf: false, sf: false, f: false },
//             role: 'fan' // Aseguramos el rol
//         };
        
//         // ¡MAGIA AQUÍ! ✨
//         // Lo agregamos a la lista global
//         users.push(currentUser);
        
//         // Y guardamos en la nube inmediatamente
//         saveToCloud(); 
        
//         console.log(`✨ Nuevo usuario creado y subido a la nube: ${currentUser.name}`);
//     }
    
//     // ============================================================

//     // 4. Actualizar Nombre en Pantalla
//     const displayUser = document.getElementById('display-username');
//     if(displayUser) displayUser.innerText = currentUser.name.toUpperCase();
    
//     // 5. Actualizar Barra de Progreso
//     if(typeof updateStatusUI === 'function') updateStatusUI();

//     // (Nota: loadView se llama después en handleLogin, así que estamos bien)
// }

function setupUserModeHelper() {
    role = 'fan';
    
    // Ocultar cosas de admin
    const adminBar = document.getElementById('admin-status-bar');
    if(adminBar) adminBar.style.display = 'none';
    const adminTools = document.getElementById('admin-bracket-tools');
    if(adminTools) adminTools.style.display = 'none';
    const btnSaveAdmin = document.getElementById('btn-save-admin');
    if(btnSaveAdmin) btnSaveAdmin.style.display = 'none';

    // Mostrar barra de usuario
    const userBar = document.getElementById('user-status-bar');
    if(userBar) userBar.style.display = 'grid';

    // Nombre en pantalla
    const displayUser = document.getElementById('display-username');
    if(displayUser) displayUser.innerText = currentUser.name.toUpperCase();

    // Actualizar estado
    if(typeof updateStatusUI === 'function') updateStatusUI();
}


/* =========================================================
   BARRA DE ESTADO Y PROGRESO (CORREGIDA - VERSIÓN FINAL 🛡️)
   ========================================================= */
function updateStatusUI() {
    // 1. BLINDAJE
    if (!currentUser) return;
    if (role === 'admin') return; 

    if (!currentUser.locks) {
        currentUser.locks = { groups: false, r32: false, r16: false, qf: false, sf: false, f: false };
    }

    // 2. CÁLCULOS
    let count = Object.values(currentUser.locks).filter(x => x).length;
    let progressDisplay = document.getElementById('display-progress');
    if(progressDisplay) progressDisplay.innerText = `Fases: ${count}/6`;
    
    calculatePoints();
    
    // 3. REFERENCIAS
    let badge = document.getElementById('display-status');
    let groupArea = document.getElementById('submit-groups-area');
    let groupBtn = document.getElementById('btn-submit-groups');
    let groupMsg = document.getElementById('groups-msg');
    // let saveDraftBtn = document.getElementById('btn-save-draft'); // Botón de disquette
    
    if(!badge || !groupArea) return;

    // 4. LÓGICA DE ESTADO
    if(currentUser.locks.groups) {
        // --- CASO: YA ENVIÓ (OFICIAL) ---
        badge.innerText = "OFICIAL";
        badge.className = "status-badge bg-official";
        
        // Esconder todo porque ya envió
        groupArea.style.display = 'none';

        // if(saveDraftBtn) saveDraftBtn.style.display = 'none';

    } else {
        // --- CASO: BORRADOR (AÚN NO ENVÍA) ---
        badge.innerText = "BORRADOR";
        badge.className = "status-badge bg-draft";
        
        // AQUÍ ESTABA EL ERROR 🚨
        // Antes mostrábamos la caja siempre. Ahora preguntamos:
        // ¿Estoy en mi vista de usuario?
        
        if (typeof currentViewMode !== 'undefined' && currentViewMode === 'user') {
            // SI: Muestre el panel de enviar y el disquette
            groupArea.style.display = 'block'; 
            groupArea.classList.remove('hidden'); 

            // if(saveDraftBtn) saveDraftBtn.style.display = 'flex';
        } else {
            // NO (Estoy viendo Oficiales): Escóndase, no estorbe
            groupArea.style.display = 'none';
            // if(saveDraftBtn) saveDraftBtn.style.display = 'none';
        }
        
        // Configurar el botón grande (Habilitado/Deshabilitado según Admin)
        if(phaseControl.groups) {
            if(groupBtn) {
                groupBtn.disabled = false;
                groupBtn.className = "btn-big-submit";
                groupBtn.innerText = "ENVIAR OFICIALMENTE";
            }
            if(groupMsg) groupMsg.innerHTML = "Fase de grupos habilitada.";
        } else {
            if(groupBtn) {
                groupBtn.disabled = true;
                groupBtn.className = "btn-big-submit btn-big-disabled";
                groupBtn.innerText = "ESPERANDO ADMIN";
            }
            if(groupMsg) groupMsg.innerHTML = "Fase cerrada temporalmente.";
        }
    }
}

function switchTab(tab) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-'+tab).classList.add('active');
    
    // Identificar qué botón se presionó para activarlo visualmente
    let btnId = 'btn-tab-' + tab;
    if(document.getElementById(btnId)) {
        document.getElementById(btnId).classList.add('active');
    }
    
    if(tab === 'bracket') renderBracket();
    if(tab === 'real') {
        renderRealResults();
        renderRealBracket();
    }
}

/* =========================================================
   RENDERIZADOR DE GRUPOS (User vs Official)
   ========================================================= */
/* =========================================================
   RENDERIZADOR DE GRUPOS (Con ID para actualización quirúrgica 🏥)
   ========================================================= */
function renderGroups(customData, customMode) {
    const container = document.getElementById('groups-container');
    if(!container) return; 
    container.innerHTML = '';
    
    let modeToUse = customMode || 'user'; 
    let dataToUse;
    
    if (modeToUse === 'official') {
        dataToUse = officialRes || {}; 
    } else {
        dataToUse = customData || (currentUser ? currentUser.preds : {}) || {};
    }

    let isReadOnly = false;
    if (modeToUse === 'official') {
        if (role !== 'admin') isReadOnly = true; 
    } else {
        if (role === 'fan' && currentUser.locks && currentUser.locks.groups) isReadOnly = true;
    }

    for(let g in GROUPS_CONFIG) {
        const data = GROUPS_CONFIG[g];
        let matchesHTML = '';
        
        let teamStats = data.teams.map(n => ({ name: n, pts: 0, dif: 0, gf: 0, gc: 0 }));
        
        data.matches.forEach((m, idx) => {
            let id = `${g}-${idx}`;
            let valH = dataToUse[`h-${id}`] || ''; 
            let valA = dataToUse[`a-${id}`] || '';
            let disabledAttr = isReadOnly ? 'disabled' : '';

            if(valH !== '' && valA !== '') {
                let sH = parseInt(valH); let sA = parseInt(valA);
                teamStats[m.t1].gf += sH; teamStats[m.t1].gc += sA; teamStats[m.t1].dif += (sH - sA);
                teamStats[m.t2].gf += sA; teamStats[m.t2].gc += sH; teamStats[m.t2].dif += (sA - sH);
                if(sH > sA) teamStats[m.t1].pts += 3;
                else if(sA > sH) teamStats[m.t2].pts += 3;
                else { teamStats[m.t1].pts += 1; teamStats[m.t2].pts += 1; }
            }
            
            matchesHTML += `<div class="match-row">
                <div class="team-name team-home">${data.teams[m.t1]}</div>
                <div class="center-inputs">
                    <div class="match-info">${m.info}</div>
                    <div class="score-container">
                        <input type="number" min="0" value="${valH}" ${disabledAttr} 
                               onchange="updateVal('${id}','h',this.value)">
                        <span>-</span>
                        <input type="number" min="0" value="${valA}" ${disabledAttr} 
                               onchange="updateVal('${id}','a',this.value)">
                    </div>
                </div>
                <div class="team-name team-away">${data.teams[m.t2]}</div>
            </div>`;
        });

        teamStats.sort((a,b) => (b.pts - a.pts) || (b.dif - a.dif) || (b.gf - a.gf));

        let tableRows = teamStats.map((t,i) => 
            `<tr class="${i<2?'qual-zone':''}">
                <td class="pos-num">${i+1}</td>
                <td style="text-align:left; padding-left:5px;">${t.name}</td>
                <td style="font-weight:bold; color:#fff;">${t.pts}</td>
                <td style="color:#888;">${t.dif}</td>
                <td style="color:#888;">${t.gf}</td>
                <td style="color:#888;">${t.gc}</td>
             </tr>`
        ).join('');
        
        let titleTxt = `GRUPO ${g}`;
        if (modeToUse === 'official') titleTxt += " [OFICIAL FIFA]";
        else if (isReadOnly) titleTxt += " [ENVIADO]";

        container.innerHTML += `
        <div class="card">
            <div class="group-header">${titleTxt}</div>
            <div class="card-body">
                ${matchesHTML}
                <table class="compact-table" style="width:100%; margin-top:10px; font-size:0.85rem; text-align:center;">
                    <thead>
                        <tr style="background:rgba(255,255,255,0.05); color:#666;">
                            <th>#</th> <th style="text-align:left;">EQ</th> <th>PT</th> <th>DF</th> <th>GF</th> <th>GC</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-${g}">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>`;
    }
}


/* =========================================================
   ACTUALIZAR RESULTADO GRUPOS (Fusión: Seguridad + Admin + Simulación)
   ========================================================= */
/* =========================================================
   ACTUALIZAR RESULTADO (SIN PERDER EL FOCO 🎯)
   ========================================================= */
function updateVal(id, type, val) {
    if(val < 0) val = 0;

    if (currentViewMode === 'official') return; 

    let targetDB;
    if (currentViewMode === 'admin') {
        targetDB = officialRes;
    } else {
        if(currentUser.locks && currentUser.locks.groups) return; 
        targetDB = currentUser.preds;
    }

    let key = `${type}-${id}`; 
    targetDB[key] = val;

    // --- GUARDADO ---
    if (currentViewMode === 'admin') {
        localStorage.setItem('m26_official', JSON.stringify(officialRes));
        db.ref('/officialRes/' + key).set(val);
    } else {
        saveUsersDB(); 
    }

    // 🛑 AQUÍ ESTABA EL ERROR:
    // renderGroups(targetDB, currentViewMode); <--- ESTO MATABA EL FOCO
    
    // ✅ LA SOLUCIÓN:
    // 1. Identificamos qué grupo es (El ID viene como "A-0", sacamos la "A")
    let groupID = id.split('-')[0];
    
    // 2. Actualizamos SOLO la tablita de ese grupo
    if(typeof refreshGroupTable === 'function') {
        refreshGroupTable(groupID);
    }
    
    // 3. Calculamos proyecciones (Esto es invisible, no quita foco)
    setTimeout(() => {
        try {
            if (typeof calculateSimulatedTeams === 'function') {
                let projected = calculateSimulatedTeams(targetDB);
                if (currentViewMode !== 'admin') {
                    if(!currentUser.computed) currentUser.computed = {};
                    currentUser.computed.r32 = projected;
                }
                if(typeof simulatedTeams !== 'undefined') simulatedTeams = projected;
            }
        } catch (e) { console.log(e); }
    }, 0);
}

function updateStats(stats, i1, i2, s1, s2) {
    let t1=stats[i1], t2=stats[i2];
    t1.dif += (s1-s2); t2.dif += (s2-s1);
    if(s1>s2) t1.pts+=3; else if(s2>s1) t2.pts+=3; else {t1.pts++; t2.pts++;}
}



/* =========================================================
   EL CEREBRO FIFA (V6.0 - FINAL: Soporte para 'L' Loser)
   ========================================================= */
function calculateSimulatedTeams(predsSource) {
    const standings = {};
    
    // 1. CALCULAR GRUPOS (Esto no cambia)
    Object.keys(GROUPS_CONFIG).forEach(gid => {
        const groupData = GROUPS_CONFIG[gid];
        let teamsMap = groupData.teams.map((name, idx) => ({ 
            name: name, group: gid,
            pts: 0, dif: 0, gf: 0, gc: 0
        }));

        groupData.matches.forEach((m, idx) => {
            let id = `${gid}-${idx}`;
            let vH = predsSource[`h-${id}`] || predsSource[`k-${id}-h`];
            let vA = predsSource[`a-${id}`] || predsSource[`k-${id}-a`];

            if(vH && vA) { 
                let sH = parseInt(vH); let sA = parseInt(vA);
                teamsMap[m.t1].gf += sH; teamsMap[m.t1].gc += sA; teamsMap[m.t1].dif += (sH-sA);
                teamsMap[m.t2].gf += sA; teamsMap[m.t2].gc += sH; teamsMap[m.t2].dif += (sA-sH);
                if(sH > sA) teamsMap[m.t1].pts += 3;
                else if(sA > sH) teamsMap[m.t2].pts += 3;
                else { teamsMap[m.t1].pts += 1; teamsMap[m.t2].pts += 1; }
            }
        });
        teamsMap.sort((a,b) => (b.pts - a.pts) || (b.dif - a.dif) || (b.gf - a.gf));
        standings[gid] = teamsMap;
    });

    // 2. MEJORES TERCEROS
    let allThirds = [];
    Object.keys(standings).forEach(g => { if(standings[g][2]) allThirds.push(standings[g][2]); });
    allThirds.sort((a,b) => (b.pts - a.pts) || (b.dif - a.dif) || (b.gf - a.gf));
    const qualifiedThirds = allThirds.slice(0, 8);
    const usedThirds = new Set();

    // 3. RESOLVER LLAVES (RECURSIVO)
    const projected = {};

    // --- Sub-función: Quién ganó el partido ID ---
    const getMatchWinner = (matchId) => {
        if (!projected[matchId]) return null; 

        let vH = predsSource[`k-${matchId}-h`] || predsSource[`h-${matchId}`];
        let vA = predsSource[`k-${matchId}-a`] || predsSource[`a-${matchId}`];
        let winnerCode = predsSource[`w-${matchId}`];

        if (vH && vA) {
            let sH = parseInt(vH); let sA = parseInt(vA);
            if (sH > sA) return projected[matchId].home;
            if (sA > sH) return projected[matchId].away;
            if (sH === sA) {
                if (winnerCode === 'h') return projected[matchId].home;
                if (winnerCode === 'a') return projected[matchId].away;
            }
        }
        return { name: `Ganador M${matchId}`, seed: `W${matchId}` };
    };

    // --- Sub-función: Resolver quién es el equipo (A1, W73, L101) ---
    const resolveTeamData = (code) => {
        if(!code) return { name: '...', seed: '' };

        // A) GRUPOS (Ej: A1, B2)
        if (code.match(/^[A-L][1-2]$/)) {
            let g = code.charAt(0); let pos = parseInt(code.charAt(1)) - 1;
            if(standings[g] && standings[g][pos]) return { name: standings[g][pos].name, seed: code };
        }

        // B) MEJORES TERCEROS (Ej: T_ABCDF)
        if (code.startsWith('T_')) {
            let allowed = code.split('_')[1];
            let found = qualifiedThirds.find(t => allowed.includes(t.group) && !usedThirds.has(t.name));
            if (found) { usedThirds.add(found.name); return { name: found.name, seed: `3${found.group}` }; }
            return { name: 'TBD', seed: '3?' };
        }

        // C) REFERENCIA A PARTIDO PREVIO (W = Winner, L = Loser)
        // ESTA ES LA PARTE QUE ACTUALIZAMOS
        let type = 'W'; // Por defecto asumimos que busca al ganador
        let cleanId = code;
        
        // Detectar si pide Winner (W) o Loser (L)
        if (code.startsWith('W')) {
            cleanId = code.substring(1);
        } else if (code.startsWith('L')) {
            type = 'L'; 
            cleanId = code.substring(1);
        }

        // Si el partido ya se jugó (está en projected)
        if (projected[cleanId]) {
            let winner = getMatchWinner(cleanId);
            
            // Si ya hay un ganador definido
            if(winner && !winner.name.startsWith('Ganador')) {
                // CASO 1: Queremos el GANADOR (Final)
                if(type === 'W') return { name: winner.name, seed: code };
                
                // CASO 2: Queremos el PERDEDOR (3er Puesto)
                if(type === 'L') {
                    let match = projected[cleanId];
                    // El perdedor es el que NO es el ganador
                    // (Si el ganador es Home, el perdedor es Away)
                    let loser = (match.home.name === winner.name) ? match.away : match.home;
                    return { name: loser.name, seed: code };
                }
            }
            // Si aún no se juega, mostramos texto de espera
            return { name: (type === 'L' ? `Perdedor M${cleanId}` : `Ganador M${cleanId}`), seed: code };
        }
        
        // C.2) Compatibilidad con IDs directos ('32-1')
        if (projected[code]) {
             let winner = getMatchWinner(code);
             if(winner) return { name: winner.name, seed: code };
        }

        return { name: '...', seed: '' };
    };

    // 4. EJECUTAR EN CASCADA
    const phases = [
        (typeof R32_MATCHUPS !== 'undefined' ? R32_MATCHUPS : []),
        (typeof R16_MATCHUPS !== 'undefined' ? R16_MATCHUPS : []),
        (typeof QF_MATCHUPS !== 'undefined' ? QF_MATCHUPS : []),
        (typeof SF_MATCHUPS !== 'undefined' ? SF_MATCHUPS : []),
        (typeof F_MATCHUPS !== 'undefined' ? F_MATCHUPS : [])
    ];

    phases.forEach(phase => {
        phase.forEach(m => {
            projected[m.id] = {
                home: resolveTeamData(m.h),
                away: resolveTeamData(m.a)
            };
        });
    });

    return projected;
}



function autoFillOfficialQualifiers() {
    if(role !== 'admin') return;
    let realQualifiers = calculateSimulatedTeams(officialRes);
    R32_MATCHUPS.forEach(m => {
        if(realQualifiers[m.h]) officialTeams[`${m.id}-h`] = realQualifiers[m.h];
        if(realQualifiers[m.a]) officialTeams[`${m.id}-a`] = realQualifiers[m.a];
    });
    localStorage.setItem('m26_official_teams', JSON.stringify(officialTeams));
    alert("Clasificados cargados.");
    renderBracket();
}

function renderBracket() {
    const container = document.getElementById('bracket-container');
    if (!container) return;
    container.innerHTML = '';
    simulatedTeams = calculateSimulatedTeams(role === 'admin' ? officialRes : currentUser.preds);
    let html = '';
    html += renderRoundColumn('16avos', R32_MATCHUPS, '32', 'r32');
    html += renderRoundColumn('Octavos', R16_MATCHUPS, '16', 'r16');
    html += renderRoundColumn('Cuartos', QF_MATCHUPS, '8', 'qf');
    html += renderRoundColumn('Semis', SF_MATCHUPS, '4', 'sf');
    html += renderRoundColumn('Final', F_MATCHUPS, '2', 'f');
    container.innerHTML = html;
}


function renderRoundColumn(title, matchups, prefix, phaseKey, sourceData, mode) {
    
    // 1. LÓGICA DE CANDADO 🔒
    let isLocked = false;
    
    // Si el modo es 'official' (Fan viendo), nadie edita.
    // Si el modo es 'admin' (Admin editando), el candado queda abierto (false).
    if (mode === 'official') {
        if (role !== 'admin') isLocked = true;
    } else if (mode === 'user') {
        // En user, se bloquea si ya envió
        if (role === 'fan' && currentUser.locks && currentUser.locks[phaseKey]) isLocked = true;
    }
    
    // 2. ESTILOS VISUALES PARA EL INPUT 🎨
    // Si está bloqueado: Oscuro y gris.
    // Si está libre (Admin): Blanco y letra negra (para que se note que puede escribir).
    let inputStyle = isLocked 
        ? 'background:#333; color:#aaa; border:1px solid #444;' 
        : 'background:#fff; color:#000; border:1px solid #ccc;';

    let isEnabled = phaseControl[phaseKey];
    
    // Header y Botones
    let btnHTML = '';
    // En modo oficial o admin, mostramos etiqueta simple
    if (mode === 'official' || mode === 'admin') {
        btnHTML = `<span style="font-size:0.7rem; color:${mode==='official'?'#ffd700':'#fff'}">${mode.toUpperCase()}</span>`;
    } 
    else if(role === 'fan') {
        if(isLocked) btnHTML = `<button class="round-action-btn btn-done">ENVIADO</button>`;
        else if (!isEnabled) btnHTML = `<button class="round-action-btn btn-wait">ESPERANDO</button>`;
        else btnHTML = `<button class="round-action-btn btn-go" onclick="submitPhase('${phaseKey}')">ENVIAR</button>`;
    } else {
        btnHTML = `<span style="font-size:0.7rem; color:${isEnabled?'#0f0':'#f00'}">${isEnabled ? 'OPEN' : 'CLOSED'}</span>`;
    }

    let html = `<div class="round-column" id="col-${phaseKey}">
                    <div class="round-header"><span class="round-title">${title}</span>${btnHTML}</div>`;

    matchups.forEach(m => {
        // --- LOGICA DE CEREBRO ---
        let simData = (typeof simulatedTeams !== 'undefined' && simulatedTeams[m.id]) ? simulatedTeams[m.id] : null;
        let nameH = simData ? simData.home.name : resolveTeamName(m.id, 'h', m.h);
        let seedH = simData ? simData.home.seed : m.h;
        let nameA = simData ? simData.away.name : resolveTeamName(m.id, 'a', m.a);
        let seedA = simData ? simData.away.seed : m.a;
        
        // LEER DATOS
        let kH = `k-${m.id}-h`; let kA = `k-${m.id}-a`; let kW = `w-${m.id}`;
        let scH = (sourceData && sourceData[kH]) ? sourceData[kH] : '';
        let scA = (sourceData && sourceData[kA]) ? sourceData[kA] : '';
        let penWinner = (sourceData && sourceData[kW]) ? sourceData[kW] : null;

        let isTie = (scH !== '' && scA !== '' && parseInt(scH) === parseInt(scA));
        let checkStyle = isTie ? 'visibility:visible;' : 'visibility:hidden;'; 
        
        let disabled = isLocked ? 'disabled' : '';

        // ETIQUETAS Y FLUJO
        let sourceTag = '';
        if(phaseKey !== 'r32') {
            sourceTag = `<div class="match-source-label">${m.h} <span style="color:#666">vs</span> ${m.a}</div>`;
        }

        let flowClass = '';
        if(phaseKey === 'r32') flowClass = 'flow-start'; 
        else if(phaseKey === 'f') flowClass = 'flow-end'; 
        else flowClass = 'flow-mid'; 

        // HELPER RENDER TEAM (SIMPLIFICADO) 🧹
        // Aquí quitamos el if(role === 'admin'...) para que siempre muestre texto y no input
        let renderTeam = (slot, name, seed, type) => {
            let isChecked = (penWinner === type) ? 'checked' : '';
            let checkHTML = `<input type="checkbox" class="pen-check" ${isChecked} ${disabled} style="${checkStyle} margin-left:5px; cursor:pointer;" onchange="updateWinner('${m.id}', '${type}', this.checked)">`;
            let badgeHTML = `<span class="seed-badge" style="display:inline-block; width:28px; font-size:0.7rem; font-weight:bold; color:#ffd700; margin-right:4px; text-align:left;">${seed}</span>`;

            // Siempre retornamos la versión de lectura (span)
            return `<div style="display:flex; align-items:center; width:100%; overflow:hidden;">
                        ${badgeHTML}
                        <span class="b-team" title="${name}" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${name}</span>
                        ${checkHTML}
                    </div>`;
        };

        // --- CONSTRUCCIÓN DE LA TARJETA ---
        // Aplicamos style="${inputStyle}" a los inputs de números
        html += `<div class="bracket-match ${flowClass}" id="match-${m.id}">
                    <div class="match-top-bar">
                        <span class="match-id-badge">M${m.id}</span>
                        ${sourceTag}
                    </div>

                    <div class="bracket-row">
                        ${renderTeam('h', nameH, seedH, 'h')}
                        <input type="number" min="0" class="bracket-input" value="${scH}" style="${inputStyle}" ${disabled} onchange="updateBracketScore('${m.id}','h',this.value, '${phaseKey}')">
                    </div>
                    <div class="bracket-row">
                        ${renderTeam('a', nameA, seedA, 'a')}
                        <input type="number" min="0" class="bracket-input" value="${scA}" style="${inputStyle}" ${disabled} onchange="updateBracketScore('${m.id}','a',this.value, '${phaseKey}')">
                    </div>
                 </div>`;
    });
    return html + `</div>`;
}



/* =========================================================
   EL PUENTE (Resuelve qué nombre mostrar en la llave)
   Conecta el cálculo matemático con la pantalla.
   ========================================================= */
function resolveTeamName(matchId, side, defaultCode) {
    // 1. Verificamos si el Motor ya calculó este partido
    if (simulatedTeams && simulatedTeams[matchId]) {
        return side === 'h' ? simulatedTeams[matchId].home : simulatedTeams[matchId].away;
    }
    
    // 2. Si no hay cálculo (o es una fase futura vacía), devolvemos puntos suspensivos
    return '...'; 
}

function updateOfficialTeamName(matchId, slot, newName) {
    officialTeams[`${matchId}-${slot}`] = newName;
}

/* =========================================================
   ACTUALIZAR RESULTADO BRACKET (Versión Blindada 🛡️)
   ========================================================= */
function updateBracketScore(matchId, side, val, phaseKey) {
    if(val < 0) val = 0;

    if (currentViewMode === 'official') return;

    let targetDB;
    if (currentViewMode === 'admin') {
        targetDB = officialRes;
    } else {
        if (currentUser.locks && currentUser.locks[phaseKey]) return;
        targetDB = currentUser.preds;
    }

    let key = `k-${matchId}-${side}`;
    targetDB[key] = val;

    // 4. PERSISTIR (CIRUGÍA LÁSER 🔫)
    if (currentViewMode === 'admin') {
        localStorage.setItem('m26_official', JSON.stringify(officialRes));
        
        // Guardado directo y específico
        db.ref('/officialRes/' + key).set(val);
        
    } else {
        if (typeof saveUsersDB === 'function') saveUsersDB();
        else localStorage.setItem('m26_currentUser', JSON.stringify(currentUser));
    }

    if (typeof renderBracketView === 'function') {
        renderBracketView(targetDB, currentViewMode);
    } else if (typeof renderBracket === 'function') {
        renderBracket(targetDB, currentViewMode);
    }
}

/* =========================================================
   7. FUNCIONES DE GUARDADO Y PUNTOS
   ========================================================= */
// function refreshData() {
//     officialRes = JSON.parse(localStorage.getItem('m26_official')) || {};
//     phaseControl = JSON.parse(localStorage.getItem('m26_phase_control')) || { groups: true, r32: false, r16: false, qf: false, sf: false, f: false };
//     officialTeams = JSON.parse(localStorage.getItem('m26_official_teams')) || {};
//     if(currentUser && currentUser.name) {
//         const key = `m26_data_${currentUser.name}`;
//         let saved = JSON.parse(localStorage.getItem(key));
//         if(saved) currentUser = saved;
//     }
//     updateStatusUI();
//     renderGroups();
//     renderBracket();

//     // Si estamos en modo fan, refrescamos los oficiales
//     if(role === 'fan') {
//         renderRealResults();
//         renderRealBracket(); // <--- AGREGAR ESTA LÍNEA
//     }
//     alert("¡Datos actualizados!");
// }

function saveUser(silent) {
    localStorage.setItem(`m26_data_${currentUser.name}`, JSON.stringify(currentUser));
    if(!silent) alert("Datos Guardados.");
    updateStatusUI();
}

function submitPhase(phase) {
    if(!phaseControl[phase]) return alert("Fase cerrada por Admin.");
    let missing = false;
    if(phase === 'groups') {
        for(let g in GROUPS_CONFIG) {
            for(let i=0; i<GROUPS_CONFIG[g].matches.length; i++) {
                let id = `${g}-${i}`;
                let h = currentUser.preds[`h-${id}`]; let a = currentUser.preds[`a-${id}`];
                if(h === undefined || h === "" || a === undefined || a === "") { missing = true; break; }
            }
        }
    } else {
        let map = { 'r32': R32_MATCHUPS, 'r16': R16_MATCHUPS, 'qf': QF_MATCHUPS, 'sf': SF_MATCHUPS, 'f': F_MATCHUPS };
        let matches = map[phase];
        if(matches) for(let m of matches) {
            let h = currentUser.preds[`k-${m.id}-h`]; let a = currentUser.preds[`k-${m.id}-a`];
            if(h === undefined || h === "" || a === undefined || a === "") missing = true;
        }
    }
    if(missing) return alert("⚠️ Faltan marcadores. Debes llenar todo.");
    if(confirm(`¿Confirmar envío de ${phase.toUpperCase()}?`)) {
        currentUser.locks[phase] = true;
        saveUser(true);
        renderGroups(); renderBracket();
    }
}

function saveAdminData(showMsg) {
    // Leer reglas básicas
    if(document.getElementById('rule-exact')) {
        rules.exact = parseInt(document.getElementById('rule-exact').value) || 0;
        rules.diff = parseInt(document.getElementById('rule-diff').value) || 0;
        rules.winner = parseInt(document.getElementById('rule-winner').value) || 0;
        rules.groupExact = parseInt(document.getElementById('rule-group-exact').value) || 0;
        rules.groupMix = parseInt(document.getElementById('rule-group-mix').value) || 0;
        rules.groupOne = parseInt(document.getElementById('rule-group-one').value) || 0;
    }

    // Actualizar LocalStorage
    localStorage.setItem('m26_rules', JSON.stringify(rules));
    localStorage.setItem('m26_official', JSON.stringify(officialRes));
    localStorage.setItem('m26_official_teams', JSON.stringify(officialTeams));

    // Leer Checkboxes
    if(document.getElementById('check-groups')) {
        phaseControl.groups = document.getElementById('check-groups').checked;
        phaseControl.r32 = document.getElementById('check-r32').checked;
        phaseControl.r16 = document.getElementById('check-r16').checked;
        phaseControl.qf = document.getElementById('check-qf').checked;
        phaseControl.sf = document.getElementById('check-sf').checked;
        phaseControl.f = document.getElementById('check-f').checked;
        localStorage.setItem('m26_phase_control', JSON.stringify(phaseControl));
    }
    
    // 👇 GUARDADO LÁSER DE CONFIGURACIÓN (Seguro y Específico) 👇
    // En lugar de 'saveToCloud()', guardamos cada cosa en su cajón.
    db.ref('/m26_rules').set(rules);
    db.ref('/phaseControl').set(phaseControl);
    db.ref('/officialTeams').set(officialTeams); // Por si cargó clasificados

    if(showMsg) alert("Admin: Configuración Guardada en la Nube ☁️");
    renderBracket();
}

function calculatePoints(preds, locks) {
    let p = preds || currentUser.preds;
    let l = locks || currentUser.locks;
    let total = 0;

    // 1. PUNTOS POR PARTIDOS (GRUPOS)
    if(l.groups) {
        for(let g in GROUPS_CONFIG) {
            GROUPS_CONFIG[g].matches.forEach((m,i) => {
                let id = `${g}-${i}`;
                total += calcMatchPts(p[`h-${id}`], p[`a-${id}`], officialRes[`h-${id}`], officialRes[`a-${id}`]);
            });
        }
    }

    // 2. PUNTOS POR PARTIDOS (FASES FINALES)
    let phaseMap = { '32': 'r32', '16': 'r16', '8': 'qf', '4': 'sf', '2': 'f' };
    let allKeys = Object.keys(officialRes).filter(k => k.startsWith('k-'));
    let processedMatches = new Set();
    allKeys.forEach(k => {
        let parts = k.split('-');
        let matchId = parts[1] + '-' + parts[2];
        let phaseKey = phaseMap[parts[1]];
        if(l[phaseKey] && !processedMatches.has(matchId)) {
            processedMatches.add(matchId);
            total += calcMatchPts(p[`k-${matchId}-h`], p[`k-${matchId}-a`], officialRes[`k-${matchId}-h`], officialRes[`k-${matchId}-a`]);
        }
    });

    // 3. BONUS DE CLASIFICADOS (GRUPOS) - NUEVA LÓGICA
    if(l.groups) {
        // Calculamos las posiciones simuladas del USUARIO y del OFICIAL
        let userSim = calculateSimulatedTeams(p); 
        let officialSim = calculateSimulatedTeams(officialRes); 

        for(let g in GROUPS_CONFIG) {
            // Equipos del usuario (1ro y 2do)
            let u1 = userSim[g+'1']; 
            let u2 = userSim[g+'2'];
            
            // Equipos oficiales (1ro y 2do)
            let o1 = officialSim[g+'1']; 
            let o2 = officialSim[g+'2'];

            // Solo damos puntos si el grupo oficial YA se definió (no es undefined ni "3er")
            // y si los equipos son nombres reales
            if(o1 && o2 && !o1.includes('3er') && !o2.includes('3er')) {
                if (u1 === o1 && u2 === o2) {
                    // Acierto EXACTO (Orden perfecto)
                    total += (rules.groupExact || 0);
                } else if ((u1 === o2 && u2 === o1)) {
                    // Acierto MIXTO (Están los dos, pero orden invertido)
                    total += (rules.groupMix || 0);
                } else if (u1 === o1 || u1 === o2 || u2 === o1 || u2 === o2) {
                    // Acierto PARCIAL (Le pegó a uno de los dos)
                    total += (rules.groupOne || 0);
                }
            }
        }
    }

    if(!preds) {
        if(l.groups || l.f) document.getElementById('total-points').innerText = total;
        else document.getElementById('total-points').innerText = "--";
    }
    return total;
}

function calcMatchPts(uH, uA, oH, oA) {
    if(!uH || !uA || !oH || !oA) return 0;
    uH=parseInt(uH); uA=parseInt(uA); oH=parseInt(oH); oA=parseInt(oA);
    if(uH===oH && uA===oA) return rules.exact;
    let uS = Math.sign(uH-uA), oS = Math.sign(oH-oA);
    if(uS!==oS) return 0;
    if(uS!==0 && (uH-uA === oH-oA)) return rules.diff;
    return rules.winner;
}

/* =========================================================
   8. REPORTES Y MODALES
   ========================================================= */
function showReport() {
    document.getElementById('modal-title').innerText = "TABLA DE LIDERES";
    document.getElementById('modal-overlay').style.display = 'flex';
    let players = [];
    for(let i=0; i<localStorage.length; i++) {
        let k = localStorage.key(i);
        if(k.startsWith('m26_data_')) players.push(JSON.parse(localStorage.getItem(k)));
    }
    let active = players.filter(p => p.locks && p.locks.groups);
    active.forEach(p => p.pts = calculatePoints(p.preds, p.locks));
    active.sort((a,b) => b.pts - a.pts);
    
    let html = `<table class="ranking-table"><tr><th>#</th><th>JUGADOR</th><th>PTS</th></tr>`;
    active.forEach((r,i) => html+=`<tr class="${r.name===currentUser.name?'my-row':''}"><td>${i+1}</td><td>${r.name}</td><td>${r.pts}</td></tr>`);
    document.getElementById('report-content').innerHTML = html + "</table>";
}

function openUserManagement() {
    document.getElementById('modal-title').innerText = "GESTION USUARIOS";
    document.getElementById('modal-overlay').style.display = 'flex';
    let players = [];
    for(let i=0; i<localStorage.length; i++) {
        let k = localStorage.key(i);
        if(k.startsWith('m26_data_')) players.push(JSON.parse(localStorage.getItem(k)));
    }
    let html = `<table class="ranking-table"><tr><th>JUGADOR</th><th>ESTADO</th><th>ACCIÓN</th></tr>`;
    players.forEach(p => {
        let isLocked = (p.locks && (p.locks.groups));
        let status = isLocked ? '<span style="color:var(--neon-green)">OFICIAL</span>' : '<span style="color:var(--neon-gold)">BORRADOR</span>';
        let btn = isLocked ? `<button class="btn-enter" style="padding:5px; font-size:0.7rem; width:auto;" onclick="unlockPlayer('${p.name}')">RESET</button>` : '-';
        html += `<tr><td>${p.name}</td><td>${status}</td><td>${btn}</td></tr>`;
    });
    document.getElementById('report-content').innerHTML = html + "</table>";
}

function unlockPlayer(name) {
    if(confirm(`¿Resetear a ${name}?`)) {
        const key = `m26_data_${name}`;
        let p = JSON.parse(localStorage.getItem(key));
        if(p) {
            p.locks = { groups: false, r32: false, r16: false, qf: false, sf: false, f: false };
            localStorage.setItem(key, JSON.stringify(p));
            alert("Reset OK");
            openUserManagement();
        }
    }
}

/* =========================================================
   NUEVA FUNCION: RENDERIZADO DE RESULTADOS REALES
   ========================================================= */
function renderRealResults() {
    const container = document.getElementById('real-container');
    container.innerHTML = '';
    
    // Recorremos los grupos igual que antes
    for(let g in GROUPS_CONFIG) {
        const data = GROUPS_CONFIG[g];
        let matchesHTML = '';
        
        // Tabla de posiciones REAL (solo con datos oficiales)
        let teamStats = data.teams.map(n => ({ name: n, pts: 0, dif: 0 }));
        
        data.matches.forEach((m, idx) => {
            let id = `${g}-${idx}`;
            
            // AQUI ESTA EL CAMBIO: Solo leemos officialRes
            let oH = officialRes[`h-${id}`]; 
            let oA = officialRes[`a-${id}`];
            
            // Si el admin no ha puesto nada, mostramos vacio
            let valH = (oH !== undefined) ? oH : '';
            let valA = (oA !== undefined) ? oA : '';

            // Solo calculamos tabla si hay dato oficial
            if(valH !== '' && valA !== '') {
                updateStats(teamStats, m.t1, m.t2, parseInt(valH), parseInt(valA));
            }
            
            // Inputs DESHABILITADOS (disabled) para que nadie edite aquí
            matchesHTML += `
            <div class="match-row">
                <div class="team-name team-home">${data.teams[m.t1]}</div>
                <div class="center-inputs">
                    <div class="match-info">${m.info}</div>
                    <div class="score-container">
                        <input type="number" value="${valH}" disabled style="background:#222; color:#fff; border:1px solid #444;">
                        <span style="color:#666">-</span>
                        <input type="number" value="${valA}" disabled style="background:#222; color:#fff; border:1px solid #444;">
                    </div>
                </div>
                <div class="team-name team-away">${data.teams[m.t2]}</div>
            </div>`;
        });

        // Ordenar tabla real
        teamStats.sort((a,b) => b.pts - a.pts || b.dif - a.dif);
        let tableRows = teamStats.map((t,i) => `<tr class="${i<2?'qual-zone':''}">
            <td class="pos-num">${i+1}</td><td>${t.name}</td><td>${t.pts}</td><td>${t.dif}</td>
        </tr>`).join('');
        
        // Agregar tarjeta al grid (Note el título con [OFICIAL])
        container.innerHTML += `
        <div class="card" style="border-color:var(--neon-green);">
            <div class="group-header" style="color:var(--neon-green);">GRUPO ${g} [OFICIAL]</div>
            <div class="card-body">
                ${matchesHTML}
                <table><tr><th>#</th><th>EQ</th><th>PTS</th><th>DIF</th></tr>${tableRows}</table>
            </div>
        </div>`;
    }
}

/* =========================================================
   NUEVAS FUNCIONES: RENDERIZADO DE BRACKET REAL (OFICIAL)
   (Pegar esto al final del archivo js/app.js)
   ========================================================= */

function renderRealBracket() {
    const container = document.getElementById('real-bracket-container');
    if (!container) return;
    container.innerHTML = '';
    
    // Calculamos los equipos simulados basados EXCLUSIVAMENTE en resultados oficiales
    let officialSim = calculateSimulatedTeams(officialRes);
    
    let html = '';
    // Aquí es donde la "Jefa" llama a la "Obrera" (renderRealRoundColumn)
    html += renderRealRoundColumn('16avos', R32_MATCHUPS, officialSim);
    html += renderRealRoundColumn('Octavos', R16_MATCHUPS, officialSim);
    html += renderRealRoundColumn('Cuartos', QF_MATCHUPS, officialSim);
    html += renderRealRoundColumn('Semis', SF_MATCHUPS, officialSim);
    html += renderRealRoundColumn('Final', F_MATCHUPS, officialSim);
    
    container.innerHTML = html;
}

function renderRealRoundColumn(title, matchups, simTeams) {
    let html = `<div class="round-column"><div class="round-header" style="border-color:var(--neon-green); color:var(--neon-green);"><span class="round-title">${title}</span></div>`;
    
    matchups.forEach(m => {
        // Resolvemos nombres usando SOLO datos oficiales
        let resolveName = (slot, code) => {
            if (officialTeams[`${m.id}-${slot}`]) return officialTeams[`${m.id}-${slot}`];
            if (simTeams[code]) return simTeams[code];
            return code;
        };

        let nameH = resolveName('h', m.h);
        let nameA = resolveName('a', m.a);
        
        let scH = officialRes[`k-${m.id}-h`] || ''; 
        let scA = officialRes[`k-${m.id}-a`] || '';

        html += `
        <div class="bracket-match" style="border-color:var(--neon-green);">
            <div class="bracket-row">
                <span class="b-team" title="${nameH}">${nameH}</span>
                <input type="number" class="bracket-input" value="${scH}" disabled style="background:#222; color:#fff; border:1px solid #444;">
            </div>
            <div class="bracket-row">
                <span class="b-team" title="${nameA}">${nameA}</span>
                <input type="number" class="bracket-input" value="${scA}" disabled style="background:#222; color:#fff; border:1px solid #444;">
            </div>
        </div>`;
    });
    return html + `</div>`;
}

/* =========================================================
   LÓGICA DE MEJORES TERCEROS (FIFA RULES)
   ========================================================= */

// Función principal que abre el modal y renderiza
function showThirdsTable() {
    // 1. Determinar fuente de datos
    let sourceData;
    
    // CORRECCIÓN: Si soy Admin, SIEMPRE uso officialRes.
    if (role === 'admin') {
        sourceData = officialRes;
    } else {
        // Si soy Fan, dependo de qué pestaña estoy viendo
        let isOfficialView = document.getElementById('tab-real').classList.contains('active');
        sourceData = isOfficialView ? officialRes : currentUser.preds;
    }

    // 2. Calcular los terceros
    let thirdsList = calculateThirdsList(sourceData);

    // 3. Generar HTML
    let tbody = document.querySelector('#thirds-table-content tbody');
    tbody.innerHTML = '';

    thirdsList.forEach((team, index) => {
        // Los primeros 8 clasifican (Verde), los otros 4 eliminados (Rojo oscuro)
        let isQualified = index < 8;
        let rowColor = isQualified ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 0, 85, 0.1)';
        let fontColor = isQualified ? '#fff' : '#777';
        let qualIndicator = isQualified ? '✅' : '❌';

        let html = `
            <tr style="background:${rowColor}; color:${fontColor}; border-bottom:1px solid #333;">
                <td style="font-weight:bold; color:${isQualified ? 'var(--neon-green)' : 'var(--neon-pink)'}">${index + 1}</td>
                <td style="color:var(--neon-gold); font-weight:bold;">${team.group}</td>
                <td style="font-weight:bold;">${team.name} ${qualIndicator}</td>
                <td style="font-weight:900; color:white;">${team.pts}</td>
                <td>${team.pj}</td>
                <td>${team.pg}</td>
                <td>${team.pe}</td>
                <td>${team.pp}</td>
                <td>${team.gf}</td>
                <td>${team.gc}</td>
                <td>${team.dif > 0 ? '+'+team.dif : team.dif}</td>
            </tr>
        `;
        tbody.innerHTML += html;
    });

    // 4. Mostrar Modal
    document.getElementById('modal-thirds-overlay').style.display = 'flex';
}

// Función auxiliar para calcular estadísticas completas
function calculateThirdsList(sourceData) {
    let allThirds = [];

    // Recorremos cada grupo para encontrar su 3ro
    for(let g in GROUPS_CONFIG) {
        let teams = GROUPS_CONFIG[g].teams;
        let stats = teams.map(name => ({
            name: name, group: g, 
            pts: 0, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dif: 0
        }));

        GROUPS_CONFIG[g].matches.forEach((m, idx) => {
            let id = `${g}-${idx}`;
            let h = sourceData[`h-${id}`];
            let a = sourceData[`a-${id}`];

            if(h !== undefined && h !== "" && a !== undefined && a !== "") {
                h = parseInt(h); a = parseInt(a);
                let t1 = stats[m.t1];
                let t2 = stats[m.t2];
                
                t1.pj++; t2.pj++;
                t1.gf += h; t1.gc += a; t1.dif = t1.gf - t1.gc;
                t2.gf += a; t2.gc += h; t2.dif = t2.gf - t2.gc;

                if(h > a) { t1.pts += 3; t1.pg++; t2.pp++; }
                else if(a > h) { t2.pts += 3; t2.pg++; t1.pp++; }
                else { t1.pts++; t2.pts++; t1.pe++; t2.pe++; }
            }
        });

        // Ordenar tabla del grupo (Pts > Dif > GF)
        stats.sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);

        // Tomamos el 3ro (índice 2)
        // OJO: Si el grupo no tiene datos, igual tomamos el nombre del equipo en pos 3
        let thirdTeam = stats[2];
        allThirds.push(thirdTeam);
    }

    // AHORA ORDENAMOS LA TABLA DE TERCEROS (Reglas FIFA)
    // 1. Puntos, 2. Diferencia, 3. Goles a Favor, 4. Partidos Ganados
    allThirds.sort((a,b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dif !== a.dif) return b.dif - a.dif;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return b.pg - a.pg;
    });

    return allThirds;
}

/* =========================================================
   FUNCIONES DE LA NUEVA BARRA DE HERRAMIENTAS
   ========================================================= */

// Función para SALIR (Recarga la página y vuelve al login)
function logout() {
    location.reload();
}

// Función GUARDAR INTELIGENTE
// Detecta si el panel de admin está visible para saber qué guardar
function smartSave() {
    const adminBar = document.getElementById('admin-status-bar');
    
    // Si la barra de admin se ve, es porque soy Admin
    if (adminBar && adminBar.style.display !== 'none') {
        saveAdminData(true); // Guarda Config y Resultados
    } else {
        saveUser(false); // Guarda Pronósticos del Fan
    }
}

/* =========================================================
   MEJORAS DEL LOGIN (Enter y Ver Password)
   ========================================================= */

// 1. Función para mostrar/ocultar contraseña
function togglePass() {
    const passInput = document.getElementById('password');
    const icon = document.getElementById('eye-icon');
    
    if (passInput.type === 'password') {
        passInput.type = 'text'; // Mostrar texto
        icon.innerText = '🙈';   // Cambiar icono a "monito tapándose"
    } else {
        passInput.type = 'password'; // Ocultar
        icon.innerText = '👁️';   // Volver al ojo normal
    }
}

// 2. Escuchar la tecla ENTER en los campos de texto
// Esto se ejecuta apenas carga el archivo
document.addEventListener('DOMContentLoaded', () => {
    const inputUser = document.getElementById('username');
    const inputPass = document.getElementById('password');

    // Función auxiliar para activar el login con Enter
    const triggerLogin = (event) => {
        if (event.key === 'Enter') {
            handleLogin(); // Llamamos a su función original de entrar
        }
    };

    if(inputUser) inputUser.addEventListener('keypress', triggerLogin);
    if(inputPass) inputPass.addEventListener('keypress', triggerLogin);
});

/* =========================================================
   CÁLCULO GLOBAL DE PROYECCIONES (FIFA)
   Calcula posiciones, mejores terceros y llena las llaves.
   ========================================================= */
function updateGlobalProjections() {
    console.log("🔄 Calculando proyecciones FIFA...");

    const standings = {};
    // Decidimos qué fuente de datos usar (Fan u Oficial)
    const predsSource = role === 'admin' ? officialRes : currentUser.preds;

    // 1. CALCULAR TABLAS DE TODOS LOS GRUPOS
    Object.keys(GROUPS_CONFIG).forEach(gid => {
        const groupData = GROUPS_CONFIG[gid];
        // Estructura temporal para cálculo
        let teamsMap = groupData.teams.map((name, idx) => ({ 
            name: name, 
            group: gid,
            pts: 0, dif: 0, gf: 0, gc: 0 
        }));

        groupData.matches.forEach((m, idx) => {
            let id = `${gid}-${idx}`;
            // Buscar predicción H y A (ajuste las claves según como las guarde su app)
            // NOTA: Su app usa claves tipo 'h-A-0'.
            let vH = predsSource[`h-${id}`];
            let vA = predsSource[`a-${id}`];

            if(vH && vA && vH !== '' && vA !== '') { 
                let sH = parseInt(vH); let sA = parseInt(vA);
                
                // Sumar stats
                teamsMap[m.t1].gf += sH; teamsMap[m.t1].gc += sA; teamsMap[m.t1].dif += (sH-sA);
                teamsMap[m.t2].gf += sA; teamsMap[m.t2].gc += sH; teamsMap[m.t2].dif += (sA-sH);
                
                if(sH > sA) teamsMap[m.t1].pts+=3;
                else if(sA > sH) teamsMap[m.t2].pts+=3;
                else { teamsMap[m.t1].pts+=1; teamsMap[m.t2].pts+=1; }
            }
        });

        // ORDENAMIENTO FIFA (PTS > DIF > GF)
        teamsMap.sort((a,b) => {
            if(b.pts !== a.pts) return b.pts - a.pts;
            if(b.dif !== a.dif) return b.dif - a.dif;
            return b.gf - a.gf;
        });

        standings[gid] = teamsMap;
    });

    // 2. ENCONTRAR MEJORES TERCEROS
    let thirds = [];
    Object.keys(standings).forEach(g => {
        // El equipo en índice 2 es el 3ro del grupo
        let t = standings[g][2]; 
        if(t) thirds.push(t);
    });

    // Ordenar los terceros entre sí para sacar los Top 8
    thirds.sort((a,b) => {
        if(b.pts !== a.pts) return b.pts - a.pts;
        if(b.dif !== a.dif) return b.dif - a.dif;
        return b.gf - a.gf;
    });
    
    // Tomamos los 8 mejores
    let bestThirds = thirds.slice(0, 8); 

    // 3. MAPEAR A LAS LLAVES (Round of 32)
    const projectedR32 = {};
    
    // Función auxiliar para traducir códigos (Ej: "A1" -> "México")
    const resolveTeam = (code) => {
        if(!code) return '...';
        let type = code.charAt(0); // 'A', 'B' ... o 'T' (Tercero)
        let idx = parseInt(code.charAt(1)) - 1; // 1 -> 0

        // Caso Clasificado Directo (A1, A2...)
        if(type !== 'T') {
            if(standings[type] && standings[type][idx]) {
                return standings[type][idx].name;
            }
        } 
        // Caso Mejor Tercero (T1, T2...)
        else {
            // T1 es el mejor tercero #1. 
            if(bestThirds[idx]) {
                return `(3${bestThirds[idx].group}) ${bestThirds[idx].name}`;
            }
        }
        return '...'; // Si no hay datos aún
    };

    // Usamos la configuración de data.js
    if(typeof R32_MATCHUPS !== 'undefined') {
        R32_MATCHUPS.forEach(m => {
            projectedR32[m.id] = {
                homeTeam: resolveTeam(m.h),
                awayTeam: resolveTeam(m.a)
            };
        });
    }

    // 4. GUARDAR EN MEMORIA DEL USUARIO
    if(!currentUser.computed) currentUser.computed = {};
    currentUser.computed.r32 = projectedR32;
    
    // Nota: No llamamos a renderBracket() aquí porque estamos en la vista de Grupos.
    // Cuando el usuario cambie de pestaña, el renderBracket leerá 'currentUser.computed.r32'.
}

/* =========================================================
   REFRESCO QUIRÚRGICO DE TABLA (Solo actualiza un grupo)
   ========================================================= */
function refreshGroupTable(gid) {
    const groupData = GROUPS_CONFIG[gid];
    if(!groupData) return;

    // 1. Recalcular Stats solo de este grupo
    let teamStats = groupData.teams.map(n => ({ name: n, pts: 0, dif: 0, gf: 0, gc: 0 }));
    const predsSource = role === 'admin' ? officialRes : currentUser.preds;

    groupData.matches.forEach((m, idx) => {
        let id = `${gid}-${idx}`;
        let vH = predsSource[`h-${id}`];
        let vA = predsSource[`a-${id}`];

        if(vH && vA && vH !== '' && vA !== '') { 
            let sH = parseInt(vH); let sA = parseInt(vA);
            teamStats[m.t1].gf += sH; teamStats[m.t1].gc += sA; teamStats[m.t1].dif += (sH - sA);
            teamStats[m.t2].gf += sA; teamStats[m.t2].gc += sH; teamStats[m.t2].dif += (sA - sH);
            if(sH > sA) teamStats[m.t1].pts += 3;
            else if(sA > sH) teamStats[m.t2].pts += 3;
            else { teamStats[m.t1].pts += 1; teamStats[m.t2].pts += 1; }
        }
    });

    // 2. Ordenar FIFA
    teamStats.sort((a,b) => (b.pts - a.pts) || (b.dif - a.dif) || (b.gf - a.gf));

    // 3. Generar HTML de las filas
    let newRows = teamStats.map((t,i) => 
        `<tr class="${i<2?'qual-zone':''}">
            <td class="pos-num">${i+1}</td>
            <td style="text-align:left; padding-left:5px;">${t.name}</td>
            <td style="font-weight:bold; color:#fff; font-size:0.95rem;">${t.pts}</td>
            <td style="color:#888;">${t.dif}</td>
            <td style="color:#888;">${t.gf}</td>
            <td style="color:#888;">${t.gc}</td>
         </tr>`
    ).join('');

    // 4. Inyectar SOLO en el cuerpo de la tabla (No toca los inputs)
    let tbody = document.getElementById(`tbody-${gid}`);
    if(tbody) tbody.innerHTML = newRows;
}

/* =========================================================
   PERSISTENCIA DE DATOS (CORREGIDO CON FIREBASE ☁️)
   ========================================================= */
function saveUsersDB() {
    if(role === 'admin') {
        // Si por error entra aquí siendo admin, guardamos oficiales
        localStorage.setItem('m26_official', JSON.stringify(officialRes));
    } else {
        // Buscar y actualizar usuario en la lista global
        let idx = users.findIndex(u => u.name === currentUser.name); // Ojo: usé .name, no .username
        
        if(idx !== -1) {
            users[idx] = currentUser;
        } else {
            // Si no está, lo agregamos
            if(currentUser.name) users.push(currentUser);
        }
        
        // Guardar backup local
        localStorage.setItem('m26_users', JSON.stringify(users));
        localStorage.setItem('m26_currentUser', JSON.stringify(currentUser));
    }

    // 👇 LA LÍNEA MÁGICA: ¡SUBIR A LA NUBE! 👇
    saveToCloud(); 
    
    console.log("💾 Datos guardados y sincronizados con la nube.");
}

/* =========================================================
   ACTUALIZAR GANADOR (PENALES) - BLINDADO 🛡️
   ========================================================= */
function updateWinner(matchId, type, isChecked) {
    // 1. Si es modo oficial (Fan mirando), no hace nada.
    if (currentViewMode === 'official') return;

    // 2. Seleccionar qué base de datos modificar
    let targetDB;
    if (currentViewMode === 'admin') {
        targetDB = officialRes;
    } else {
        targetDB = currentUser.preds;
    }

    let key = `w-${matchId}`;

    // 3. LÓGICA DE GUARDADO (AQUÍ ESTÁ EL CAMBIO "LÁSER" 🔫)
    if (isChecked) {
        // --- CASO A: MARCAR (GUARDAR) ---
        targetDB[key] = type; // Actualiza memoria local

        if (currentViewMode === 'admin') {
            // Guardar en LocalStorage
            localStorage.setItem('m26_official', JSON.stringify(officialRes));
            
            // 🔥 GUARDADO LÁSER EN NUBE: Solo actualiza este dato específico
            db.ref('/officialRes/' + key).set(type); 
        }

    } else {
        // --- CASO B: DESMARCAR (BORRAR) ---
        delete targetDB[key]; // Borra de memoria local

        if (currentViewMode === 'admin') {
            // Guardar en LocalStorage
            localStorage.setItem('m26_official', JSON.stringify(officialRes));
            
            // 🔥 BORRADO LÁSER EN NUBE: Elimina solo este dato
            db.ref('/officialRes/' + key).remove();
        }
    }

    // 4. Persistencia para el Fan (Sigue igual)
    if (currentViewMode !== 'admin') {
        if (typeof saveUsersDB === 'function') saveUsersDB();
    }

    // 5. Refrescar Pantalla
    if (typeof renderBracketView === 'function') renderBracketView(targetDB, currentViewMode);
    else renderBracket(targetDB, currentViewMode);
}

/* =========================================================
   NUEVO SISTEMA DE VISTAS (User vs Official)
   ========================================================= */

let currentViewMode = 'user'; // 'user' o 'official'
let currentPhase = 'groups';

// Esta es la función que llaman los botones nuevos
function loadView(mode, phase) {
    currentViewMode = mode; 
    currentPhase = phase;
    console.log(`Cargando vista: ${mode} - ${phase}`);

    // 1. TÍTULOS DINÁMICOS Y COLORES
    const titleEl = document.getElementById('view-title');
    if(titleEl) {
        if (phase === 'settings') {
            titleEl.innerText = "⚙️ CONFIGURACIÓN DEL SISTEMA";
            titleEl.style.color = "#ff4444"; // Rojo Admin
        } else {
            // Títulos normales
            let titleText = (mode === 'user') ? "👤 Mis Pronósticos" : "🏆 Resultados Oficiales";
            if(mode === 'admin') titleText = "📝 Ingreso de Resultados (Admin)";
            
            titleText += (phase === 'groups') ? " - Fase de Grupos" : " - Fase Final";
            titleEl.innerText = titleText;
            
            // Colores: User (Blanco), Oficial (Dorado), Admin (Dorado también o Rojo si prefiere)
            if (mode === 'user') titleEl.style.color = "#fff";
            else titleEl.style.color = "#ffd700"; 
        }
    }

    // 2. GESTIONAR BOTONES ACTIVOS (ILUMINAR) 💡
    document.querySelectorAll('.dash-btn').forEach(b => b.classList.remove('active'));
    
    let btnId = '';
    // Lógica Fan
    if (mode === 'user' && phase === 'groups') btnId = 'btn-user-groups';
    if (mode === 'user' && phase === 'final') btnId = 'btn-user-final';
    
    // Lógica Admin (NUEVO)
    if (mode === 'admin' && phase === 'groups') btnId = 'btn-admin-groups';
    if (mode === 'admin' && phase === 'final')  btnId = 'btn-admin-final';
    if (mode === 'admin' && phase === 'settings') btnId = 'btn-admin-settings';
    
    // Lógica Oficial (Fan viendo resultados)
    if (mode === 'official' && phase === 'groups') btnId = 'btn-off-groups';
    if (mode === 'official' && phase === 'final') btnId = 'btn-off-final';

    const activeBtn = document.getElementById(btnId);
    if(activeBtn) activeBtn.classList.add('active');

    // 3. OCULTAR TODOS LOS CONTENEDORES 🙈
    // Usamos sus IDs: tab-groups, tab-bracket
    const grpCont = document.getElementById('tab-groups'); 
    const brkCont = document.getElementById('tab-bracket');
    const setCont = document.getElementById('tab-settings'); // El de configuración
    const realCont = document.getElementById('tab-real');    // El viejo (por si acaso)
    
    if(grpCont) grpCont.style.display = 'none';
    if(brkCont) brkCont.style.display = 'none';
    if(setCont) setCont.style.display = 'none'; 
    if(realCont) realCont.style.display = 'none';

    // 4. CONTROL DE CAJA DE ENVIAR (Solo Fan en Grupos)
    const submitArea = document.getElementById('submit-groups-area');
    if (submitArea) {
        if (mode === 'user' && phase === 'groups') submitArea.style.display = 'block';
        else submitArea.style.display = 'none';
    }

    // ============================================================
    // 5. CASO ESPECIAL: CONFIGURACIÓN ⚙️
    // ============================================================
    if (phase === 'settings') {
        if(setCont) setCont.style.display = 'block';
        // Si es config, terminamos aquí. No cargamos partidos.
        return; 
    }

    // 6. SELECCIÓN DE DATOS
    // Si es 'user' -> currentUser.preds
    // Si es 'admin' u 'official' -> officialRes
    // 6. SELECCIÓN DE DATOS (BLINDADO 🛡️)
    let dataSource;
    if (mode === 'user') {
        // Si currentUser.preds es undefined, usamos {}
        dataSource = (currentUser && currentUser.preds) ? currentUser.preds : {};
    } else {
        dataSource = officialRes || {};
    }

    // 7. RENDERIZAR VISTAS
    if (phase === 'groups') {
        if(grpCont) grpCont.style.display = 'block';
        renderGroups(dataSource, mode);
    } else {
        if(brkCont) brkCont.style.display = 'block'; // O 'flex' según su CSS
        renderBracketView(dataSource, mode);
    }
}

// Adaptador para el Árbol
/* =========================================================
   RENDERIZADOR DEL ÁRBOL (Fase Final) - INTELIGENTE 🧠
   ========================================================= */
function renderBracketView(customData, customMode) {
    // 1. Apuntar al contenedor correcto
    // OJO AQUÍ: Asegúrate de que en tu HTML tengas <div id="bracket-container"> dentro de tab-bracket
    const container = document.getElementById('bracket-container'); 
    if(!container) return;
    
    container.innerHTML = ''; // Limpiar pizarra

    // 2. Definir Datos y Modo
    let dataToUse = customData || currentUser.preds;
    let modeToUse = customMode || 'user';

    // Si es Admin en modo oficial, forzamos officialRes
    if (role === 'admin' && modeToUse === 'official') {
        dataToUse = officialRes;
    }

    // 3. CALCULAR LOS EQUIPOS QUE PASAN (Simulación)
    // Importante: Calculamos quién juega contra quién basado en LA DATA QUE ELEGIMOS
    simulatedTeams = calculateSimulatedTeams(dataToUse); 

    // 4. DIBUJAR LAS COLUMNAS (Pasando la data y el modo hacia abajo) 👇
    // Fíjate que al final de cada línea pasamos (dataToUse, modeToUse)
    
    container.innerHTML += renderRoundColumn('16avos', R32_MATCHUPS, 'r32', 'r32', dataToUse, modeToUse);
    container.innerHTML += renderRoundColumn('Octavos', R16_MATCHUPS, 'r16', 'r16', dataToUse, modeToUse);
    container.innerHTML += renderRoundColumn('Cuartos', QF_MATCHUPS, 'qf', 'qf', dataToUse, modeToUse);
    container.innerHTML += renderRoundColumn('Semis', SF_MATCHUPS, 'sf', 'sf', dataToUse, modeToUse);
    container.innerHTML += renderRoundColumn('Final', F_MATCHUPS, 'f', 'f', dataToUse, modeToUse);
    
    // Si tienes partido de 3er puesto, agrégalo aquí también
}

/* =========================================================
   ☁️ CEREBRO DE FIREBASE (SINCRONIZACIÓN)
   ========================================================= */


// 1. ESCUCHAR CAMBIOS (Bajar datos de la nube) 📡
// VERSIÓN BLINDADA FINAL 🛡️
// 1. ESCUCHAR CAMBIOS (VERSIÓN FINAL CON BANDERA isEditing 🚩)
function startFirebaseListener() {
    console.log("📡 Conectando antena al satélite...");
    
    db.ref('/').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return console.log("☁️ Nube vacía.");

        // 1. Carga de datos
        if (data.users) users = data.users;
        officialRes = data.officialRes || {}; 
        if (data.phaseControl) phaseControl = data.phaseControl;
        if (data.officialTeams) officialTeams = data.officialTeams;
        if (data.simulatedTeams) simulatedTeams = data.simulatedTeams;

        // 2. Actualizar Usuario Local
        if (currentUser && currentUser.name) {
            const foundUser = users.find(u => u.name === currentUser.name);
            if (foundUser) {
                currentUser = foundUser;
                if (!currentUser.preds) currentUser.preds = {};
                if (!currentUser.locks) currentUser.locks = { groups: false, r32: false, r16: false, qf: false, sf: false, f: false };
                localStorage.setItem('m26_currentUser', JSON.stringify(currentUser));
            }
        }

        // 🛑 BLOQUEO TOTAL SI ESTÁ EDITANDO 🛑
        // Si la bandera está arriba, NO REPINTAMOS NADA VISUAL.
        if (isEditing) {
            console.log("🤫 Usuario editando. Silenciando repintado.");
            // Solo actualizamos cálculos de fondo, pero no tocamos el HTML
            if (typeof updateStatusUI === 'function') updateStatusUI();
            return; 
        }

        // 3. Refresco Visual (Solo si la bandera está abajo)
        if (typeof loadView === 'function') {
            if (currentViewMode === 'official') {
                loadView('official', currentPhase || 'groups');
            }
            else if (currentViewMode === 'user') {
                loadView('user', currentPhase || 'groups');
            }
        }
        
        if (typeof updateStatusUI === 'function') updateStatusUI();
        if (typeof renderRanking === 'function') renderRanking();
    });
}

// 2. GUARDAR CAMBIOS (NEUTRALIZADO PARA NO BORRAR RESULTADOS 🛡️)
function saveToCloud() {
    console.log("☁️ Sincronizando usuarios con la nube...");
    
    // SOLO enviamos lo que es seguro sobrescribir masivamente (Usuarios)
    // Quitamos officialRes, officialTeams y phaseControl de aquí para evitar accidentes.
    const payload = {
        users: users,
        lastUpdate: new Date().toISOString()
    };

    db.ref('/').update(payload)
        .then(() => console.log("✅ Usuarios sincronizados."))
        .catch((e) => console.error("❌ Error guardando:", e));
}

/* =========================================================
   🚀 TURBO NAVEGACIÓN (ENTER PARA SALTAR)
   Permite llenar la quiniela rápido usando la tecla Enter.
   ========================================================= */
document.addEventListener('keydown', function(event) {
    // Solo nos interesa si presiona ENTER
    if (event.key === 'Enter') {
        const target = event.target;

        // Verificamos que sea uno de nuestros inputs de goles
        // (Son inputs tipo número y que NO estén deshabilitados)
        if (target.tagName === 'INPUT' && target.type === 'number' && !target.disabled) {
            
            event.preventDefault(); // Evitamos comportamientos raros del navegador
            
            // 1. Buscamos TODOS los inputs válidos en la pantalla
            // Esto crea una lista ordenada: [P1-Local, P1-Visitante, P2-Local, P2-Visitante...]
            const allInputs = Array.from(document.querySelectorAll('input[type="number"]:not([disabled])'));
            
            // 2. Encontramos dónde estamos parados
            const currentIndex = allInputs.indexOf(target);
            
            // 3. Si no somos el último, saltamos al siguiente
            if (currentIndex !== -1 && currentIndex < allInputs.length - 1) {
                const nextInput = allInputs[currentIndex + 1];
                
                // A. Poner el foco en el siguiente
                nextInput.focus(); 
                
                // B. ¡TRUCAZO! Seleccionar el texto para sobreescribir rápido
                // (Así no tiene que borrar el 0, solo escribe el número encima)
                nextInput.select(); 
            } else {
                // Si es el último input, quitamos el foco para indicar que acabó
                target.blur();
            }
        }
    }
});

/* =========================================================
   VIGILANTES DE FOCO (Para que no se cierre el teclado) 🕵️‍♂️
   ========================================================= */
document.addEventListener('focusin', (e) => {
    // Si entró a un input de números, ALZAR BANDERA
    if(e.target.matches('input[type="number"]')) {
        isEditing = true;
    }
});

document.addEventListener('focusout', (e) => {
    // Si salió, esperamos un poquito antes de bajar la bandera
    // por si acaso solo está saltando al siguiente input con Enter/Tab
    setTimeout(() => {
        // Solo bajamos la bandera si el nuevo elemento NO es un input
        const active = document.activeElement;
        if (!active || active.tagName !== 'INPUT' || active.type !== 'number') {
            isEditing = false;
        }
    }, 500); // 0.5 segundos de gracia
});