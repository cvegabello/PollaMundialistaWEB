/* ============================================================
   ARCHIVO DE DATOS (DATA.JS)
   Aquí reposan los equipos, grupos y partidos.
   Puede editar fechas, horas y estadios sin dañar la lógica.
   ============================================================ */

const GROUPS_CONFIG = {
    'A': {
        teams: ['México', 'Sudáfrica', 'Corea del Sur', 'Repechaje UEFA D'],
        matches: [
            { t1: 0, t2: 1, date: '11 Jun', time: '14:00', stadium: 'Azteca' },
            { t1: 2, t2: 3, date: '11 Jun', time: '17:00', stadium: 'Guadalajara' },
            { t1: 0, t2: 2, date: '15 Jun', time: '18:00', stadium: 'Monterrey' },
            { t1: 3, t2: 1, date: '15 Jun', time: '15:00', stadium: 'Azteca' },
            { t1: 3, t2: 0, date: '19 Jun', time: '12:00', stadium: 'Guadalajara' },
            { t1: 1, t2: 2, date: '19 Jun', time: '12:00', stadium: 'Monterrey' }
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
    // --- DOMINGO 28 JUNIO 2026 ---
    { id: '73', h: 'A2', a: 'B2', info: 'Los Angeles (M73)' }, // ¡El que usted dijo!

    // --- LUNES 29 JUNIO 2026 ---
    { id: '74', h: 'E1', a: 'T_ABCDF', info: 'Boston (M74)' }, // 1E vs 3ro de A,B,C,D,F
    { id: '75', h: 'F1', a: 'C2',      info: 'Monterrey (M75)' },
    { id: '76', h: 'C1', a: 'F2',      info: 'Houston (M76)' },

    // --- MARTES 30 JUNIO 2026 ---
    { id: '77', h: 'I1', a: 'T_CDFGH', info: 'New York/NJ (M77)' }, // 1I vs 3ro de C,D,F,G,H
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
const R16_MATCHUPS = [{id:'16-1', h:'32-1', a:'32-2'}, {id:'16-2', h:'32-3', a:'32-4'}, {id:'16-3', h:'32-5', a:'32-6'}, {id:'16-4', h:'32-7', a:'32-8'},{id:'16-5', h:'32-9', a:'32-10'}, {id:'16-6', h:'32-11', a:'32-12'}, {id:'16-7', h:'32-13', a:'32-14'}, {id:'16-8', h:'32-15', a:'32-16'}];
const QF_MATCHUPS = [ {id:'8-1',h:'16-1',a:'16-2'}, {id:'8-2',h:'16-3',a:'16-4'}, {id:'8-3',h:'16-5',a:'16-6'}, {id:'8-4',h:'16-7',a:'16-8'} ];
const SF_MATCHUPS = [ {id:'4-1',h:'8-1',a:'8-2'}, {id:'4-2',h:'8-3',a:'8-4'} ];
const F_MATCHUPS = [ {id:'2-1',h:'4-1',a:'4-2'} ];