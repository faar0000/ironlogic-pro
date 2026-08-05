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
    // Historical entries over the past 4 weeks for rich progression charts
    { id: 'h1', date: '2026-07-06', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 70, reps: 10, estimated1RM: 93.3, volume: 700 },
    { id: 'h2', date: '2026-07-13', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 72.5, reps: 10, estimated1RM: 96.6, volume: 725 },
    { id: 'h3', date: '2026-07-20', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 75, reps: 9, estimated1RM: 97.5, volume: 675 },
    { id: 'h4', date: '2026-07-27', dayName: 'Lunes', routineTitle: 'Push', exerciseName: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', setNumber: 1, weight: 75, reps: 10, estimated1RM: 100, volume: 750 },
    
    { id: 'h5', date: '2026-07-09', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 90, reps: 8, estimated1RM: 114, volume: 720 },
    { id: 'h6', date: '2026-07-16', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 95, reps: 8, estimated1RM: 120.3, volume: 760 },
    { id: 'h7', date: '2026-07-23', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 97.5, reps: 8, estimated1RM: 123.5, volume: 780 },
    { id: 'h8', date: '2026-07-30', dayName: 'Jueves', routineTitle: 'Legs', exerciseName: 'Sentadilla Trasera con Barra', muscleGroup: 'Pierna', setNumber: 1, weight: 100, reps: 8, estimated1RM: 126.6, volume: 800 },

    { id: 'h9', date: '2026-07-07', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 57.5, reps: 10, estimated1RM: 76.6, volume: 575 },
    { id: 'h10', date: '2026-07-14', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 60, reps: 10, estimated1RM: 80, volume: 600 },
    { id: 'h11', date: '2026-07-21', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 62.5, reps: 10, estimated1RM: 83.3, volume: 625 },
    { id: 'h12', date: '2026-07-28', dayName: 'Martes', routineTitle: 'Pull', exerciseName: 'Jalón al Pecho en Polea Alta', muscleGroup: 'Espalda', setNumber: 1, weight: 65, reps: 10, estimated1RM: 86.6, volume: 650 },
  ]
};
