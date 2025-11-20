import React, { useState, useCallback, useEffect, useRef } from 'react';
import { INITIAL_DATA } from './constants';
import { MindMapData } from './types';
import { MindMapGraph } from './components/MindMap/MindMapGraph';
import { Toolbar } from './components/Toolbar';
import { Auth } from './components/Auth';
import { generateSubTopics } from './services/geminiService';
import { supabase } from './services/supabase';
import { v4 as uuidv4 } from 'uuid';
import { LogOut, Cloud, CloudOff, Loader2 } from 'lucide-react';

// Helper to find a node in the tree by ID
const findNode = (root: MindMapData, id: string): MindMapData | null => {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper to find parent of a node
const findParent = (root: MindMapData, id: string): MindMapData | null => {
  if (root.children) {
    for (const child of root.children) {
      if (child.id === id) return root;
      const found = findParent(child, id);
      if (found) return found;
    }
  }
  return null;
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [data, setData] = useState<MindMapData>(INITIAL_DATA);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dbRecordId, setDbRecordId] = useState<string | null>(null); // Supabase row ID

  const selectedNode = selectedNodeId ? findNode(data, selectedNodeId) : null;
  
  // Ref for debounce saving
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Check Session on Mount
  useEffect(() => {
    const initSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            setSession(session);
        } catch (err) {
            console.warn("Session init error:", err);
            // Fallback: keep session null
        } finally {
            setIsLoadingSession(false);
        }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // When session is restored or user logs in, loading is done
      setIsLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load Data from DB when Session exists
  useEffect(() => {
    if (session?.user) {
      loadMindMapFromDB(session.user.id);
    }
  }, [session]);

  const loadMindMapFromDB = async (userId: string) => {
    setIsSaving(true);
    try {
      const { data: rows, error } = await supabase
        .from('mindmaps')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;

      if (rows && rows.length > 0) {
        // Found existing map
        setDbRecordId(rows[0].id);
        setData(rows[0].content);
      } else {
        // No map found, save the initial one
        saveMindMapToDB(INITIAL_DATA, userId, null);
      }
    } catch (err) {
      console.error("Error loading mindmap:", err);
      // Fallback to local initial data if DB load fails
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Save Data Logic (Debounced)
  const saveMindMapToDB = async (currentData: MindMapData, userId: string, recordId: string | null) => {
    setIsSaving(true);
    try {
      const payload = {
        user_id: userId,
        content: currentData,
        updated_at: new Date().toISOString(),
      };

      if (recordId) {
        // Update
        await supabase.from('mindmaps').update(payload).eq('id', recordId);
      } else {
        // Insert
        const { data: newRows, error } = await supabase.from('mindmaps').insert(payload).select();
        if (error) throw error;
        if (newRows && newRows[0]) {
            setDbRecordId(newRows[0].id);
        }
      }
    } catch (err) {
      console.error("Error saving mindmap:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger save whenever data changes
  useEffect(() => {
    if (session?.user) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce save for 2 seconds
      saveTimeoutRef.current = setTimeout(() => {
        saveMindMapToDB(data, session.user.id, dbRecordId);
      }, 2000);
    }
  }, [data, session, dbRecordId]);


  // --- Actions ---

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setData(INITIAL_DATA);
    setDbRecordId(null);
  };

  const handleNodeClick = useCallback((node: MindMapData) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleToggleCollapse = useCallback((node: MindMapData) => {
    const newData = JSON.parse(JSON.stringify(data));
    const target = findNode(newData, node.id);
    if (target) {
      target.isCollapsed = !target.isCollapsed;
      setData(newData);
    }
  }, [data]);

  const handleAddChild = useCallback(() => {
    if (!selectedNodeId) return;
    const newData = JSON.parse(JSON.stringify(data));
    const parent = findNode(newData, selectedNodeId);
    if (parent) {
      if (!parent.children) parent.children = [];
      const newChild: MindMapData = {
        id: uuidv4(),
        label: 'New Node',
        color: parent.color // Inherit color by default
      };
      parent.children.push(newChild);
      parent.isCollapsed = false; // Auto expand
      setData(newData);
      setTimeout(() => setSelectedNodeId(newChild.id), 100);
    }
  }, [data, selectedNodeId]);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNodeId || selectedNodeId === 'root') return;
    const newData = JSON.parse(JSON.stringify(data));
    const parent = findParent(newData, selectedNodeId);
    if (parent && parent.children) {
      parent.children = parent.children.filter(c => c.id !== selectedNodeId);
      setData(newData);
      setSelectedNodeId(null);
    }
  }, [data, selectedNodeId]);

  const handleUpdateNode = useCallback((label: string, color?: string) => {
    if (!selectedNodeId) return;
    const newData = JSON.parse(JSON.stringify(data));
    const target = findNode(newData, selectedNodeId);
    if (target) {
      target.label = label;
      if (color !== undefined) target.color = color;
      setData(newData);
    }
  }, [data, selectedNodeId]);

  const handleAIGenerate = useCallback(async () => {
    if (!selectedNodeId) return;
    const nodeToExpand = selectedNode;
    if (!nodeToExpand) return;

    setIsGenerating(true);
    try {
        const parentContext = findParent(data, selectedNodeId)?.label || "Root";
        const suggestions = await generateSubTopics(nodeToExpand.label, parentContext);
        
        if (suggestions.length > 0) {
            const newData = JSON.parse(JSON.stringify(data));
            const target = findNode(newData, selectedNodeId);
            if (target) {
                if (!target.children) target.children = [];
                suggestions.forEach(suggestion => {
                    target.children!.push({
                        id: uuidv4(),
                        label: suggestion,
                        color: target.color
                    });
                });
                target.isCollapsed = false;
                setData(newData);
            }
        }
    } catch (error) {
        alert("AI generation failed. Check API Key.");
    } finally {
        setIsGenerating(false);
    }
  }, [data, selectedNodeId, selectedNode]);

  // --- Render ---

  if (isLoadingSession) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Toolbar 
        selectedNode={selectedNode}
        onAddChild={handleAddChild}
        onDeleteNode={handleDeleteNode}
        onUpdateNode={handleUpdateNode}
        onGenerateAI={handleAIGenerate}
        isGenerating={isGenerating}
      />
      
      {/* User Profile / Sync Status */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-3">
        <div className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-slate-200 text-xs font-medium flex items-center space-x-2 text-slate-500">
           {isSaving ? (
             <>
                <Loader2 size={14} className="animate-spin text-blue-500"/>
                <span>Saving...</span>
             </>
           ) : (
             <>
                <Cloud size={14} className="text-green-500"/>
                <span>Synced</span>
             </>
           )}
        </div>
        <div className="group relative">
            <button className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {session.user.email?.[0].toUpperCase()}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100 mb-1 truncate">
                    {session.user.email}
                </div>
                <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MindMapGraph 
            data={data}
            selectedNodeId={selectedNodeId}
            onNodeClick={handleNodeClick}
            onToggleCollapse={handleToggleCollapse}
        />
      </div>
    </div>
  );
}
