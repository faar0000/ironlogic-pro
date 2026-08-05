import React, { useState } from 'react';
import { X, Plus, Dumbbell } from 'lucide-react';
import { Exercise, SetLog } from '../types';
import { inferMuscleGroup } from '../utils/excelParser';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (newExercise: Exercise) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onAddExercise,
}) => {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Pecho');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState(20);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const inferred = inferMuscleGroup(val);
    if (inferred !== 'General') {
      setMuscleGroup(inferred);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initialSets: SetLog[] = [];
    for (let s = 1; s <= sets; s++) {
      initialSets.push({
        id: `c-added-${Date.now()}-${s}`,
        setNumber: s,
        weight: weight,
        reps: parseInt(reps) || 10,
        completed: false,
      });
    }

    const newEx: Exercise = {
      id: `ex-added-${Date.now()}`,
      name: name.trim(),
      muscleGroup: muscleGroup,
      targetSets: sets,
      targetReps: reps,
      currentSets: initialSets,
    };

    onAddExercise(newEx);
    onClose();
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Agregar Nuevo Ejercicio</h3>
            <p className="text-xs text-white/40">Añade un ejercicio adicional a tu día actual.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Nombre del Ejercicio</label>
            <input
              type="text"
              placeholder="Ej: Press de Banca Inclinado, Sentadilla Búlgara..."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Grupo Muscular Principal</label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Pecho">Pecho</option>
              <option value="Espalda">Espalda</option>
              <option value="Pierna">Pierna</option>
              <option value="Hombros">Hombros</option>
              <option value="Bíceps">Bíceps</option>
              <option value="Tríceps">Tríceps</option>
              <option value="Core">Core</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Series</label>
              <input
                type="number"
                min="1"
                max="10"
                value={sets}
                onChange={(e) => setSets(parseInt(e.target.value) || 3)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono font-medium text-center focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Reps Obj.</label>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono font-medium text-center focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono font-medium text-center focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white/50 hover:text-white rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Guardar Ejercicio
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
