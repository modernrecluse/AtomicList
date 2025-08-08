import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, Upload, Trash2, AlertTriangle, 
  ChevronLeft, ChevronRight, FileText, X, 
  Info, Circle, CheckCircle2, 
  Menu, Plus, MoreVertical
} from 'lucide-react';

interface Node {
  id: number;
  content: string;
  level: number;
  note: string;
  isLinked: boolean;
  isTask: boolean;
  isCompleted: boolean;
  isNew: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
  nodeId: number;
}

const MobileAtomicListApp = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentIndentLevel, setCurrentIndentLevel] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [, setIsUploading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [currentTheme, setCurrentTheme] = useState('matcha');
  
  // Mobile-specific states
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [showNodeActions, setShowNodeActions] = useState<number | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themes: Record<string, {
    name: string;
    background: string;
    nodeBackground: string;
    text: string;
    prompt: string;
    border: string;
    accent: string;
  }> = {
    matcha: {
      name: 'Matcha',
      background: '#E8F5E8',
      nodeBackground: '#F0F8F0',
      text: '#2D4A2D',
      prompt: '#5A7A5A',
      border: '#C5D6C5',
      accent: '#7A9A7A'
    },
    latte: {
      name: 'Latte',
      background: '#F5F0E8',
      nodeBackground: '#F8F5F0',
      text: '#4A3D2D',
      prompt: '#7A6A5A',
      border: '#D6CCC5',
      accent: '#9A8A7A'
    },
    ocean: {
      name: 'Ocean',
      background: '#E8F0F5',
      nodeBackground: '#F0F5F8',
      text: '#2D3D4A',
      prompt: '#5A6A7A',
      border: '#C5CCD6',
      accent: '#7A8A9A'
    },
    sunset: {
      name: 'Sunset',
      background: '#F5E8E8',
      nodeBackground: '#F8F0F0',
      text: '#4A2D2D',
      prompt: '#7A5A5A',
      border: '#D6C5C5',
      accent: '#9A7A7A'
    },
    midnight: {
      name: 'Midnight',
      background: '#0F0F23',
      nodeBackground: '#1A1A2E',
      text: '#E0E0E0',
      prompt: '#8B8B8B',
      border: '#2D2D44',
      accent: '#4A4A6A'
    },
    plum: {
      name: 'Plum',
      background: '#F3E8F5',
      nodeBackground: '#F8F0FA',
      text: '#4A2D4A',
      prompt: '#7A5A7A',
      border: '#D6C5D6',
      accent: '#9A7A9A'
    },
    chess: {
      name: 'Chess',
      background: '#F8F8F8',
      nodeBackground: '#FFFFFF',
      text: '#1A1A1A',
      prompt: '#666666',
      border: '#E0E0E0',
      accent: '#999999'
    },
    espresso: {
      name: 'Espresso',
      background: '#2C1810',
      nodeBackground: '#3D2418',
      text: '#E8DDD4',
      prompt: '#B8A898',
      border: '#4A3828',
      accent: '#6A5848'
    }
  };

  const theme = themes[currentTheme];

  // Mobile viewport detection
  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerHeight;
      setViewportHeight(newHeight);
      
      // Detect keyboard visibility on mobile
      if (window.visualViewport) {
        setIsKeyboardVisible(window.visualViewport.height < newHeight * 0.75);
      }
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        setIsKeyboardVisible(window.visualViewport.height < viewportHeight * 0.75);
      }
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleVisualViewportChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
    };
  }, [viewportHeight]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent, nodeId: number) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      nodeId
    });
    setSwipeDistance(0);

    // Long press detection
    const timer = setTimeout(() => {
      setSelectedNodeId(nodeId);
      setShowNodeActions(nodeId);
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
    setLongPressTimer(timer);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // Cancel long press if moving too much
    if (deltaY > 10 && longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Horizontal swipe detection
    if (Math.abs(deltaX) > 20 && deltaY < 30) {
      setSwipeDistance(deltaX);
      e.preventDefault();
    }
  }, [touchStart, longPressTimer]);

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (touchStart && Math.abs(swipeDistance) > 60) {
      const node = nodes.find(n => n.id === touchStart.nodeId);
      if (node) {
        if (swipeDistance > 0) {
          // Swipe right - indent
          handleIndentNode(node.id);
        } else {
          // Swipe left - outdent
          handleOutdentNode(node.id);
        }
      }
    }

    setTouchStart(null);
    setSwipeDistance(0);
  }, [touchStart, swipeDistance, nodes]);

  // Load saved data
  useEffect(() => {
    const savedNodes = localStorage.getItem('atomicListNodes');
    const savedTheme = localStorage.getItem('atomicListTheme');
    
    if (savedNodes) {
      try {
        const parsedNodes = JSON.parse(savedNodes);
        setNodes(parsedNodes);
      } catch (error) {
        console.error('Failed to parse saved nodes:', error);
      }
    }
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('atomicListNodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('atomicListTheme', currentTheme);
  }, [currentTheme]);

  const addNode = (content: string, level: number = currentIndentLevel) => {
    if (content.trim() === '') return;

    const newNode: Node = {
      id: Date.now(),
      content: content.trim(),
      level,
      note: '',
      isLinked: false,
      isTask: content.includes('[]') || content.includes('[ ]'),
      isCompleted: content.includes('[x]') || content.includes('[X]'),
      isNew: true
    };

    // Clean up task markers from content
    newNode.content = newNode.content.replace(/\[\s*[xX]?\s*\]\s*/, '');

    let insertIndex = nodes.length;
    
    if (activeNodeId) {
      const activeIndex = nodes.findIndex(n => n.id === activeNodeId);
      if (activeIndex !== -1) {
        insertIndex = activeIndex + 1;
        newNode.level = nodes[activeIndex].level + 1;
      }
    }

    const newNodes = [...nodes];
    newNodes.splice(insertIndex, 0, newNode);
    setNodes(newNodes);

    // Clear the new flag after animation
    setTimeout(() => {
      setNodes(prev => prev.map(n => 
        n.id === newNode.id ? { ...n, isNew: false } : n
      ));
    }, 300);

    setCurrentInput('');
    setActiveNodeId(null);
    setSelectedNodeId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNode(currentInput);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        setCurrentIndentLevel(prev => Math.max(0, prev - 1));
      } else {
        setCurrentIndentLevel(prev => prev + 1);
      }
    } else if (e.key === 'Escape') {
      setCurrentInput('');
      setCurrentIndentLevel(0);
      setActiveNodeId(null);
      setSelectedNodeId(null);
    }
  };

  const handleIndentNode = (nodeId: number) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, level: node.level + 1 }
        : node
    ));
  };

  const handleOutdentNode = (nodeId: number) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, level: Math.max(0, node.level - 1) }
        : node
    ));
  };

  const handleDeleteNode = (nodeId: number) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setSelectedNodeId(null);
    setShowNodeActions(null);
  };

  const handleToggleTask = (nodeId: number) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isCompleted: !node.isCompleted }
        : node
    ));
  };

  const handleThemeChange = (themeKey: string) => {
    setCurrentTheme(themeKey);
    setShowMobileMenu(false);
  };

  const handleSaveToFile = () => {
    const dataStr = JSON.stringify({ nodes, theme: currentTheme }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atomic-list-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowMobileMenu(false);
  };

  const handleLoadFromFile = () => {
    fileInputRef.current?.click();
    setShowMobileMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.nodes && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
          if (data.theme && themes[data.theme]) {
            setCurrentTheme(data.theme);
          }
        }
      } catch (error) {
        console.error('Failed to parse file:', error);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    setNodes([]);
    setCurrentInput('');
    setCurrentIndentLevel(0);
    setActiveNodeId(null);
    setSelectedNodeId(null);
    setShowClearConfirm(false);
    setShowMobileMenu(false);
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: theme.background,
        color: theme.text,
        height: isKeyboardVisible ? `${window.visualViewport?.height}px` : '100vh'
      }}
    >
      {/* Mobile Header */}
      <div 
        className="flex-shrink-0 flex items-center justify-between p-4 border-b"
        style={{ 
          backgroundColor: theme.nodeBackground,
          borderColor: theme.border
        }}
      >
        <h1 className="text-xl font-semibold">Atomic List</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: showMobileMenu ? theme.accent : 'transparent',
              color: theme.text
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div 
            className="w-80 max-w-[85vw] h-full p-6 overflow-y-auto"
            style={{ backgroundColor: theme.nodeBackground }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: theme.text }}>Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg"
                style={{ color: theme.text }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Theme Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 opacity-75" style={{ color: theme.text }}>
                Themes
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(themes).map(([key, themeOption]) => (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className="p-3 rounded-lg text-left transition-all"
                    style={{ 
                      backgroundColor: currentTheme === key ? theme.accent : theme.border,
                      color: theme.text
                    }}
                  >
                    <div className="text-sm font-medium">{themeOption.name}</div>
                    <div 
                      className="w-full h-2 rounded mt-1"
                      style={{ backgroundColor: themeOption.accent }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleSaveToFile}
                className="w-full p-3 rounded-lg text-left flex items-center space-x-3"
                style={{ 
                  backgroundColor: theme.border,
                  color: theme.text
                }}
              >
                <Download size={18} />
                <span>Export Data</span>
              </button>
              
              <button
                onClick={handleLoadFromFile}
                className="w-full p-3 rounded-lg text-left flex items-center space-x-3"
                style={{ 
                  backgroundColor: theme.border,
                  color: theme.text
                }}
              >
                <Upload size={18} />
                <span>Import Data</span>
              </button>
              
              <button
                onClick={() => {
                  setShowClearConfirm(true);
                  setShowMobileMenu(false);
                }}
                className="w-full p-3 rounded-lg text-left flex items-center space-x-3"
                style={{ 
                  backgroundColor: '#ef4444',
                  color: 'white'
                }}
              >
                <Trash2 size={18} />
                <span>Clear All</span>
              </button>

              <button
                onClick={() => {
                  setShowAbout(true);
                  setShowMobileMenu(false);
                }}
                className="w-full p-3 rounded-lg text-left flex items-center space-x-3"
                style={{ 
                  backgroundColor: theme.border,
                  color: theme.text
                }}
              >
                <Info size={18} />
                <span>About</span>
              </button>
            </div>
          </div>
          
          {/* Tap outside to close */}
          <div 
            className="flex-1"
            onClick={() => setShowMobileMenu(false)}
          />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Nodes List */}
        <div 
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto px-4 py-2"
        >
          {nodes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.border }}
                >
                  <FileText size={24} style={{ color: theme.text }} />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: theme.text }}>
                  Start your atomic list
                </h3>
                <p className="text-sm opacity-75" style={{ color: theme.text }}>
                  Add your first thought below
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 pb-4">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`group transition-all duration-200 ${
                    node.isNew ? 'animate-fadeInSlide' : ''
                  }`}
                  style={{
                    marginLeft: `${node.level * 24}px`,
                    transform: swipeDistance && touchStart?.nodeId === node.id 
                      ? `translateX(${Math.max(-100, Math.min(100, swipeDistance))}px)` 
                      : 'none'
                  }}
                  onTouchStart={(e) => handleTouchStart(e, node.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className="flex items-start space-x-3 p-3 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: selectedNodeId === node.id ? theme.accent : theme.nodeBackground,
                      borderColor: theme.border,
                      border: '1px solid',
                      minHeight: '48px' // Better touch targets
                    }}
                  >
                    {/* Task Toggle */}
                    {node.isTask && (
                      <button
                        onClick={() => handleToggleTask(node.id)}
                        className="flex-shrink-0 mt-1 p-1"
                        style={{ color: node.isCompleted ? theme.accent : theme.text }}
                      >
                        {node.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm leading-relaxed ${
                          node.isCompleted ? 'line-through opacity-60' : ''
                        }`}
                        style={{ color: theme.text }}
                      >
                        {node.content}
                      </div>
                      {node.note && (
                        <div
                          className="text-xs mt-1 opacity-75"
                          style={{ color: theme.text }}
                        >
                          {node.note}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => setShowNodeActions(showNodeActions === node.id ? null : node.id)}
                      className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: theme.text }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Node Actions */}
                  {showNodeActions === node.id && (
                    <div 
                      className="mt-2 p-2 rounded-lg border"
                      style={{ 
                        backgroundColor: theme.nodeBackground,
                        borderColor: theme.border
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleIndentNode(node.id)}
                          className="px-3 py-1 rounded text-xs flex items-center space-x-1"
                          style={{ 
                            backgroundColor: theme.border,
                            color: theme.text
                          }}
                        >
                          <ChevronRight size={12} />
                          <span>Indent</span>
                        </button>
                        
                        <button
                          onClick={() => handleOutdentNode(node.id)}
                          className="px-3 py-1 rounded text-xs flex items-center space-x-1"
                          style={{ 
                            backgroundColor: theme.border,
                            color: theme.text
                          }}
                          disabled={node.level === 0}
                        >
                          <ChevronLeft size={12} />
                          <span>Outdent</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setActiveNodeId(node.id);
                            setShowNodeActions(null);
                            inputRef.current?.focus();
                          }}
                          className="px-3 py-1 rounded text-xs flex items-center space-x-1"
                          style={{ 
                            backgroundColor: theme.accent,
                            color: theme.text
                          }}
                        >
                          <Plus size={12} />
                          <span>Add Child</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteNode(node.id)}
                          className="px-3 py-1 rounded text-xs flex items-center space-x-1"
                          style={{ 
                            backgroundColor: '#ef4444',
                            color: 'white'
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Input Area */}
        <div 
          className="flex-shrink-0 p-4 border-t"
          style={{ 
            backgroundColor: theme.nodeBackground,
            borderColor: theme.border
          }}
        >
          {/* Mobile Indent Controls */}
          {isInputFocused && (
            <div className="flex justify-center space-x-2 mb-3">
              <button
                onClick={() => setCurrentIndentLevel(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-lg flex items-center space-x-2"
                style={{ 
                  backgroundColor: theme.border,
                  color: theme.text,
                  opacity: currentIndentLevel === 0 ? 0.5 : 1
                }}
                disabled={currentIndentLevel === 0}
              >
                <ChevronLeft size={16} />
                <span className="text-sm">Outdent</span>
              </button>
              <button
                onClick={() => setCurrentIndentLevel(prev => prev + 1)}
                className="px-4 py-2 rounded-lg flex items-center space-x-2"
                style={{ 
                  backgroundColor: theme.border,
                  color: theme.text
                }}
              >
                <ChevronRight size={16} />
                <span className="text-sm">Indent</span>
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <span 
              className="text-lg font-mono flex-shrink-0"
              style={{ color: theme.prompt }}
            >
              &gt;
            </span>
            
            {/* Visual indent indicator */}
            {currentIndentLevel > 0 && (
              <span 
                className="text-sm font-mono opacity-60 flex-shrink-0"
                style={{ color: theme.prompt }}
              >
                {Array.from({ length: currentIndentLevel }, (_, i) => (
                  <span key={i}>  │</span>
                ))}
              </span>
            )}
            
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 100)}
              placeholder="Start your atomic list..."
              className="flex-1 bg-transparent border-none outline-none text-base font-mono min-w-0"
              style={{ color: theme.text }}
            />
            
            {currentInput && (
              <button
                onClick={() => addNode(currentInput)}
                className="flex-shrink-0 p-2 rounded-lg"
                style={{ 
                  backgroundColor: theme.accent,
                  color: theme.text
                }}
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          
          {/* Context Indicator */}
          {activeNodeId && (
            <div 
              className="mt-3 p-2 rounded-lg text-sm"
              style={{ 
                backgroundColor: theme.border,
                color: theme.text
              }}
            >
              Adding child to: <strong>"{nodes.find(n => n.id === activeNodeId)?.content}"</strong>
            </div>
          )}
          
          {/* Instructions */}
          {nodes.length === 0 && !isInputFocused && (
            <div 
              className="mt-3 text-center text-xs opacity-60"
              style={{ color: theme.text }}
            >
              Long press nodes to select • Swipe to indent/outdent
            </div>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-sm rounded-xl p-6"
            style={{ 
              backgroundColor: theme.nodeBackground,
              color: theme.text,
              border: `2px solid ${theme.border}`
            }}
          >
            <div className="text-center mb-6">
              <div 
                className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.border }}
              >
                <AlertTriangle size={24} style={{ color: theme.text }} />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">
                {currentTheme === 'matcha' ? 'Clear your garden?' :
                 currentTheme === 'latte' ? 'Start fresh?' :
                 currentTheme === 'ocean' ? 'Clear the waters?' :
                 currentTheme === 'sunset' ? 'End this chapter?' :
                 currentTheme === 'midnight' ? 'Clear the darkness?' :
                 currentTheme === 'plum' ? 'Prune the garden?' :
                 currentTheme === 'chess' ? 'Reset the board?' :
                 'Empty the cup?'}
              </h3>
              <p className="text-sm opacity-75">
                This will remove all your notes permanently.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.text,
                  borderColor: theme.border
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2 rounded-lg"
                style={{ 
                  backgroundColor: '#ef4444',
                  color: 'white'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-md max-h-[80vh] rounded-xl overflow-hidden"
            style={{ 
              backgroundColor: theme.nodeBackground,
              color: theme.text,
              border: `2px solid ${theme.border}`
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: theme.border }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">About Atomic List</h2>
                <button
                  onClick={() => setShowAbout(false)}
                  className="p-1 rounded"
                  style={{ color: theme.text }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4 text-sm">
                <p>
                  A beautiful hierarchical note-taking app designed for mobile-first thinking.
                </p>
                
                <div>
                  <h3 className="font-medium mb-2">Mobile Gestures:</h3>
                  <ul className="space-y-1 text-xs opacity-75">
                    <li>• Long press to select nodes</li>
                    <li>• Swipe right to indent</li>
                    <li>• Swipe left to outdent</li>
                    <li>• Tap ⋮ for node actions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Task Management:</h3>
                  <ul className="space-y-1 text-xs opacity-75">
                    <li>• Type [] to create tasks</li>
                    <li>• Tap circle to complete</li>
                    <li>• Organize with hierarchy</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Features:</h3>
                  <ul className="space-y-1 text-xs opacity-75">
                    <li>• Works offline as PWA</li>
                    <li>• Multiple beautiful themes</li>
                    <li>• Export/import data</li>
                    <li>• Auto-save to device</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for animations */}
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInSlide {
          animation: fadeInSlide 0.3s ease-out;
        }

        /* Better touch targets */
        button {
          min-height: 44px;
          min-width: 44px;
        }

        /* Smooth scrolling */
        * {
          -webkit-overflow-scrolling: touch;
        }

        /* Hide scrollbar but keep functionality */
        .overflow-y-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-y-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MobileAtomicListApp;