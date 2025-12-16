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

function initP() { particlesArray=[]; for(let i=0; i<60; i++) particlesArray.push(new Particle()); }
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
   2. CONFIGURACIÓN DE GRUPOS Y PARTIDOS
   ========================================================= */
const GROUPS_CONFIG = {
    'A': { teams: ['México', 'Egipto', 'Polonia', 'Corea'], matches: [{t1:0,t2:1,info:"11 Jun"},{t1:2,t2:3,info:"11 Jun"},{t1:0,t2:2,info:"18 Jun"},{t1:1,t2:3,info:"18 Jun"},{t1:0,t2:3,info:"24 Jun"},{t1:1,t2:2,info:"24 Jun"}] },
    'B': { teams: ['EEUU', 'Gales', 'Inglaterra', 'Irán'], matches: [{t1:0,t2:1,info:"12 Jun"},{t1:2,t2:3,info:"12 Jun"},{t1:0,t2:2,info:"17 Jun"},{t1:1,t2:3,info:"17 Jun"},{t1:0,t2:3,info:"22 Jun"},{t1:1,t2:2,info:"22 Jun"}] },
};
// Llenar resto de grupos vacíos por ahora
['C','D','E','F','G','H','I','J','K','L'].forEach(l => {
    if(!GROUPS_CONFIG[l]) GROUPS_CONFIG[l] = { teams: ['E1','E2','E3','E4'], matches: Array(6).fill({t1:0,t2:1,info:"--"}) };
});

const R32_MATCHUPS = [{id:'32-1', h:'A1', a:'B2'}, {id:'32-2', h:'C1', a:'D2'}, {id:'32-3', h:'E1', a:'F2'}, {id:'32-4', h:'G1', a:'H2'},{id:'32-5', h:'I1', a:'J2'}, {id:'32-6', h:'K1', a:'L2'}, {id:'32-7', h:'A2', a:'C2'}, {id:'32-8', h:'B1', a:'T1'},{id:'32-9', h:'D1', a:'T2'}, {id:'32-10', h:'E2', a:'F1'}, {id:'32-11', h:'G2', a:'H1'}, {id:'32-12', h:'I2', a:'J1'},{id:'32-13', h:'K2', a:'L1'}, {id:'32-14', h:'T3', a:'T4'}, {id:'32-15', h:'T5', a:'T6'}, {id:'32-16', h:'T7', a:'T8'}];
const R16_MATCHUPS = [{id:'16-1', h:'32-1', a:'32-2'}, {id:'16-2', h:'32-3', a:'32-4'}, {id:'16-3', h:'32-5', a:'32-6'}, {id:'16-4', h:'32-7', a:'32-8'},{id:'16-5', h:'32-9', a:'32-10'}, {id:'16-6', h:'32-11', a:'32-12'}, {id:'16-7', h:'32-13', a:'32-14'}, {id:'16-8', h:'32-15', a:'32-16'}];
const QF_MATCHUPS = [ {id:'8-1',h:'16-1',a:'16-2'}, {id:'8-2',h:'16-3',a:'16-4'}, {id:'8-3',h:'16-5',a:'16-6'}, {id:'8-4',h:'16-7',a:'16-8'} ];
const SF_MATCHUPS = [ {id:'4-1',h:'8-1',a:'8-2'}, {id:'4-2',h:'8-3',a:'8-4'} ];
const F_MATCHUPS = [ {id:'2-1',h:'4-1',a:'4-2'} ];

/* =========================================================
   3. ESTADO GLOBAL
   ========================================================= */
let currentUser = { name: '', preds: {}, locks: { groups: false, r32: false, r16: false, qf: false, sf: false, f: false } };
let role = 'fan';
let officialRes = JSON.parse(localStorage.getItem('m26_official')) || {};
let rules = JSON.parse(localStorage.getItem('m26_rules')) || { exact: 5, diff: 3, winner: 1 };
let phaseControl = JSON.parse(localStorage.getItem('m26_phase_control')) || { groups: true, r32: false, r16: false, qf: false, sf: false, f: false };
let officialTeams = JSON.parse(localStorage.getItem('m26_official_teams')) || {};
let simulatedTeams = {};

