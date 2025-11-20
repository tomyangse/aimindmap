import React, { useState } from 'react';
import { MindMapData } from '../types';
import { Plus, Trash2, Wand2, Layout, Edit2, X } from 'lucide-react';

interface ToolbarProps {
  selectedNode: MindMapData | null;
  onAddChild: () => void;
  onDeleteNode: () => void;
  onUpdateNode: (label: string, color?: string) => void;
  onGenerateAI: () => void;
  isGenerating: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedNode,
  onAddChild,
  onDeleteNode,
  onUpdateNode,
  onGenerateAI,
  isGenerating
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');

  React.useEffect(() => {
    if (selectedNode) {
      setEditLabel(selectedNode.label);
      setIsEditing(false); // Reset edit mode when selection changes
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (selectedNode) {
      onUpdateNode(editLabel);
      setIsEditing(false);
    }
  };

  const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B'];

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
      
      {/* Main Title Area */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center space-x-4">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
          <Layout size={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 text-lg">AI MindMap Architect</h1>
          <p className="text-xs text-slate-500">Project V2.0 Planning</p>
        </div>
      </div>

      {/* Action Toolbar (Only visible when node selected) */}
      {selectedNode && (
        <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-200 pointer-events-auto flex flex-col space-y-2 w-72 transition-all animate-fade-in-down">
          
          {/* Header / Edit Mode */}
          <div className="flex justify-between items-center p-2 border-b border-slate-100 pb-3 mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selected Node</span>
            <button onClick={() => setIsEditing(!isEditing)} className="text-slate-400 hover:text-blue-500">
                {isEditing ? <X size={16}/> : <Edit2 size={16}/>}
            </button>
          </div>

          {isEditing ? (
            <div className="px-2 py-1">
                <input 
                    type="text" 
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                />
                <div className="flex space-x-2">
                    <button onClick={handleSave} className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600">Save</button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-300">Cancel</button>
                </div>
            </div>
          ) : (
            <div className="px-2 py-1">
                <h3 className="font-bold text-slate-800 mb-1">{selectedNode.label}</h3>
                <p className="text-xs text-slate-500 font-mono truncate">{selectedNode.id}</p>
            </div>
          )}

          {/* Colors */}
          <div className="flex space-x-1 px-2 py-2 overflow-x-auto">
            {colors.map(c => (
                <button 
                    key={c}
                    onClick={() => onUpdateNode(selectedNode.label, c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedNode.color === c ? 'border-slate-600 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                />
            ))}
            <button 
                onClick={() => onUpdateNode(selectedNode.label, undefined)}
                className="w-6 h-6 rounded-full border border-slate-300 bg-white flex items-center justify-center text-xs text-slate-400 hover:bg-slate-50"
            >
                /
            </button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 px-2 pt-2">
            <button 
              onClick={onAddChild}
              className="flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              <span>Add Child</span>
            </button>
            
            <button 
              onClick={onDeleteNode}
              className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              disabled={selectedNode.id === 'root'}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>

            <button 
              onClick={onGenerateAI}
              disabled={isGenerating}
              className="col-span-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg shadow-md transition-all transform hover:scale-[1.02] text-sm font-bold"
            >
              {isGenerating ? (
                 <span className="animate-pulse">Thinking...</span>
              ) : (
                <>
                    <Wand2 size={16} />
                    <span>AI Expand Node</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
