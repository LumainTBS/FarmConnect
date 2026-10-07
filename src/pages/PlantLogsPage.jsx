import React, { useState } from 'react';
import { Sprout, Plus, Calendar, Lock, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PlantLogsPage() {
  const { plantLogs, addPlantLog, deletePlantLog } = useApp();

  const [cropType, setCropType] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvestDate, setHarvestDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cropType || !plantingDate) return;

    addPlantLog({
      crop_type: cropType,
      planting_date: plantingDate,
      expected_harvest_date: harvestDate,
      notes
    });

    setCropType('');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20 space-y-6">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Private Plant Logs</h1>
            <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded flex items-center space-x-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Farmer Only</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">Record and track planting dates, expected harvest schedules, and crop notes.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-dark transition-colors flex items-center space-x-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Log</span>
        </button>
      </div>

      {/* Add Log Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm animate-slide-down">
          <h3 className="font-bold text-slate-900 text-sm">Add New Crop Log</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type & Variety</label>
            <input
              type="text"
              required
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              placeholder="e.g. Spinach (Fordhook Giant), Yellow Sweet Corn..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Planting Date</label>
              <input
                type="date"
                required
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Harvest Date</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Observations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record compost mixture, irrigation schedule, pest observations..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-brand-forest text-white text-xs font-bold hover:bg-brand-dark"
            >
              Save Plant Log
            </button>
          </div>
        </form>
      )}

      {/* Log List */}
      <div className="space-y-3">
        {plantLogs.map((log) => (
          <div key={log.id} className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">{log.crop_type}</h3>
              </div>
              <button
                onClick={() => deletePlantLog(log.id)}
                className="text-slate-400 hover:text-rose-500 p-1"
                aria-label="Delete log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">PLANTED ON</span>
                <span className="font-bold text-slate-800">{log.planting_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">EXPECTED HARVEST</span>
                <span className="font-bold text-brand-forest">{log.expected_harvest_date || 'TBD'}</span>
              </div>
            </div>

            {log.notes && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                {log.notes}
              </p>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
