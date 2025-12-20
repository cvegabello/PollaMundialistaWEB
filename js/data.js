/* ============================================================
   ARCHIVO DE DATOS (DATA.JS)
   Aquí reposan los equipos, grupos y partidos.
   Puede editar fechas, horas y estadios sin dañar la lógica.
   ============================================================ */

const GROUPS_CONFIG = {
    'A': {
        teams: ['México', 'Sudáfrica', 'Corea del Sur', 'Repechaje UEFA D'],
        matches: [
            { t1: 0, t2: 1, date: '11 Jun', time: '15:00', stadium: 'Azteca' },
            { t1: 2, t2: 3, date: '11 Jun', time: '22:00', stadium: 'Guadalajara' },
            { t1: 3, t2: 1, date: '18 Jun', time: '12:00', stadium: 'Azteca' },
            { t1: 0, t2: 2, date: '18 Jun', time: '21:00', stadium: 'Monterrey' },
            { t1: 3, t2: 0, date: '24 Jun', time: '21:00', stadium: 'Guadalajara' },
            { t1: 1, t2: 2, date: '24 Jun', time: '21:00', stadium: 'Monterrey' }
        ]
    },
    'B': {
        teams: ['Canadá', 'Repechaje UEFA A', 'Qatar', 'Suiza'],
        matches: [
            { t1: 0, t2: 1, date: '12 Jun', time: '13:00', stadium: 'Toronto' },
            { t1: 2, t2: 3, date: '12 Jun', time: '16:00', stadium: 'Vancouver' },
            { t1: 0, t2: 2, date: '16 Jun', time: '14:00', stadium: 'Vancouver' },
            { t1: 3, t2: 1, date: '16 Jun', time: '17:00', stadium: 'Toronto' },
            { t1: 3, t2: 0, date: '20 Jun', time: '13:00', stadium: 'Vancouver' },
            { t1: 1, t2: 2, date: '20 Jun', time: '16:00', stadium: 'Toronto' }
        ]
    },
    'C': {
        teams: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
        matches: [
            { t1: 0, t2: 1, date: '13 Jun', time: '14:00', stadium: 'Boston' },
            { t1: 2, t2: 3, date: '13 Jun', time: '17:00', stadium: 'New York' },
            { t1: 0, t2: 2, date: '17 Jun', time: '15:00', stadium: 'Boston' },
            { t1: 3, t2: 1, date: '17 Jun', time: '18:00', stadium: 'New York' },
            { t1: 3, t2: 0, date: '21 Jun', time: '14:00', stadium: 'New York' },
            { t1: 1, t2: 2, date: '21 Jun', time: '17:00', stadium: 'Boston' }
        ]
    },
    'D': {
        teams: ['USA', 'Paraguay', 'Australia', 'Repechaje UEFA C'],
        matches: [
            { t1: 0, t2: 1, date: '12 Jun', time: '15:00', stadium: 'Los Angeles' },
            { t1: 2, t2: 3, date: '12 Jun', time: '18:00', stadium: 'Seattle' },
            { t1: 0, t2: 2, date: '16 Jun', time: '19:00', stadium: 'San Francisco' },
            { t1: 3, t2: 1, date: '16 Jun', time: '16:00', stadium: 'Seattle' },
            { t1: 3, t2: 0, date: '20 Jun', time: '15:00', stadium: 'Los Angeles' },
            { t1: 1, t2: 2, date: '20 Jun', time: '18:00', stadium: 'San Francisco' }
        ]
    },
    'E': {
        teams: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
        matches: [
            { t1: 0, t2: 1, date: '13 Jun', time: '12:00', stadium: 'Philadelphia' },
            { t1: 2, t2: 3, date: '13 Jun', time: '15:00', stadium: 'Houston' },
            { t1: 0, t2: 2, date: '17 Jun', time: '13:00', stadium: 'Houston' },
            { t1: 3, t2: 1, date: '17 Jun', time: '16:00', stadium: 'Philadelphia' },
            { t1: 3, t2: 0, date: '21 Jun', time: '13:00', stadium: 'Philadelphia' },
            { t1: 1, t2: 2, date: '21 Jun', time: '16:00', stadium: 'Houston' }
        ]
    },
    'F': {
        teams: ['Países Bajos', 'Japón', 'Repechaje UEFA B', 'Túnez'],
        matches: [
            { t1: 0, t2: 1, date: '14 Jun', time: '14:00', stadium: 'Dallas' },
            { t1: 2, t2: 3, date: '14 Jun', time: '17:00', stadium: 'Atlanta' },
            { t1: 0, t2: 2, date: '18 Jun', time: '15:00', stadium: 'Atlanta' },
            { t1: 3, t2: 1, date: '18 Jun', time: '18:00', stadium: 'Dallas' },
            { t1: 3, t2: 0, date: '22 Jun', time: '14:00', stadium: 'Dallas' },
            { t1: 1, t2: 2, date: '22 Jun', time: '17:00', stadium: 'Atlanta' }
        ]
    },
    'G': {
        teams: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
        matches: [
            { t1: 0, t2: 1, date: '14 Jun', time: '13:00', stadium: 'Kansas City' },
            { t1: 2, t2: 3, date: '14 Jun', time: '16:00', stadium: 'Miami' },
            { t1: 0, t2: 2, date: '18 Jun', time: '14:00', stadium: 'Miami' },
            { t1: 3, t2: 1, date: '18 Jun', time: '17:00', stadium: 'Kansas City' },
            { t1: 3, t2: 0, date: '22 Jun', time: '13:00', stadium: 'Kansas City' },
            { t1: 1, t2: 2, date: '22 Jun', time: '16:00', stadium: 'Miami' }
        ]
    },
    'H': {
        teams: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
        matches: [
            { t1: 0, t2: 1, date: '15 Jun', time: '14:00', stadium: 'Houston' },
            { t1: 2, t2: 3, date: '15 Jun', time: '17:00', stadium: 'Monterrey' },
            { t1: 0, t2: 2, date: '19 Jun', time: '15:00', stadium: 'Houston' },
            { t1: 3, t2: 1, date: '19 Jun', time: '18:00', stadium: 'Monterrey' },
            { t1: 3, t2: 0, date: '23 Jun', time: '14:00', stadium: 'Monterrey' },
            { t1: 1, t2: 2, date: '23 Jun', time: '17:00', stadium: 'Houston' }
        ]
    },
    'I': {
        teams: ['Francia', 'Senegal', 'Repechaje FIFA 2', 'Noruega'],
        matches: [
            { t1: 0, t2: 1, date: '15 Jun', time: '13:00', stadium: 'New York' },
            { t1: 2, t2: 3, date: '15 Jun', time: '16:00', stadium: 'Boston' },
            { t1: 0, t2: 2, date: '19 Jun', time: '14:00', stadium: 'Boston' },
            { t1: 3, t2: 1, date: '19 Jun', time: '17:00', stadium: 'New York' },
            { t1: 3, t2: 0, date: '23 Jun', time: '13:00', stadium: 'New York' },
            { t1: 1, t2: 2, date: '23 Jun', time: '16:00', stadium: 'Boston' }
        ]
    },
    'J': {
        teams: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
        matches: [
            { t1: 0, t2: 1, date: '16 Jun', time: '14:00', stadium: 'Dallas' },
            { t1: 2, t2: 3, date: '16 Jun', time: '17:00', stadium: 'San Francisco' },
            { t1: 0, t2: 2, date: '20 Jun', time: '15:00', stadium: 'Dallas' },
            { t1: 3, t2: 1, date: '20 Jun', time: '18:00', stadium: 'San Francisco' },
            { t1: 3, t2: 0, date: '24 Jun', time: '14:00', stadium: 'San Francisco' },
            { t1: 1, t2: 2, date: '24 Jun', time: '17:00', stadium: 'Dallas' }
        ]
    },
    'K': {
        teams: ['Portugal', 'Repechaje FIFA 1', 'Uzbekistán', 'Colombia'],
        matches: [
            { t1: 0, t2: 1, date: '16 Jun', time: '13:00', stadium: 'Atlanta' },
            { t1: 2, t2: 3, date: '16 Jun', time: '16:00', stadium: 'Miami' },
            { t1: 0, t2: 2, date: '20 Jun', time: '14:00', stadium: 'Miami' },
            { t1: 3, t2: 1, date: '20 Jun', time: '17:00', stadium: 'Atlanta' },
            { t1: 3, t2: 0, date: '24 Jun', time: '13:00', stadium: 'Atlanta' },
            { t1: 1, t2: 2, date: '24 Jun', time: '16:00', stadium: 'Miami' }
        ]
    },
    'L': {
        teams: ['Inglaterra', 'Croacia', 'Panamá', 'Ghana'],
        matches: [
            { t1: 0, t2: 1, date: '17 Jun', time: '14:00', stadium: 'Philadelphia' },
            { t1: 2, t2: 3, date: '17 Jun', time: '17:00', stadium: 'Toronto' },
            { t1: 0, t2: 2, date: '21 Jun', time: '15:00', stadium: 'Philadelphia' },
            { t1: 3, t2: 1, date: '21 Jun', time: '18:00', stadium: 'Toronto' },
            { t1: 3, t2: 0, date: '25 Jun', time: '14:00', stadium: 'Toronto' },
            { t1: 1, t2: 2, date: '25 Jun', time: '17:00', stadium: 'Philadelphia' }
        ]
    }
};
/* =========================================================
   CRUCES OFICIALES FIFA WORLD CUP 2026 (ROUND OF 32)
   Basado en el esquema de 12 Grupos (48 equipos)
   ========================================================= */