/* =========================================================
   4. FUNCIONES DE LOGIN Y MODO
   ========================================================= */
function handleLogin() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    if(!u) return alert("Ingresa usuario");
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    if(p === 'admin2026') setupAdminMode();
    else setupUserMode(u);
}

function setupAdminMode() {
    role = 'admin';
    document.getElementById('admin-status-bar').style.display = 'block';
    // Nota: El panel admin ya no se muestra/oculta aquí, vive en su propia pestaña
    document.getElementById('admin-bracket-tools').style.display = 'block';
    document.getElementById('btn-save-admin').style.display = 'flex';
    document.getElementById('user-status-bar').style.display = 'none';
    document.getElementById('submit-groups-area').style.display = 'none';
    document.getElementById('btn-save-draft').style.display = 'none';
    
    // --- GESTIÓN DE BOTONES ADMIN ---
    // 1. Ocultar el grupo "Mis Pronósticos" (El Admin no juega)
    document.getElementById('nav-group-fan').style.display = 'none';

    // 2. Reutilizar botones y mostrar Configuración
    const btnReal = document.getElementById('btn-tab-real');
    const btnSettings = document.getElementById('btn-tab-settings');
    const navStandalone = document.querySelector('.nav-standalone');

    // Limpiamos y creamos botones estilo Admin
    // Truco: Vamos a inyectar HTML nuevo en la zona de botones para el Admin
    // para que quede: [Ingreso Grupos] [Ingreso Finales] [Configuración]
    
    const adminNavHTML = `
        <button id="btn-tab-groups" class="tab-btn active" onclick="switchTab('groups')">INGRESO GRUPOS (OFICIAL)</button>
        <button id="btn-tab-bracket" class="tab-btn" onclick="switchTab('bracket')">INGRESO FINALES (OFICIAL)</button>
        <button id="btn-tab-settings" class="tab-btn" onclick="switchTab('settings')">CONFIGURACIÓN</button>
    `;
    
    // Reemplazamos toda la zona de navegacion por la del admin
    document.querySelector('.tabs-area').innerHTML = `<div class="nav-standalone">${adminNavHTML}</div>`;

    document.getElementById('btn-refresh').style.display = 'none';
    
    // Cargar config inputs...
    document.getElementById('rule-exact').value = rules.exact;
    document.getElementById('rule-diff').value = rules.diff;
    document.getElementById('rule-winner').value = rules.winner;
    document.getElementById('check-groups').checked = phaseControl.groups;
    document.getElementById('check-r32').checked = phaseControl.r32;
    document.getElementById('check-r16').checked = phaseControl.r16;
    document.getElementById('check-qf').checked = phaseControl.qf;
    document.getElementById('check-sf').checked = phaseControl.sf;
    document.getElementById('check-f').checked = phaseControl.f;

    renderGroups(); 
    renderBracket();
}

function setupUserMode(username) {
    role = 'fan';
    document.getElementById('admin-status-bar').style.display = 'none';
    document.getElementById('admin-bracket-tools').style.display = 'none';
    document.getElementById('btn-save-admin').style.display = 'none';
    document.getElementById('user-status-bar').style.display = 'grid'; 
    document.getElementById('btn-save-draft').style.display = 'flex';
    document.getElementById('btn-refresh').style.display = 'flex';

    // --- RESTAURAR VISTA FAN (Por si venimos de un logout de admin) ---
    // Simplemente recargamos el HTML original de los tabs si es necesario, 
    // pero como la página carga limpia, basta con asegurar visibilidad.
    
    // Si recargamos la página, el HTML está intacto.
    // Solo ocultamos el botón de settings
    document.getElementById('nav-group-fan').style.display = 'block';
    document.getElementById('btn-tab-settings').classList.add('hidden');
    
    // Asegurar nombres originales
    document.getElementById('btn-tab-groups').innerText = "Fase de Grupos";
    document.getElementById('btn-tab-bracket').innerText = "Fase Final";
    
    const key = `m26_data_${username}`;
    let saved = JSON.parse(localStorage.getItem(key));
    if(saved && saved.locks) currentUser = saved;
    else currentUser = { name: username, preds: {}, locks: { groups: false, r32: false, r16: false, qf: false, sf: false, f: false } };
    
    document.getElementById('display-username').innerText = currentUser.name.toUpperCase();
    updateStatusUI();
    renderGroups();
    renderBracket();
}

