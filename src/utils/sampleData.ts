import { GymProgram, WorkoutDay, HistoryRecord } from '../types';

export const INITIAL_SAMPLE_PROGRAM: GymProgram = {
  fileName: 'Rutina_Hipertrofia_2026.xlsx',
  lastUpdated: new Date().toISOString().split('T')[0],
  workoutDays: [
    {
      id: 'day-1',
      dayName: 'Lunes',
      dayType: 'training',
      title: 'Pecho, Hombros y Tríceps (Push)',
      focusMuscles: ['Pecho', 'Hombros', 'Tríceps'],
      exercises: [
        {
          id: 'ex-1',
          name: 'Press de Banca Plano con Barra',
          muscleGroup: 'Pecho',
          targetSets: 4,
          targetReps: '8-10',
          previousLogs: {
            date: '2026-07-27',
            weight: 75,
            reps: 10,
            sets: [
              { id: 'p1', setNumber: 1, weight: 75, reps: 10, completed: true },
              { id: 'p2', setNumber: 2, weight: 75, reps: 10, completed: true },
              { id: 'p3', setNumber: 3, weight: 75, reps: 9, completed: true },
              { id: 'p4', setNumber: 4, weight: 75, reps: 8, completed: true },
            ]
          },
          currentSets: [
            { id: 'c1', setNumber: 1, weight: 77.5, reps: 10, completed: true },
            { id: 'c2', setNumber: 2, weight: 77.5, reps: 9, completed: true },
            { id: 'c3', setNumber: 3, weight: 77.5, reps: 8, completed: false },
            { id: 'c4', setNumber: 4, weight: 75, reps: 10, completed: false },
          ]
        },
        {
          id: 'ex-2',
          name: 'Press Inclinado con Mancuernas',
          muscleGroup: 'Pecho',
          targetSets: 3,
          targetReps: '10-12',
          previousLogs: {
            date: '2026-07-27',
            weight: 26,
            reps: 12,
            sets: [
              { id: 'p5', setNumber: 1, weight: 26, reps: 12, completed: true },
              { id: 'p6', setNumber: 2, weight: 26, reps: 11, completed: true },
              { id: 'p7', setNumber: 3, weight: 26, reps: 10, completed: true },
            ]
          },
          currentSets: [
            { id: 'c5', setNumber: 1, weight: 28, reps: 10, completed: false },
            { id: 'c6', setNumber: 2, weight: 28, reps: 10, completed: false },
            { id: 'c7', setNumber: 3, weight: 28, reps: 9, completed: false },
          ]
        },
        {
          id: 'ex-3',
          name: 'Press Militar sentado con Mancuernas',
          muscleGroup: 'Hombros',
          targetSets: 3,
          targetReps: '8-10',
          previousLogs: {
            date: '2026-07-27',
            weight: 22,
            reps: 10,
            sets: [
              { id: 'p8', setNumber: 1, weight: 22, reps: 10, completed: true },
              { id: 'p9', setNumber: 2, weight: 22, reps: 9, completed: true },
              { id: 'p10', setNumber: 3, weight: 22, reps: 8, completed: true },
            ]
          },
          currentSets: [
            { id: 'c8', setNumber: 1, weight: 24, reps: 8, completed: false },
            { id: 'c9', setNumber: 2, weight: 24, reps: 8, completed: false },
            { id: 'c10', setNumber: 3, weight: 22, reps: 10, completed: false },
          ]
        },
        {
          id: 'ex-4',
          name: 'Elevaciones Laterales en Polea',
          muscleGroup: 'Hombros',
          targetSets: 4,
          targetReps: '12-15',
          previousLogs: {
            date: '2026-07-27',
            weight: 10,
            reps: 15,
            sets: [
              { id: 'p11', setNumber: 1, weight: 10, reps: 15, completed: true },
              { id: 'p12', setNumber: 2, weight: 10, reps: 14, completed: true },
              { id: 'p13', setNumber: 3, weight: 10, reps: 13, completed: true },
              { id: 'p14', setNumber: 4, weight: 10, reps: 12, completed: true },
            ]
          },
          currentSets: [
            { id: 'c11', setNumber: 1, weight: 12.5, reps: 12, completed: false },
            { id: 'c12', setNumber: 2, weight: 12.5, reps: 12, completed: false },
            { id: 'c13', setNumber: 3, weight: 10, reps: 15, completed: false },
            { id: 'c14', setNumber: 4, weight: 10, reps: 14, completed: false },
          ]
        },
        {
          id: 'ex-5',
          name: 'Extensiones de Tríceps en Cuerda',
          muscleGroup: 'Tríceps',
          targetSets: 3,
          targetReps: '10-12',
          previousLogs: {
            date: '2026-07-27',
            weight: 25,
            reps: 12,
            sets: [
              { id: 'p15', setNumber: 1, weight: 25, reps: 12, completed: true },
              { id: 'p16', setNumber: 2, weight: 25, reps: 12, completed: true },
              { id: 'p17', setNumber: 3, weight: 25, reps: 10, completed: true },
            ]
          },
          currentSets: [
            { id: 'c15', setNumber: 1, weight: 27.5, reps: 11, completed: false },
            { id: 'c16', setNumber: 2, weight: 27.5, reps: 10, completed: false },
            { id: 'c17', setNumber: 3, weight: 25, reps: 12, completed: false },
          ]
        }
      ]
    },
    {
      id: 'day-2',
      dayName: 'Martes',
      dayType: 'training',
      title: 'Espalda y Bíceps (Pull)',
      focusMuscles: ['Espalda', 'Bíceps'],
      exercises: [
        {
          id: 'ex-6',
          name: 'Jalón al Pecho en Polea Alta',
          muscleGroup: 'Espalda',
          targetSets: 4,
          targetReps: '8-10',
          previousLogs: {
            date: '2026-07-28',
            weight: 65,
            reps: 10,
            sets: [
              { id: 'p18', setNumber: 1, weight: 65, reps: 10, completed: true },
              { id: 'p19', setNumber: 2, weight: 65, reps: 10, completed: true },
              { id: 'p20', setNumber: 3, weight: 65, reps: 9, completed: true },
              { id: 'p21', setNumber: 4, weight: 65, reps: 8, completed: true },
            ]
          },
          currentSets: [
            { id: 'c18', setNumber: 1, weight: 68, reps: 10, completed: false },
            { id: 'c19', setNumber: 2, weight: 68, reps: 9, completed: false },
            { id: 'c20', setNumber: 3, weight: 68, reps: 8, completed: false },
            { id: 'c21', setNumber: 4, weight: 65, reps: 10, completed: false },
          ]
        },
        {
          id: 'ex-7',
          name: 'Remo Gironda sentado con Agarre Estrecho',
          muscleGroup: 'Espalda',
          targetSets: 3,
          targetReps: '10-12',
          previousLogs: {
            date: '2026-07-28',
            weight: 60,
            reps: 12,
            sets: [
              { id: 'p22', setNumber: 1, weight: 60, reps: 12, completed: true },
              { id: 'p23', setNumber: 2, weight: 60, reps: 11, completed: true },
              { id: 'p24', setNumber: 3, weight: 60, reps: 10, completed: true },
            ]
          },
          currentSets: [
            { id: 'c22', setNumber: 1, weight: 64, reps: 11, completed: false },
            { id: 'c23', setNumber: 2, weight: 64, reps: 10, completed: false },
            { id: 'c24', setNumber: 3, weight: 60, reps: 12, completed: false },
          ]
        },
        {
          id: 'ex-8',
          name: 'Curl de Bíceps con Barra Z',
          muscleGroup: 'Bíceps',
          targetSets: 3,
          targetReps: '10-12',
          previousLogs: {
            date: '2026-07-28',
            weight: 30,
            reps: 12,
            sets: [
              { id: 'p25', setNumber: 1, weight: 30, reps: 12, completed: true },
              { id: 'p26', setNumber: 2, weight: 30, reps: 10, completed: true },
              { id: 'p27', setNumber: 3, weight: 30, reps: 10, completed: true },
            ]
          },
          currentSets: [
            { id: 'c25', setNumber: 1, weight: 32.5, reps: 10, completed: false },
            { id: 'c26', setNumber: 2, weight: 32.5, reps: 9, completed: false },
            { id: 'c27', setNumber: 3, weight: 30, reps: 11, completed: false },
          ]
        },
        {
          id: 'ex-9',
          name: 'Curl Martillo en Polea',
          muscleGroup: 'Bíceps',
          targetSets: 3,
          targetReps: '12-15',
          previousLogs: {
            date: '2026-07-28',
            weight: 20,
            reps: 14,
            sets: [
              { id: 'p28', setNumber: 1, weight: 20, reps: 14, completed: true },
              { id: 'p29', setNumber: 2, weight: 20, reps: 13, completed: true },
              { id: 'p30', setNumber: 3, weight: 20, reps: 12, completed: true },
            ]
          },
          currentSets: [
            { id: 'c28', setNumber: 1, weight: 22.5, reps: 12, completed: false },
            { id: 'c29', setNumber: 2, weight: 22.5, reps: 12, completed: false },
            { id: 'c30', setNumber: 3, weight: 20, reps: 14, completed: false },
          ]
        }
      ]
    },
    {
      id: 'day-3',
      dayName: 'Miércoles',
      dayType: 'rest',
      title: 'Día de Descanso y Recuperación Activa',
      focusMuscles: ['Regeneración Muscular', 'Movilidad', 'Caminata Ligera'],
      exercises: []
    },
    {
      id: 'day-4',
      dayName: 'Jueves',
      dayType: 'training',
      title: 'Pierna Completa (Legs)',
      focusMuscles: ['Cuádriceps', 'Isquiotibiales', 'Glúteos', 'Gemelos'],
      exercises: [
        {
          id: 'ex-10',
          name: 'Sentadilla Trasera con Barra',
          muscleGroup: 'Pierna',
          targetSets: 4,
          targetReps: '6-8',
          previousLogs: {
            date: '2026-07-30',
            weight: 100,
            reps: 8,
            sets: [
              { id: 'p31', setNumber: 1, weight: 100, reps: 8, completed: true },
              { id: 'p32', setNumber: 2, weight: 100, reps: 8, completed: true },
              { id: 'p33', setNumber: 3, weight: 100, reps: 7, completed: true },
              { id: 'p34', setNumber: 4, weight: 100, reps: 6, completed: true },
            ]
          },
          currentSets: [
            { id: 'c31', setNumber: 1, weight: 105, reps: 8, completed: false },
            { id: 'c32', setNumber: 2, weight: 105, reps: 7, completed: false },
            { id: 'c33', setNumber: 3, weight: 105, reps: 6, completed: false },
            { id: 'c34', setNumber: 4, weight: 100, reps: 8, completed: false },
          ]
        },
        {
          id: 'ex-11',
          name: 'Prensa 45 Grados',
          muscleGroup: 'Pierna',
          targetSets: 3,
          targetReps: '10-12',
          previousLogs: {
            date: '2026-07-30',
            weight: 180,
            reps: 12,
            sets: [
              { id: 'p35', setNumber: 1, weight: 180, reps: 12, completed: true },
              { id: 'p36', setNumber: 2, weight: 180, reps: 11, completed: true },
              { id: 'p37', setNumber: 3, weight: 180, reps: 10, completed: true },
            ]
          },
          currentSets: [
            { id: 'c35', setNumber: 1, weight: 190, reps: 11, completed: false },
            { id: 'c36', setNumber: 2, weight: 190, reps: 10, completed: false },
            { id: 'c37', setNumber: 3, weight: 180, reps: 12, completed: false },
          ]
        },
        {
          id: 'ex-12',
          name: 'Peso Muerto Rumano con Mancuernas',
          muscleGroup: 'Pierna',
          targetSets: 3,
          targetReps: '10-12',
          previousLogs: {
            date: '2026-07-30',
            weight: 32,
            reps: 12,
            sets: [
              { id: 'p38', setNumber: 1, weight: 32, reps: 12, completed: true },
              { id: 'p39', setNumber: 2, weight: 32, reps: 11, completed: true },
              { id: 'p40', setNumber: 3, weight: 32, reps: 10, completed: true },
            ]
          },
          currentSets: [
            { id: 'c38', setNumber: 1, weight: 34, reps: 10, completed: false },
            { id: 'c39', setNumber: 2, weight: 34, reps: 10, completed: false },
            { id: 'c40', setNumber: 3, weight: 32, reps: 12, completed: false },
          ]
        },
        {
          id: 'ex-13',
          name: 'Elevación de Talones de Pie (Gemelos)',
          muscleGroup: 'Pierna',
          targetSets: 4,
          targetReps: '15-20',
          previousLogs: {
            date: '2026-07-30',
            weight: 60,
            reps: 20,
            sets: [
              { id: 'p41', setNumber: 1, weight: 60, reps: 20, completed: true },
              { id: 'p42', setNumber: 2, weight: 60, reps: 18, completed: true },
              { id: 'p43', setNumber: 3, weight: 60, reps: 16, completed: true },
              { id: 'p44', setNumber: 4, weight: 60, reps: 15, completed: true },
            ]
          },
          currentSets: [
            { id: 'c41', setNumber: 1, weight: 65, reps: 18, completed: false },
            { id: 'c42', setNumber: 2, weight: 65, reps: 16, completed: false },
            { id: 'c43', setNumber: 3, weight: 65, reps: 15, completed: false },
            { id: 'c44', setNumber: 4, weight: 60, reps: 18, completed: false },
          ]
        }
      ]
    },
    {
      id: 'day-5',
      dayName: 'Viernes',
      dayType: 'training',
      title: 'Torso y Brazos (Upper Body Focus)',
      focusMuscles: ['Pecho', 'Espalda', 'Hombros', 'Core'],
      exercises: [
        {
          id: 'ex-14',
          name: 'Press Inclinado con Barra',
          muscleGroup: 'Pecho',
          targetSets: 3,
          targetReps: '8-10',
          previousLogs: {
            date: '2026-07-31',
            weight: 65,
            reps: 10,
            sets: [
              { id: 'p45', setNumber: 1, weight: 65, reps: 10, completed: true },
              { id: 'p46', setNumber: 2, weight: 65, reps: 9, completed: true },
              { id: 'p47', setNumber: 3, weight: 65, reps: 8, completed: true },
            ]
          },
          currentSets: [
            { id: 'c45', setNumber: 1, weight: 67.5, reps: 9, completed: false },
            { id: 'c46', setNumber: 2, weight: 67.5, reps: 8, completed: false },
            { id: 'c47', setNumber: 3, weight: 65, reps: 10, completed: false },
          ]
        },
        {
          id: 'ex-15',
          name: 'Remo con Barra T / Remo en Punta',
          muscleGroup: 'Espalda',
          targetSets: 3,
          targetReps: '8-10',
          previousLogs: {
            date: '2026-07-31',
            weight: 55,
            reps: 10,
            sets: [
              { id: 'p48', setNumber: 1, weight: 55, reps: 10, completed: true },
              { id: 'p49', setNumber: 2, weight: 55, reps: 10, completed: true },
              { id: 'p50', setNumber: 3, weight: 55, reps: 8, completed: true },
            ]
          },
          currentSets: [
            { id: 'c48', setNumber: 1, weight: 57.5, reps: 10, completed: false },
            { id: 'c49', setNumber: 2, weight: 57.5, reps: 9, completed: false },
            { id: 'c50', setNumber: 3, weight: 55, reps: 10, completed: false },
          ]
        },
        {
          id: 'ex-16',
          name: 'Face Pull en Polea',
          muscleGroup: 'Hombros',
          targetSets: 4,
          targetReps: '15',
          previousLogs: {
            date: '2026-07-31',
            weight: 20,
            reps: 15,
            sets: [
              { id: 'p51', setNumber: 1, weight: 20, reps: 15, completed: true },
              { id: 'p52', setNumber: 2, weight: 20, reps: 15, completed: true },
              { id: 'p53', setNumber: 3, weight: 20, reps: 15, completed: true },
              { id: 'p54', setNumber: 4, weight: 20, reps: 14, completed: true },
            ]
          },
          currentSets: [
            { id: 'c51', setNumber: 1, weight: 22.5, reps: 15, completed: false },
            { id: 'c52', setNumber: 2, weight: 22.5, reps: 14, completed: false },
            { id: 'c53', setNumber: 3, weight: 22.5, reps: 13, completed: false },
            { id: 'c54', setNumber: 4, weight: 20, reps: 15, completed: false },
          ]
        }
      ]
    },
    {
      id: 'day-6',
      dayName: 'Sábado',
      dayType: 'rest',
      title: 'Descanso Total',
      focusMuscles: ['Recuperación SNC', 'Nutrición', 'Sueño'],
      exercises: []
    },
    {
      id: 'day-7',
      dayName: 'Domingo',
      dayType: 'rest',
      title: 'Descanso y Estiramientos',
      focusMuscles: ['Flexibilidad', 'Movilidad de Cadera'],
      exercises: []
    }
  ],
  history: [
    // Press de Banca Plano con Barra (Pecho - Lunes)
    { id: 'h1_1', date: '2026-06-08', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 67.5, reps: 10, estimated1RM: 90, volume: 675 },
    { id: 'h1_2', date: '2026-06-15', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 70, reps: 8, estimated1RM: 88.6, volume: 560 },
    { id: 'h1_3', date: '2026-06-22', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 70, reps: 10, estimated1RM: 93.3, volume: 700 },
    { id: 'h1_4', date: '2026-06-29', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 72.5, reps: 9, estimated1RM: 94.2, volume: 652.5 },
    { id: 'h1_5', date: '2026-07-06', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 72.5, reps: 10, estimated1RM: 96.6, volume: 725 },
    { id: 'h1_6', date: '2026-07-13', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 75, reps: 8, estimated1RM: 95, volume: 600 },
    { id: 'h1_7', date: '2026-07-20', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 75, reps: 9, estimated1RM: 97.5, volume: 675 },
    { id: 'h1_8', date: '2026-07-27', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 75, reps: 10, estimated1RM: 100, volume: 750 },
    { id: 'h1_9', date: '2026-08-03', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 77.5, reps: 8, estimated1RM: 98.1, volume: 620 },
    { id: 'h1_10', date: '2026-08-10', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 77.5, reps: 9, estimated1RM: 100.7, volume: 697.5 },

    // Press Inclinado con Mancuernas (Pecho - Lunes)
    { id: 'h2_1', date: '2026-06-08', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 20, reps: 12, estimated1RM: 28, volume: 240 },
    { id: 'h2_2', date: '2026-06-15', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 22, reps: 10, estimated1RM: 29.3, volume: 220 },
    { id: 'h2_3', date: '2026-06-22', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 22, reps: 12, estimated1RM: 30.8, volume: 264 },
    { id: 'h2_4', date: '2026-06-29', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 24, reps: 10, estimated1RM: 32, volume: 240 },
    { id: 'h2_5', date: '2026-07-06', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 24, reps: 11, estimated1RM: 32.8, volume: 264 },
    { id: 'h2_6', date: '2026-07-13', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 24, reps: 12, estimated1RM: 33.6, volume: 288 },
    { id: 'h2_7', date: '2026-07-20', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 26, reps: 10, estimated1RM: 34.6, volume: 260 },
    { id: 'h2_8', date: '2026-07-27', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 26, reps: 12, estimated1RM: 36.4, volume: 312 },
    { id: 'h2_9', date: '2026-08-03', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 28, reps: 9, estimated1RM: 36.4, volume: 252 },
    { id: 'h2_10', date: '2026-08-10', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', setNumber: 1, weight: 28, reps: 10, estimated1RM: 37.3, volume: 280 },

    // Press Militar sentado con Mancuernas (Hombros - Lunes)
    { id: 'h3_1', date: '2026-06-08', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 16, reps: 10, estimated1RM: 21.3, volume: 160 },
    { id: 'h3_2', date: '2026-06-15', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 18, reps: 8, estimated1RM: 22.8, volume: 144 },
    { id: 'h3_3', date: '2026-06-22', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 18, reps: 10, estimated1RM: 24, volume: 180 },
    { id: 'h3_4', date: '2026-06-29', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 20, reps: 8, estimated1RM: 25.3, volume: 160 },
    { id: 'h3_5', date: '2026-07-06', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 20, reps: 9, estimated1RM: 26, volume: 180 },
    { id: 'h3_6', date: '2026-07-13', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 20, reps: 10, estimated1RM: 26.6, volume: 200 },
    { id: 'h3_7', date: '2026-07-20', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 22, reps: 8, estimated1RM: 27.8, volume: 176 },
    { id: 'h3_8', date: '2026-07-27', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 22, reps: 10, estimated1RM: 29.3, volume: 220 },
    { id: 'h3_9', date: '2026-08-03', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 24, reps: 8, estimated1RM: 30.4, volume: 192 },
    { id: 'h3_10', date: '2026-08-10', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press Militar sentado con Mancuernas', muscleGroup: 'Hombros', setNumber: 1, weight: 24, reps: 8, estimated1RM: 30.4, volume: 192 },

    // Elevaciones Laterales en Polea (Hombros - Lunes)
    { id: 'h4_1', date: '2026-06-08', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 6, reps: 15, estimated1RM: 9, volume: 90 },
    { id: 'h4_2', date: '2026-06-15', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 7.5, reps: 12, estimated1RM: 10.5, volume: 90 },
    { id: 'h4_3', date: '2026-06-22', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 7.5, reps: 15, estimated1RM: 11.2, volume: 112.5 },
    { id: 'h4_4', date: '2026-06-29', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 8.5, reps: 12, estimated1RM: 11.9, volume: 102 },
    { id: 'h4_5', date: '2026-07-06', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 8.5, reps: 15, estimated1RM: 12.7, volume: 127.5 },
    { id: 'h4_6', date: '2026-07-13', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 10, reps: 12, estimated1RM: 14, volume: 120 },
    { id: 'h4_7', date: '2026-07-20', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 10, reps: 14, estimated1RM: 14.6, volume: 140 },
    { id: 'h4_8', date: '2026-07-27', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 10, reps: 15, estimated1RM: 15, volume: 150 },
    { id: 'h4_9', date: '2026-08-03', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 12.5, reps: 11, estimated1RM: 17, volume: 137.5 },
    { id: 'h4_10', date: '2026-08-10', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 12.5, reps: 12, estimated1RM: 17.5, volume: 150 },

    // Extensiones de Tríceps en Cuerda (Tríceps - Lunes)
    { id: 'h5_1', date: '2026-06-08', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 17.5, reps: 12, estimated1RM: 24.5, volume: 210 },
    { id: 'h5_2', date: '2026-06-15', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 20, reps: 10, estimated1RM: 26.6, volume: 200 },
    { id: 'h5_3', date: '2026-06-22', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 20, reps: 12, estimated1RM: 28, volume: 240 },
    { id: 'h5_4', date: '2026-06-29', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 22.5, reps: 10, estimated1RM: 30, volume: 225 },
    { id: 'h5_5', date: '2026-07-06', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 22.5, reps: 12, estimated1RM: 31.5, volume: 270 },
    { id: 'h5_6', date: '2026-07-13', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 25, reps: 10, estimated1RM: 33.3, volume: 250 },
    { id: 'h5_7', date: '2026-07-20', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 25, reps: 11, estimated1RM: 34.1, volume: 275 },
    { id: 'h5_8', date: '2026-07-27', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 25, reps: 12, estimated1RM: 35, volume: 300 },
    { id: 'h5_9', date: '2026-08-03', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 27.5, reps: 10, estimated1RM: 36.6, volume: 275 },
    { id: 'h5_10', date: '2026-08-10', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Extensiones de Tríceps en Cuerda', muscleGroup: 'Tríceps', setNumber: 1, weight: 27.5, reps: 11, estimated1RM: 37.5, volume: 302.5 },

    // Jalón al Pecho en Polea Alta (Espalda - Martes)
    { id: 'h6_1', date: '2026-06-09', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 50, reps: 10, estimated1RM: 66.6, volume: 500 },
    { id: 'h6_2', date: '2026-06-16', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 52.5, reps: 10, estimated1RM: 70, volume: 525 },
    { id: 'h6_3', date: '2026-06-23', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 55, reps: 9, estimated1RM: 71.5, volume: 495 },
    { id: 'h6_4', date: '2026-06-30', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 55, reps: 10, estimated1RM: 73.3, volume: 550 },
    { id: 'h6_5', date: '2026-07-07', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 57.5, reps: 10, estimated1RM: 76.6, volume: 575 },
    { id: 'h6_6', date: '2026-07-14', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 60, reps: 10, estimated1RM: 80, volume: 600 },
    { id: 'h6_7', date: '2026-07-21', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 62.5, reps: 10, estimated1RM: 83.3, volume: 625 },
    { id: 'h6_8', date: '2026-07-28', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 65, reps: 10, estimated1RM: 86.6, volume: 650 },
    { id: 'h6_9', date: '2026-08-04', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 67.5, reps: 9, estimated1RM: 87.7, volume: 607.5 },
    { id: 'h6_10', date: '2026-08-11', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 68, reps: 10, estimated1RM: 90.6, volume: 680 },

    // Remo Gironda sentado con Agarre Estrecho (Espalda - Martes)
    { id: 'h7_1', date: '2026-06-09', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 45, reps: 12, estimated1RM: 63, volume: 540 },
    { id: 'h7_2', date: '2026-06-16', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 50, reps: 10, estimated1RM: 66.6, volume: 500 },
    { id: 'h7_3', date: '2026-06-23', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 50, reps: 12, estimated1RM: 70, volume: 600 },
    { id: 'h7_4', date: '2026-06-30', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 55, reps: 10, estimated1RM: 73.3, volume: 550 },
    { id: 'h7_5', date: '2026-07-07', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 55, reps: 12, estimated1RM: 77, volume: 660 },
    { id: 'h7_6', date: '2026-07-14', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 57.5, reps: 11, estimated1RM: 78.5, volume: 632.5 },
    { id: 'h7_7', date: '2026-07-21', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 60, reps: 10, estimated1RM: 80, volume: 600 },
    { id: 'h7_8', date: '2026-07-28', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 60, reps: 12, estimated1RM: 84, volume: 720 },
    { id: 'h7_9', date: '2026-08-04', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 64, reps: 10, estimated1RM: 85.3, volume: 640 },
    { id: 'h7_10', date: '2026-08-11', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Remo Gironda sentado con Agarre Estrecho', muscleGroup: 'Espalda', setNumber: 1, weight: 64, reps: 11, estimated1RM: 87.4, volume: 704 },

    // Curl de Bíceps con Barra Z (Bíceps - Martes)
    { id: 'h8_1', date: '2026-06-09', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 22.5, reps: 12, estimated1RM: 31.5, volume: 270 },
    { id: 'h8_2', date: '2026-06-16', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 25, reps: 10, estimated1RM: 33.3, volume: 250 },
    { id: 'h8_3', date: '2026-06-23', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 25, reps: 12, estimated1RM: 35, volume: 300 },
    { id: 'h8_4', date: '2026-06-30', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 27.5, reps: 10, estimated1RM: 36.6, volume: 275 },
    { id: 'h8_5', date: '2026-07-07', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 27.5, reps: 12, estimated1RM: 38.5, volume: 330 },
    { id: 'h8_6', date: '2026-07-14', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 30, reps: 9, estimated1RM: 39, volume: 270 },
    { id: 'h8_7', date: '2026-07-21', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 30, reps: 10, estimated1RM: 40, volume: 300 },
    { id: 'h8_8', date: '2026-07-28', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 30, reps: 12, estimated1RM: 42, volume: 360 },
    { id: 'h8_9', date: '2026-08-04', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 32.5, reps: 9, estimated1RM: 42.2, volume: 292.5 },
    { id: 'h8_10', date: '2026-08-11', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl de Bíceps con Barra Z', muscleGroup: 'Bíceps', setNumber: 1, weight: 32.5, reps: 10, estimated1RM: 43.3, volume: 325 },

    // Curl Martillo en Polea (Bíceps - Martes)
    { id: 'h9_1', date: '2026-06-09', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 12.5, reps: 15, estimated1RM: 18.7, volume: 187.5 },
    { id: 'h9_2', date: '2026-06-16', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 15, reps: 12, estimated1RM: 21, volume: 180 },
    { id: 'h9_3', date: '2026-06-23', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 15, reps: 14, estimated1RM: 22, volume: 210 },
    { id: 'h9_4', date: '2026-06-30', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 17.5, reps: 12, estimated1RM: 24.5, volume: 210 },
    { id: 'h9_5', date: '2026-07-07', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 17.5, reps: 14, estimated1RM: 25.6, volume: 245 },
    { id: 'h9_6', date: '2026-07-14', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 17.5, reps: 15, estimated1RM: 26.2, volume: 262.5 },
    { id: 'h9_7', date: '2026-07-21', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 20, reps: 12, estimated1RM: 28, volume: 240 },
    { id: 'h9_8', date: '2026-07-28', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 20, reps: 14, estimated1RM: 29.3, volume: 280 },
    { id: 'h9_9', date: '2026-08-04', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 22.5, reps: 11, estimated1RM: 30.7, volume: 247.5 },
    { id: 'h9_10', date: '2026-08-11', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', setNumber: 1, weight: 22.5, reps: 12, estimated1RM: 31.5, volume: 270 },

    // Sentadilla Trasera con Barra (Pierna - Jueves)
    { id: 'h10_1', date: '2026-06-11', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 80, reps: 8, estimated1RM: 101.3, volume: 640 },
    { id: 'h10_2', date: '2026-06-18', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 85, reps: 7, estimated1RM: 104.8, volume: 595 },
    { id: 'h10_3', date: '2026-06-25', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 85, reps: 8, estimated1RM: 107.6, volume: 680 },
    { id: 'h10_4', date: '2026-07-02', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 90, reps: 6, estimated1RM: 108, volume: 540 },
    { id: 'h10_5', date: '2026-07-09', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 90, reps: 8, estimated1RM: 114, volume: 720 },
    { id: 'h10_6', date: '2026-07-16', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 95, reps: 8, estimated1RM: 120.3, volume: 760 },
    { id: 'h10_7', date: '2026-07-23', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 97.5, reps: 8, estimated1RM: 123.5, volume: 780 },
    { id: 'h10_8', date: '2026-07-30', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 100, reps: 8, estimated1RM: 126.6, volume: 800 },
    { id: 'h10_9', date: '2026-08-06', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 102.5, reps: 7, estimated1RM: 126.4, volume: 717.5 },
    { id: 'h10_10', date: '2026-08-13', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 102.5, reps: 8, estimated1RM: 129.8, volume: 820 },

    // Prensa Inclinada de Piernas (Pierna - Jueves)
    { id: 'h11_1', date: '2026-06-11', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 150, reps: 12, estimated1RM: 210, volume: 1800 },
    { id: 'h11_2', date: '2026-06-18', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 160, reps: 10, estimated1RM: 213.3, volume: 1600 },
    { id: 'h11_3', date: '2026-06-25', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 160, reps: 12, estimated1RM: 224, volume: 1920 },
    { id: 'h11_4', date: '2026-07-02', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 170, reps: 10, estimated1RM: 226.6, volume: 1700 },
    { id: 'h11_5', date: '2026-07-09', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 175, reps: 12, estimated1RM: 245, volume: 2100 },
    { id: 'h11_6', date: '2026-07-16', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 180, reps: 10, estimated1RM: 240, volume: 1800 },
    { id: 'h11_7', date: '2026-07-23', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 180, reps: 12, estimated1RM: 252, volume: 2160 },
    { id: 'h11_8', date: '2026-07-30', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 190, reps: 10, estimated1RM: 253.3, volume: 1900 },
    { id: 'h11_9', date: '2026-08-06', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 190, reps: 12, estimated1RM: 266, volume: 2280 },
    { id: 'h11_10', date: '2026-08-13', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Prensa Inclinada de Piernas', muscleGroup: 'Pierna', setNumber: 1, weight: 200, reps: 10, estimated1RM: 266.6, volume: 2000 },

    // Curl Femoral Tumbado (Pierna - Jueves)
    { id: 'h12_1', date: '2026-06-11', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 24, reps: 12, estimated1RM: 33.6, volume: 288 },
    { id: 'h12_2', date: '2026-06-18', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 26, reps: 10, estimated1RM: 34.6, volume: 260 },
    { id: 'h12_3', date: '2026-06-25', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 26, reps: 12, estimated1RM: 36.4, volume: 312 },
    { id: 'h12_4', date: '2026-07-02', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 28, reps: 10, estimated1RM: 37.3, volume: 280 },
    { id: 'h12_5', date: '2026-07-09', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 28, reps: 12, estimated1RM: 39.2, volume: 336 },
    { id: 'h12_6', date: '2026-07-16', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 30, reps: 10, estimated1RM: 40, volume: 300 },
    { id: 'h12_7', date: '2026-07-23', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 30, reps: 12, estimated1RM: 42, volume: 360 },
    { id: 'h12_8', date: '2026-07-30', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 32, reps: 12, estimated1RM: 44.8, volume: 384 },
    { id: 'h12_9', date: '2026-08-06', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 34, reps: 9, estimated1RM: 44.2, volume: 306 },
    { id: 'h12_10', date: '2026-08-13', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Curl Femoral Tumbado', muscleGroup: 'Pierna', setNumber: 1, weight: 34, reps: 10, estimated1RM: 45.3, volume: 340 },

    // Elevación de Talones de Pie (Gemelos - Jueves)
    { id: 'h13_1', date: '2026-06-11', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 45, reps: 20, estimated1RM: 75, volume: 900 },
    { id: 'h13_2', date: '2026-06-18', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 50, reps: 18, estimated1RM: 80, volume: 900 },
    { id: 'h13_3', date: '2026-06-25', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 50, reps: 20, estimated1RM: 83.3, volume: 1000 },
    { id: 'h13_4', date: '2026-07-02', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 55, reps: 16, estimated1RM: 84.3, volume: 880 },
    { id: 'h13_5', date: '2026-07-09', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 55, reps: 20, estimated1RM: 91.6, volume: 1100 },
    { id: 'h13_6', date: '2026-07-16', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 60, reps: 16, estimated1RM: 92, volume: 960 },
    { id: 'h13_7', date: '2026-07-23', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 60, reps: 18, estimated1RM: 96, volume: 1080 },
    { id: 'h13_8', date: '2026-07-30', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 60, reps: 20, estimated1RM: 100, volume: 1200 },
    { id: 'h13_9', date: '2026-08-06', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 65, reps: 16, estimated1RM: 99.6, volume: 1040 },
    { id: 'h13_10', date: '2026-08-13', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Elevación de Talones de Pie (Gemelos)', muscleGroup: 'Pierna', setNumber: 1, weight: 65, reps: 18, estimated1RM: 104, volume: 1170 },

    // Press Inclinado con Barra (Pecho - Viernes)
    { id: 'h14_1', date: '2026-06-12', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 50, reps: 10, estimated1RM: 66.6, volume: 500 },
    { id: 'h14_2', date: '2026-06-19', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 52.5, reps: 10, estimated1RM: 70, volume: 525 },
    { id: 'h14_3', date: '2026-06-26', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 55, reps: 9, estimated1RM: 71.5, volume: 495 },
    { id: 'h14_4', date: '2026-07-03', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 57.5, reps: 8, estimated1RM: 72.8, volume: 460 },
    { id: 'h14_5', date: '2026-07-10', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 57.5, reps: 10, estimated1RM: 76.6, volume: 575 },
    { id: 'h14_6', date: '2026-07-17', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 60, reps: 9, estimated1RM: 78, volume: 540 },
    { id: 'h14_7', date: '2026-07-24', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 62.5, reps: 8, estimated1RM: 79.1, volume: 500 },
    { id: 'h14_8', date: '2026-07-31', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 65, reps: 10, estimated1RM: 86.6, volume: 650 },
    { id: 'h14_9', date: '2026-08-07', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 67.5, reps: 8, estimated1RM: 85.5, volume: 540 },
    { id: 'h14_10', date: '2026-08-14', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Press Inclinado con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 67.5, reps: 9, estimated1RM: 87.7, volume: 607.5 },

    // Remo con Barra T / Remo en Punta (Espalda - Viernes)
    { id: 'h15_1', date: '2026-06-12', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 42.5, reps: 10, estimated1RM: 56.6, volume: 425 },
    { id: 'h15_2', date: '2026-06-19', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 45, reps: 10, estimated1RM: 60, volume: 450 },
    { id: 'h15_3', date: '2026-06-26', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 47.5, reps: 9, estimated1RM: 61.7, volume: 427.5 },
    { id: 'h15_4', date: '2026-07-03', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 47.5, reps: 10, estimated1RM: 63.3, volume: 475 },
    { id: 'h15_5', date: '2026-07-10', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 50, reps: 10, estimated1RM: 66.6, volume: 500 },
    { id: 'h15_6', date: '2026-07-17', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 52.5, reps: 9, estimated1RM: 68.2, volume: 472.5 },
    { id: 'h15_7', date: '2026-07-24', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 52.5, reps: 10, estimated1RM: 70, volume: 525 },
    { id: 'h15_8', date: '2026-07-31', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 55, reps: 10, estimated1RM: 73.3, volume: 550 },
    { id: 'h15_9', date: '2026-08-07', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 57.5, reps: 8, estimated1RM: 72.8, volume: 460 },
    { id: 'h15_10', date: '2026-08-14', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Remo con Barra T / Remo en Punta', muscleGroup: 'Espalda', setNumber: 1, weight: 57.5, reps: 10, estimated1RM: 76.6, volume: 575 },

    // Face Pull en Polea (Hombros - Viernes)
    { id: 'h16_1', date: '2026-06-12', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 12.5, reps: 15, estimated1RM: 18.7, volume: 187.5 },
    { id: 'h16_2', date: '2026-06-19', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 15, reps: 14, estimated1RM: 22, volume: 210 },
    { id: 'h16_3', date: '2026-06-26', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 15, reps: 15, estimated1RM: 22.5, volume: 225 },
    { id: 'h16_4', date: '2026-07-03', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 17.5, reps: 13, estimated1RM: 25, volume: 227.5 },
    { id: 'h16_5', date: '2026-07-10', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 17.5, reps: 15, estimated1RM: 26.2, volume: 262.5 },
    { id: 'h16_6', date: '2026-07-17', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 20, reps: 13, estimated1RM: 28.6, volume: 260 },
    { id: 'h16_7', date: '2026-07-24', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 20, reps: 14, estimated1RM: 29.3, volume: 280 },
    { id: 'h16_8', date: '2026-07-31', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 20, reps: 15, estimated1RM: 30, volume: 300 },
    { id: 'h16_9', date: '2026-08-07', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 22.5, reps: 14, estimated1RM: 33, volume: 315 },
    { id: 'h16_10', date: '2026-08-14', dayName: 'Viernes', routineTitle: 'Upper', exerciseName: 'Face Pull en Polea', muscleGroup: 'Hombros', setNumber: 1, weight: 22.5, reps: 15, estimated1RM: 33.7, volume: 337.5 },
  ]
};