const R32_MATCHUPS = [
    
    { id: '74', h: 'E1', a: 'T_ABCDF', info: 'Boston (M74)' }, // 1E vs 3ro de A,B,C,D,F
    { id: '77', h: 'I1', a: 'T_CDFGH', info: 'New York/NJ (M77)' }, // 1I vs 3ro de C,D,F,G,H

    { id: '73', h: 'A2', a: 'B2', info: 'Los Angeles (M73)' }, // ¡El que usted dijo!
    { id: '75', h: 'F1', a: 'C2',      info: 'Monterrey (M75)' },

    { id: '76', h: 'C1', a: 'F2',      info: 'Houston (M76)' },

    // --- MARTES 30 JUNIO 2026 ---
    
    { id: '78', h: 'E2', a: 'I2',      info: 'Dallas (M78)' },      // 2E vs 2I
    { id: '79', h: 'A1', a: 'T_CEFHI', info: 'Mexico City (M79)' }, // 1A vs 3ro de C,E,F,H,I

    // --- MIÉRCOLES 1 JULIO 2026 ---
    { id: '80', h: 'L1', a: 'T_EHIJK', info: 'Atlanta (M80)' },     // 1L vs 3ro de E,H,I,J,K
    { id: '81', h: 'D1', a: 'T_BEFIJ', info: 'San Francisco (M81)' }, // 1D vs 3ro de B,E,F,I,J
    { id: '82', h: 'G1', a: 'T_AEHIJ', info: 'Seattle (M82)' },     // 1G vs 3ro de A,E,H,I,J

    // --- JUEVES 2 JULIO 2026 ---
    { id: '83', h: 'K2', a: 'L2',      info: 'Toronto (M83)' },     // 2K vs 2L
    { id: '84', h: 'H1', a: 'J2',      info: 'Los Angeles (M84)' }, 
    { id: '85', h: 'B1', a: 'T_EFGIJ', info: 'Vancouver (M85)' },   // 1B vs 3ro de E,F,G,I,J

    // --- VIERNES 3 JULIO 2026 ---
    { id: '86', h: 'J1', a: 'H2',      info: 'Miami (M86)' },
    { id: '87', h: 'K1', a: 'T_DEIJL', info: 'Kansas City (M87)' }, // 1K vs 3ro de D,E,I,J,L
    { id: '88', h: 'D2', a: 'G2',      info: 'Dallas (M88)' }       // 2D vs 2G
];