function updateStatusUI() {
    let count = Object.values(currentUser.locks).filter(x => x).length;
    document.getElementById('display-progress').innerText = `Fases: ${count}/6`;
    calculatePoints();
    
    let badge = document.getElementById('display-status');
    let groupArea = document.getElementById('submit-groups-area');
    let groupBtn = document.getElementById('btn-submit-groups');
    let groupMsg = document.getElementById('groups-msg');

    if(currentUser.locks.groups) {
        badge.innerText = "OFICIAL";
        badge.className = "status-badge bg-official";
        groupArea.style.display = 'none';
        document.getElementById('btn-save-draft').style.display = 'none';
    } else {
        badge.innerText = "BORRADOR";
        badge.className = "status-badge bg-draft";
        groupArea.style.display = 'block'; 
        groupArea.classList.remove('hidden'); 
        document.getElementById('btn-save-draft').style.display = 'flex';
        
        if(phaseControl.groups) {
            groupBtn.disabled = false;
            groupBtn.className = "btn-big-submit";
            groupBtn.innerText = "ENVIAR OFICIALMENTE";
            groupMsg.innerHTML = "Fase de grupos habilitada.";
        } else {
            groupBtn.disabled = true;
            groupBtn.className = "btn-big-submit btn-big-disabled";
            groupBtn.innerText = "ESPERANDO ADMIN";
            groupMsg.innerHTML = "Fase cerrada temporalmente.";
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
   5. RENDERIZADO DE GRUPOS
   ========================================================= */
function renderGroups() {
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    if(role === 'fan') calculatePoints();
    for(let g in GROUPS_CONFIG) {
        const data = GROUPS_CONFIG[g];
        let matchesHTML = '';
        let teamStats = data.teams.map(n => ({ name: n, pts: 0, dif: 0 }));
        
        data.matches.forEach((m, idx) => {
            let id = `${g}-${idx}`;
            let uH = currentUser.preds[`h-${id}`] || ''; let uA = currentUser.preds[`a-${id}`] || '';
            let oH = officialRes[`h-${id}`] || ''; let oA = officialRes[`a-${id}`] || '';
            let valH = role === 'admin' ? oH : uH; let valA = role === 'admin' ? oA : uA;
            let disabled = (role === 'fan' && currentUser.locks.groups) ? 'disabled' : '';
            let cH = role === 'admin' ? oH : uH; let cA = role === 'admin' ? oA : uA;
            if(cH !== '' && cA !== '') updateStats(teamStats, m.t1, m.t2, parseInt(cH), parseInt(cA));
            
            matchesHTML += `<div class="match-row"><div class="team-name team-home">${data.teams[m.t1]}</div><div class="center-inputs"><div class="match-info">${m.info}</div><div class="score-container"><input type="number" min="0" value="${valH}" ${disabled} onchange="updateVal('${id}','h',this.value)"><span>-</span><input type="number" min="0" value="${valA}" ${disabled} onchange="updateVal('${id}','a',this.value)"></div></div><div class="team-name team-away">${data.teams[m.t2]}</div></div>`;
        });

        teamStats.sort((a,b) => b.pts - a.pts || b.dif - a.dif);
        let tableRows = teamStats.map((t,i) => `<tr class="${i<2?'qual-zone':''}"><td class="pos-num">${i+1}</td><td>${t.name}</td><td>${t.pts}</td><td>${t.dif}</td></tr>`).join('');
        let titleTxt = role === 'admin' ? `GRUPO ${g} [OFICIAL]` : (currentUser.locks.groups ? `GRUPO ${g} [ENVIADO]` : `GRUPO ${g}`);
        
        container.innerHTML += `<div class="card"><div class="group-header">${titleTxt}</div><div class="card-body">${matchesHTML}<table><tr><th>#</th><th>EQ</th><th>PTS</th><th>DIF</th></tr>${tableRows}</table></div></div>`;
    }
}

function updateStats(stats, i1, i2, s1, s2) {
    let t1=stats[i1], t2=stats[i2];
    t1.dif += (s1-s2); t2.dif += (s2-s1);
    if(s1>s2) t1.pts+=3; else if(s2>s1) t2.pts+=3; else {t1.pts++; t2.pts++;}
}

function updateVal(id, slot, val) {
    if(val<0) val=0;
    let k = `${slot}-${id}`;
    if(role === 'admin') officialRes[k] = val;
    else {
        if(currentUser.locks.groups) return;
        currentUser.preds[k] = val;
    }
    renderGroups();
}

/* =========================================================
   6. RENDERIZADO DE LLAVES (BRACKET)
   ========================================================= */
function calculateSimulatedTeams(sourceData) {
    let q = {}; let thirds = [];
    for(let g in GROUPS_CONFIG) {
        let stats = GROUPS_CONFIG[g].teams.map(n => ({ name: n, pts: 0, dif: 0, gf: 0 }));
        GROUPS_CONFIG[g].matches.forEach((m, idx) => {
            let id = `${g}-${idx}`;
            let h = sourceData[`h-${id}`]; let a = sourceData[`a-${id}`]; 
            if(h && a) {
                h=parseInt(h); a=parseInt(a);
                let t1=stats[m.t1]; let t2=stats[m.t2];
                if(h>a) t1.pts+=3; else if(a>h) t2.pts+=3; else {t1.pts++; t2.pts++;}
                t1.dif += (h-a); t2.dif += (a-h);
                t1.gf += h; t2.gf += a;
            }
        });
        stats.sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
        q[g+'1'] = stats[0].name; q[g+'2'] = stats[1].name;
        thirds.push({name: stats[2].name, pts: stats[2].pts, dif: stats[2].dif, gf: stats[2].gf});
    }
    thirds.sort((a,b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);
    for(let i=0; i<8; i++) { if(thirds[i]) q['T'+(i+1)] = thirds[i].name; else q['T'+(i+1)] = "3er"; }
    return q;
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

function renderRoundColumn(title, matchups, prefix, phaseKey) {
    let isLocked = currentUser.locks[phaseKey];
    let isEnabled = phaseControl[phaseKey];
    let btnHTML = '';
    if(role === 'fan') {
        if(isLocked) btnHTML = `<button class="round-action-btn btn-done">ENVIADO</button>`;
        else if (!isEnabled) btnHTML = `<button class="round-action-btn btn-wait">ESPERANDO</button>`;
        else btnHTML = `<button class="round-action-btn btn-go" onclick="submitPhase('${phaseKey}')">ENVIAR</button>`;
    } else {
        btnHTML = `<span style="font-size:0.7rem; color:${isEnabled?'#0f0':'#f00'}">${isEnabled ? 'OPEN' : 'CLOSED'}</span>`;
    }
    let html = `<div class="round-column"><div class="round-header"><span class="round-title">${title}</span>${btnHTML}</div>`;
    matchups.forEach(m => {
        let nameH = resolveTeamName(m.id, 'h', m.h);
        let nameA = resolveTeamName(m.id, 'a', m.a);
        let kH = `k-${m.id}-h`; let kA = `k-${m.id}-a`;
        let scH, scA;
        if(role === 'admin') { scH = officialRes[kH]||''; scA = officialRes[kA]||''; }
        else { scH = currentUser.preds[kH]||''; scA = currentUser.preds[kA]||''; }
        let disabled = (role === 'fan' && isLocked) ? 'disabled' : '';
        let renderTeam = (slot, name) => {
            if(role === 'admin') return `<input type="text" style="width:100%; border:1px solid #555; background:#222; color:#fff; padding:5px;" value="${name}" onchange="updateOfficialTeamName('${m.id}', '${slot}', this.value)">`;
            else return `<span class="b-team" title="${name}">${name}</span>`;
        };
        html += `<div class="bracket-match"><div class="bracket-row">${renderTeam('h', nameH)}<input type="number" min="0" class="bracket-input" value="${scH}" ${disabled} onchange="updateBracketScore('${m.id}','h',this.value, '${phaseKey}')"></div><div class="bracket-row">${renderTeam('a', nameA)}<input type="number" min="0" class="bracket-input" value="${scA}" ${disabled} onchange="updateBracketScore('${m.id}','a',this.value, '${phaseKey}')"></div></div>`;
    });
    return html + `</div>`;
}

function resolveTeamName(matchId, slot, originalCode) {
    if (officialTeams[`${matchId}-${slot}`]) return officialTeams[`${matchId}-${slot}`];
    if(simulatedTeams[originalCode]) return simulatedTeams[originalCode];
    if (originalCode.includes('-')) return "Ganador " + originalCode;
    return originalCode;
}

function updateOfficialTeamName(matchId, slot, newName) {
    officialTeams[`${matchId}-${slot}`] = newName;
}

function updateBracketScore(matchId, slot, val, phaseKey) {
    if(val<0) val=0;
    let k = `k-${matchId}-${slot}`;
    if(role === 'admin') officialRes[k] = val;
    else {
        if(currentUser.locks[phaseKey]) return; 
        currentUser.preds[k] = val;
    }
    renderBracket();
}

/* =========================================================
   7. FUNCIONES DE GUARDADO Y PUNTOS
   ========================================================= */
function refreshData() {
    officialRes = JSON.parse(localStorage.getItem('m26_official')) || {};
    phaseControl = JSON.parse(localStorage.getItem('m26_phase_control')) || { groups: true, r32: false, r16: false, qf: false, sf: false, f: false };
    officialTeams = JSON.parse(localStorage.getItem('m26_official_teams')) || {};
    if(currentUser && currentUser.name) {
        const key = `m26_data_${currentUser.name}`;
        let saved = JSON.parse(localStorage.getItem(key));
        if(saved) currentUser = saved;
    }
    updateStatusUI();
    renderGroups();
    renderBracket();

    // Si estamos en modo fan, refrescamos los oficiales
    if(role === 'fan') {
        renderRealResults();
        renderRealBracket(); // <--- AGREGAR ESTA LÍNEA
    }
    alert("¡Datos actualizados!");
}

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
    localStorage.setItem('m26_official', JSON.stringify(officialRes));
    localStorage.setItem('m26_official_teams', JSON.stringify(officialTeams));
    if(document.getElementById('check-groups')) {
        phaseControl.groups = document.getElementById('check-groups').checked;
        phaseControl.r32 = document.getElementById('check-r32').checked;
        phaseControl.r16 = document.getElementById('check-r16').checked;
        phaseControl.qf = document.getElementById('check-qf').checked;
        phaseControl.sf = document.getElementById('check-sf').checked;
        phaseControl.f = document.getElementById('check-f').checked;
        localStorage.setItem('m26_phase_control', JSON.stringify(phaseControl));
    }
    if(showMsg) alert("Admin: Guardado OK");
    renderBracket();
}

function calculatePoints(preds, locks) {
    let p = preds || currentUser.preds;
    let l = locks || currentUser.locks;
    let total = 0;
    if(l.groups) {
        for(let g in GROUPS_CONFIG) {
            GROUPS_CONFIG[g].matches.forEach((m,i) => {
                let id = `${g}-${i}`;
                total += calcMatchPts(p[`h-${id}`], p[`a-${id}`], officialRes[`h-${id}`], officialRes[`a-${id}`]);
            });
        }
    }
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
    if(!preds) {
        if(l.groups) document.getElementById('total-points').innerText = total;
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