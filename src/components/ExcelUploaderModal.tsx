import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Sparkles, HelpCircle } from 'lucide-react';
import { parseExcelFile } from '../utils/excelParser';
import { GymProgram } from '../types';

interface ExcelUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgramLoaded: (program: GymProgram) => void;
  onLoadSample: () => void;
}

export const ExcelUploaderModal: React.FC<ExcelUploaderModalProps> = ({
  isOpen,
  onClose,
  onProgramLoaded,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);

    try {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        throw new Error('Por favor selecciona un archivo con extensión .xlsx, .xls o .csv');
      }

      const buffer = await file.arrayBuffer();
      const parsedProgram = parseExcelFile(buffer, file.name);

      onProgramLoaded(parsedProgram);
      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al procesar el archivo de Excel.');
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Cargar Archivo Excel</h3>
            <p className="text-xs text-white/40">Detecta automáticamente tus días de entrenamiento, descansos y pesos previos.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-start space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-600/10'
              : 'border-white/10 bg-[#0a0a0a] hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-white/5 rounded-full text-blue-400 border border-white/10">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Arrastra tu Excel aquí o <span className="text-blue-400 underline">haz clic para buscar</span>
              </p>
              <p className="text-xs text-white/40 mt-1">Soporta formatos .xlsx, .xls y .csv</p>
            </div>
          </div>
        </div>

        {/* Info list */}
        <div className="mt-5 p-3.5 bg-[#0a0a0a] border border-white/10 rounded-xl">
          <div className="flex items-center space-x-2 text-xs font-medium text-white/80 mb-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>¿Cómo detecta la data tu Excel?</span>
          </div>
          <ul className="text-xs text-white/50 space-y-1.5 list-disc list-inside">
            <li>Reconoce hojas o filas por días (Lunes, Martes, Día 1, etc.)</li>
            <li>Identifica días de <span className="text-amber-400 font-medium">Descanso / Rest</span> automáticamente.</li>
            <li>Extrae nombres de ejercicios, grupos musculares, series, repeticiones y pesos previos.</li>
          </ul>
        </div>

        {/* Option to load demo */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">¿No tienes un Excel listo?</span>
          <button
            onClick={() => {
              onLoadSample();
              onClose();
            }}
            className="inline-flex items-center text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Usar Rutina Demo de Ejemplo
          </button>
        </div>

      </div>
    </div>
  );
};