/* =========================================================
   ESTRUCTURA DE LLAVES OFICIAL FIFA 2026 (DATA.JS)
   Cruces confirmados según el calendario oficial por sedes.
   ========================================================= */

// --- OCTAVOS DE FINAL (R16) ---
// OJO: Note que los números saltan (Ej: W74 vs W77). Así es el cuadro oficial.
const R16_MATCHUPS = [
    // Lado Izquierdo del Cuadro (West/Central)
    { id: '89', h: 'W74', a: 'W77', info: 'Octavos 1 (Philadelphia)' }, // 4 de Julio
    { id: '90', h: 'W73', a: 'W75', info: 'Octavos 2 (Houston)' },      // 4 de Julio
    { id: '91', h: 'W76', a: 'W78', info: 'Octavos 3 (New Jersey)' },   // 5 de Julio
    { id: '92', h: 'W79', a: 'W80', info: 'Octavos 4 (Mexico City)' },  // 5 de Julio
    
    // Lado Derecho del Cuadro (Central/East)
    { id: '93', h: 'W83', a: 'W84', info: 'Octavos 5 (Dallas)' },       // 6 de Julio
    { id: '94', h: 'W81', a: 'W82', info: 'Octavos 6 (Seattle)' },      // 6 de Julio
    { id: '95', h: 'W86', a: 'W88', info: 'Octavos 7 (Atlanta)' },      // 7 de Julio
    { id: '96', h: 'W85', a: 'W87', info: 'Octavos 8 (Vancouver)' }     // 7 de Julio
];

// --- CUARTOS DE FINAL (QF) ---
// Se cruzan los ganadores de los Octavos definidos arriba
const QF_MATCHUPS = [
    { id: '97',  h: 'W89', a: 'W90', info: 'Cuartos 1 (Boston)' },       // 9 de Julio
    { id: '98',  h: 'W93', a: 'W94', info: 'Cuartos 2 (Los Angeles)' },  // 10 de Julio
    { id: '99',  h: 'W91', a: 'W92', info: 'Cuartos 3 (Miami)' },        // 11 de Julio
    { id: '100', h: 'W95', a: 'W96', info: 'Cuartos 4 (Kansas City)' }   // 11 de Julio
];

// --- SEMIFINALES (SF) ---
const SF_MATCHUPS = [
    { id: '101', h: 'W97', a: 'W98', info: 'Semifinal 1 (Dallas)' },     // 14 de Julio
    { id: '102', h: 'W99', a: 'W100', info: 'Semifinal 2 (Atlanta)' }    // 15 de Julio
];

// --- FINAL Y 3ER PUESTO ---
const F_MATCHUPS = [
    // La Gran Final (Ganador 101 vs Ganador 102)
    { id: '104', h: 'W101', a: 'W102', info: 'GRAN FINAL (New York/NJ)' },
    
    // El 3er Puesto (Perdedor 101 vs Perdedor 102)
    // Usamos la 'L' que acabamos de programar
    { id: '103', h: 'L101', a: 'L102', info: '3er y 4to Puesto (Miami)' }
];