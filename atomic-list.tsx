import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Palette, Save, Download, Upload, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Search, FileText, X, Link, ExternalLink, Info, Circle, CheckCircle2, ListTodo } from 'lucide-react';

const AtomicListApp = () => {
  const [nodes, setNodes] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentIndentLevel, setCurrentIndentLevel] = useState(0);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [focusNote, setFocusNote] = useState('');
  const [showLinkConfirm, setShowLinkConfirm] = useState(false);
  const [linkNodeId, setLinkNodeId] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [navigationMode, setNavigationMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('matcha');
  const inputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  const themes = {
    matcha: {
      name: 'Matcha',
      background: '#E8F5E8',
      nodeBackground: '#F0F8F0',
      text: '#2D4A2D',
      prompt: '#5A7A5A',
      border: '#C5D6C5'
    },
    latte: {
      name: 'Latte',
      background: '#F5F0E8',
      nodeBackground: '#F8F5F0',
      text: '#4A3D2D',
      prompt: '#7A6A5A',
      border: '#D6CCC5'
    },
    ocean: {
      name: 'Ocean',
      background: '#E8F0F5',
      nodeBackground: '#F0F5F8',
      text: '#2D3D4A',
      prompt: '#5A6A7A',
      border: '#C5CCD6'
    },
    sunset: {
      name: 'Sunset',
      background: '#F5E8E8',
      nodeBackground: '#F8F0F0',
      text: '#4A2D2D',
      prompt: '#7A5A5A',
      border: '#D6C5C5'
    },
    midnight: {
      name: 'Midnight',
      background: '#0F0F23',
      nodeBackground: '#1A1A2E',
      text: '#E0E0E0',
      prompt: '#8B8B8B',
      border: '#2D2D44'
    },
    plum: {
      name: 'Plum',
      background: '#F3E8F5',
      nodeBackground: '#F8F0FA',
      text: '#4A2D4A',
      prompt: '#7A5A7A',
      border: '#D6C5D6'
    },
    chess: {
      name: 'Chess',
      background: '#F8F8F8',
      nodeBackground: '#FFFFFF',
      text: '#1A1A1A',
      prompt: '#666666',
      border: '#E0E0E0'
    },
    espresso: {
      name: 'Espresso',
      background: '#2C1810',
      nodeBackground: '#3D241A',
      text: '#E8D5C4',
      prompt: '#B8956F',
      border: '#5D3E2A'
    }
  };

  const theme = themes[currentTheme];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [nodes]);

  // Helper to safely use localStorage (works in artifacts and regular browsers)
  const useLocalStorage = () => {
    try {
      return typeof localStorage !== 'undefined' && localStorage ? localStorage : null;
    } catch {
      return null;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't interfere with input focus or modals
      if (isInputFocused || focusedNodeId || showAbout || showClearConfirm || showLinkConfirm) return;
      
      // Enter navigation mode with arrow keys or vim keys
      if (['ArrowUp', 'ArrowDown', 'k', 'j'].includes(e.key) && !navigationMode) {
        e.preventDefault();
        setNavigationMode(true);
        if (nodes.length > 0) {
          setActiveNodeId(nodes[0].id);
        }
        return;
      }
      
      if (navigationMode && nodes.length > 0) {
        const currentIndex = nodes.findIndex(node => node.id === activeNodeId);
        const activeNode = nodes.find(node => node.id === activeNodeId);
        
        switch (e.key) {
          case 'ArrowUp':
          case 'k':
            e.preventDefault();
            if (currentIndex > 0) {
              setActiveNodeId(nodes[currentIndex - 1].id);
            }
            break;
            
          case 'ArrowDown':
          case 'j':
            e.preventDefault();
            if (currentIndex < nodes.length - 1) {
              setActiveNodeId(nodes[currentIndex + 1].id);
            }
            break;
            
          case 'ArrowLeft':
          case 'h':
            e.preventDefault();
            if (activeNode && activeNode.level > 0) {
              setNodes(prev => prev.map(node => 
                node.id === activeNodeId 
                  ? { ...node, level: Math.max(0, node.level - 1) }
                  : node
              ));
            }
            break;
            
          case 'ArrowRight':
          case 'l':
            e.preventDefault();
            if (activeNode) {
              setNodes(prev => prev.map(node => 
                node.id === activeNodeId 
                  ? { ...node, level: node.level + 1 }
                  : node
              ));
            }
            break;
            
          case 'Enter':
            e.preventDefault();
            setSelectedNodeId(activeNodeId);
            break;
            
          case 't':
            e.preventDefault();
            if (activeNode) {
              handleToggleTask(activeNodeId);
            }
            break;
            
          case 'f':
            e.preventDefault();
            handleNodeFocus(activeNodeId);
            break;
            
          case 'x':
            e.preventDefault();
            handleNodeLink(activeNodeId);
            break;
            
          case 'Delete':
          case 'Backspace':
          case 'd':
            e.preventDefault();
            const nodeIndex = nodes.findIndex(n => n.id === activeNodeId);
            handleNodeDelete(activeNodeId);
            // Move to next node or previous if at end
            if (nodes.length > 1) {
              const nextIndex = nodeIndex < nodes.length - 1 ? nodeIndex : nodeIndex - 1;
              if (nextIndex >= 0 && nodes[nextIndex]) {
                setActiveNodeId(nodes[nextIndex].id);
              } else {
                setActiveNodeId(null);
                setNavigationMode(false);
              }
            } else {
              setActiveNodeId(null);
              setNavigationMode(false);
            }
            break;
            
          case 'Escape':
            e.preventDefault();
            setActiveNodeId(null);
            setNavigationMode(false);
            setSelectedNodeId(null);
            if (inputRef.current) {
              inputRef.current.focus();
            }
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigationMode, activeNodeId, nodes, isInputFocused, focusedNodeId, showAbout, showClearConfirm, showLinkConfirm]);

  // Local save functionality
  useEffect(() => {
    // Load from localStorage on mount
    const storage = useLocalStorage();
    if (!storage) return; // Skip if localStorage not available (like in artifacts)
    
    const savedData = storage.getItem('atomic-list-autosave');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.nodes && data.nodes.length > 0) {
          setNodes(data.nodes);
          setCurrentTheme(data.currentTheme || 'matcha');
          setCurrentIndentLevel(data.currentIndentLevel || 0);
        }
      } catch (error) {
        console.error('Error loading autosave:', error);
      }
    }
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    // Don't autosave during upload process
    if (isUploading) return;
    
    const storage = useLocalStorage();
    if (!storage) return; // Skip if localStorage not available (like in artifacts)
    
    const dataToSave = {
      nodes,
      currentTheme,
      currentIndentLevel,
      timestamp: new Date().toISOString()
    };
    storage.setItem('atomic-list-autosave', JSON.stringify(dataToSave));
  }, [nodes, currentTheme, currentIndentLevel, isUploading]);

  const parseHierarchy = (text) => {
    const leadingSpaces = text.match(/^ */)[0].length;
    const level = Math.floor(leadingSpaces / 2);
    const content = text.trim();
    return { level, content, leadingSpaces };
  };

  const handleKeyPress = (e) => {
    // Handle Tab for indenting
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Tab: decrease indent
        setCurrentIndentLevel(prev => Math.max(0, prev - 1));
      } else {
        // Tab: increase indent
        setCurrentIndentLevel(prev => prev + 1);
      }
      return;
    }

    if (e.key === 'Enter' && currentInput.trim()) {
      const content = currentInput.trim();
      
      // Determine the insertion position and level
      let insertIndex = nodes.length;
      let newLevel = currentIndentLevel;
      
      // If there's an active/selected node, insert as its child
      const contextNodeId = activeNodeId || selectedNodeId;
      if (contextNodeId) {
        const contextNode = nodes.find(n => n.id === contextNodeId);
        const contextIndex = nodes.findIndex(n => n.id === contextNodeId);
        
        if (contextNode && contextIndex !== -1) {
          // Set level to be one deeper than the context node
          newLevel = contextNode.level + 1;
          
          // Find where to insert - after the context node and all its children
          let insertAfterIndex = contextIndex;
          for (let i = contextIndex + 1; i < nodes.length; i++) {
            if (nodes[i].level > contextNode.level) {
              insertAfterIndex = i;
            } else {
              break;
            }
          }
          insertIndex = insertAfterIndex + 1;
        }
      }
      
      const newNode = {
        id: Date.now(),
        content,
        level: newLevel,
        note: '',
        isLinked: false,
        isTask: false,
        isCompleted: false,
        isNew: true
      };
      
      // Insert the new node at the calculated position
      const newNodes = [...nodes];
      newNodes.splice(insertIndex, 0, newNode);
      setNodes(newNodes);
      
      setCurrentInput('');
      
      // Update current indent level to match the new node
      setCurrentIndentLevel(newLevel);
      
      // Keep the parent node selected so user can continue adding children
      // Don't clear activeNodeId or selectedNodeId here
      
      // Auto-scroll to bottom to keep the latest node visible
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 50);
      
      // Remove the isNew flag after animation
      setTimeout(() => {
        setNodes(prev => prev.map(node => 
          node.id === newNode.id ? { ...node, isNew: false } : node
        ));
      }, 300);
    }
  };

  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    setShowThemeMenu(false);
  };

  const generateMarkdown = () => {
    return nodes.map(node => {
      const indent = '  '.repeat(node.level);
      let content = `${indent}- ${node.content}`;
      
      // Add note if it exists
      if (node.note && node.note.trim()) {
        const noteLines = node.note.trim().split('\n');
        const indentedNote = noteLines.map(line => 
          `${indent}  > ${line}`
        ).join('\n');
        content += '\n' + indentedNote;
      }
      
      return content;
    }).join('\n');
  };

  const generateHTML = () => {
    const data = {
      nodes,
      currentTheme,
      timestamp: new Date().toISOString()
    };
    
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Atomic List Save</title>
    <script>
        // Atomic List Save Data
        window.ATOMIC_LIST_DATA = ${JSON.stringify(data, null, 2)};
    </script>
</head>
<body>
    <h1>Atomic List</h1>
    <p>Saved on: ${new Date().toLocaleString()}</p>
    <p>To continue editing, upload this file back to the Atomic List app.</p>
    <pre>${generateMarkdown()}</pre>
</body>
</html>`;
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMD = () => {
    const markdown = generateMarkdown();
    
    // Generate UUID (simple version)
    const generateUID = () => {
      return Math.random().toString(36).substr(2, 8);
    };

    // Sanitize node content for filename
    const sanitizeForFilename = (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .substring(0, 30); // Limit length
    };

    // Find the first level 0 node for filename
    const firstLevelZeroNode = nodes.find(node => node.level === 0);
    const listName = firstLevelZeroNode 
      ? sanitizeForFilename(firstLevelZeroNode.content)
      : 'untitled';

    const uid = generateUID();
    const filename = `atomic-list-${listName}-${uid}.md`;
    downloadFile(markdown, filename, 'text/markdown');
    setShowSaveMenu(false);
  };

  const handleDownloadHTML = () => {
    const html = generateHTML();
    
    // Generate UUID (simple version)
    const generateUID = () => {
      return Math.random().toString(36).substr(2, 8);
    };

    // Sanitize node content for filename
    const sanitizeForFilename = (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .substring(0, 30); // Limit length
    };

    // Find the first level 0 node for filename
    const firstLevelZeroNode = nodes.find(node => node.level === 0);
    const listName = firstLevelZeroNode 
      ? sanitizeForFilename(firstLevelZeroNode.content)
      : 'untitled';

    const uid = generateUID();
    const filename = `atomic-list-${listName}-${uid}.html`;
    downloadFile(html, filename, 'text/html');
    setShowSaveMenu(false);
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
    setShowSaveMenu(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File size limit: 5MB (reasonable for text-based atomic list saves)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Please select a file smaller than 5MB.');
      event.target.value = '';
      return;
    }

    // Only allow HTML files
    if (!file.name.toLowerCase().endsWith('.html') && file.type !== 'text/html') {
      alert('Please upload a valid HTML file saved from Atomic Lists.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      // Basic HTML validation - check for required structure
      if (!content.includes('<!DOCTYPE html>') || !content.includes('<html>')) {
        alert('Invalid HTML file format. Please upload a file saved from Atomic Lists.');
        setIsUploading(false);
        event.target.value = '';
        return;
      }
      
      // Try to extract data from HTML file
      const scriptMatch = content.match(/window\.ATOMIC_LIST_DATA = ({[\s\S]*?});/);
      if (scriptMatch) {
        try {
          const data = JSON.parse(scriptMatch[1]);
          
          // Validate data structure
          if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure');
          }
          
          // Validate nodes array
          if (data.nodes && !Array.isArray(data.nodes)) {
            throw new Error('Invalid nodes data');
          }
          
          // Validate each node has required properties
          if (data.nodes) {
            for (const node of data.nodes) {
              if (!node || typeof node !== 'object' || typeof node.content !== 'string' || typeof node.level !== 'number') {
                throw new Error('Invalid node structure');
              }
            }
          }
          
          // Set all data at once to avoid partial state updates
          setCurrentTheme(data.currentTheme || 'matcha');
          setNodes(data.nodes || []);
          setCurrentIndentLevel(data.currentIndentLevel || 0);
          
          // Auto-scroll to bottom after loading
          setTimeout(() => {
            if (scrollAreaRef.current) {
              scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            }
            // Re-enable autosave after everything is loaded
            setIsUploading(false);
          }, 200);
        } catch (error) {
          console.error('File parsing error:', error);
          alert('Error loading file: Invalid or corrupted Atomic Lists save file.');
          setIsUploading(false);
        }
      } else {
        alert('This doesn\'t appear to be a valid Atomic Lists save file. Please upload an HTML file saved from this app.');
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsUploading(false);
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleClearConfirm = () => {
    setNodes([]);
    setCurrentIndentLevel(0);
    
    // Clear autosave if localStorage is available
    const storage = useLocalStorage();
    if (storage) {
      storage.removeItem('atomic-list-autosave');
    }
    
    setShowClearConfirm(false);
  };

  const handleClearCancel = () => {
    setShowClearConfirm(false);
  };

  const handleNodeClick = (nodeId) => {
    setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
  };

  const handleNodeSwipe = (nodeId, direction) => {
    if (direction === 'right') {
      // Swipe right = indent
      setNodes(prev => prev.map(node => 
        node.id === nodeId 
          ? { ...node, level: node.level + 1 }
          : node
      ));
    } else if (direction === 'left') {
      // Swipe left = outdent
      setNodes(prev => prev.map(node => 
        node.id === nodeId 
          ? { ...node, level: Math.max(0, node.level - 1) }
          : node
      ));
    }
  };

  const handleTouchStart = (e, nodeId) => {
    const touch = e.touches[0];
    e.currentTarget.touchStartX = touch.clientX;
    e.currentTarget.touchStartY = touch.clientY;
    e.currentTarget.touchStartTime = Date.now();
    e.currentTarget.nodeId = nodeId;
    
    // Set up long press timer
    e.currentTarget.longPressTimer = setTimeout(() => {
      // Long press detected - select node
      handleNodeClick(nodeId);
      e.currentTarget.isLongPress = true;
    }, 500); // 500ms for long press
  };

  const handleTouchMove = (e) => {
    // If user moves too much during touch, cancel long press
    if (!e.currentTarget.touchStartX || !e.currentTarget.touchStartY) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - e.currentTarget.touchStartX);
    const deltaY = Math.abs(touch.clientY - e.currentTarget.touchStartY);
    
    // If movement is more than 10px, cancel long press
    if (deltaX > 10 || deltaY > 10) {
      if (e.currentTarget.longPressTimer) {
        clearTimeout(e.currentTarget.longPressTimer);
        e.currentTarget.longPressTimer = null;
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!e.currentTarget.touchStartX || !e.currentTarget.touchStartY) return;
    
    // Clear long press timer
    if (e.currentTarget.longPressTimer) {
      clearTimeout(e.currentTarget.longPressTimer);
      e.currentTarget.longPressTimer = null;
    }
    
    // If this was a long press, don't do anything else
    if (e.currentTarget.isLongPress) {
      e.currentTarget.isLongPress = false;
      // Clean up
      delete e.currentTarget.touchStartX;
      delete e.currentTarget.touchStartY;
      delete e.currentTarget.touchStartTime;
      delete e.currentTarget.nodeId;
      return;
    }
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - e.currentTarget.touchStartX;
    const deltaY = touch.clientY - e.currentTarget.touchStartY;
    const nodeId = e.currentTarget.nodeId;
    const touchDuration = Date.now() - e.currentTarget.touchStartTime;
    
    // Only register as swipe if horizontal movement is greater than vertical,
    // movement is at least 50px, and it was a quick gesture (not a long press)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && touchDuration < 300) {
      e.preventDefault();
      if (deltaX > 0) {
        // Swiped right - indent
        handleNodeSwipe(nodeId, 'right');
      } else {
        // Swiped left - outdent
        handleNodeSwipe(nodeId, 'left');
      }
    }
    // Note: Removed regular tap selection - now only long press selects
    
    // Clean up
    delete e.currentTarget.touchStartX;
    delete e.currentTarget.touchStartY;
    delete e.currentTarget.touchStartTime;
    delete e.currentTarget.nodeId;
  };

  const handleNodeUnindent = (nodeId) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, level: Math.max(0, node.level - 1) }
        : node
    ));
    setSelectedNodeId(null);
  };

  const handleNodeIndent = (nodeId) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, level: node.level + 1 }
        : node
    ));
    setSelectedNodeId(null);
  };

  const handleNodeDelete = (nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setSelectedNodeId(null);
  };

  const handleNodeFocus = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    setFocusedNodeId(nodeId);
    setFocusNote(node?.note || '');
    setSelectedNodeId(null);
  };

  const handleFocusClose = () => {
    if (focusedNodeId) {
      // Save the note to the node
      setNodes(prev => prev.map(node => 
        node.id === focusedNodeId 
          ? { ...node, note: focusNote }
          : node
      ));
    }
    setFocusedNodeId(null);
    setFocusNote('');
  };

  const handleNodeLink = (nodeId) => {
    setLinkNodeId(nodeId);
    setShowLinkConfirm(true);
    setSelectedNodeId(null);
  };

  const handleLinkConfirm = () => {
    const linkNode = nodes.find(n => n.id === linkNodeId);
    if (!linkNode) return;

    // Generate UUID (simple version)
    const generateUID = () => {
      return Math.random().toString(36).substr(2, 8);
    };

    // Sanitize node content for filename
    const sanitizeForFilename = (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .substring(0, 30); // Limit length
    };

    // Find the first level 0 node for current list filename
    const firstLevelZeroNode = nodes.find(node => node.level === 0);
    const currentListName = firstLevelZeroNode 
      ? sanitizeForFilename(firstLevelZeroNode.content)
      : 'untitled';

    // Generate filenames
    const currentUID = generateUID();
    const newUID = generateUID();
    const currentFilename = `atomic-list-${currentListName}-${currentUID}.md`;
    const newFilename = `atomic-list-${sanitizeForFilename(linkNode.content)}-${newUID}.md`;

    // Update the nodes with link info BEFORE saving
    const updatedNodes = nodes.map(node => 
      node.id === linkNodeId 
        ? { 
            ...node, 
            isLinked: true,
            note: (node.note || '') + `\n\nLinked to: ${newFilename}`
          }
        : node
    );

    // Generate markdown with the updated nodes
    const updatedMarkdown = updatedNodes.map(node => {
      const indent = '  '.repeat(node.level);
      let content = `${indent}- ${node.content}`;
      
      // Add note if it exists
      if (node.note && node.note.trim()) {
        const noteLines = node.note.trim().split('\n');
        const indentedNote = noteLines.map(line => 
          `${indent}  > ${line}`
        ).join('\n');
        content += '\n' + indentedNote;
      }
      
      return content;
    }).join('\n');

    // Download current list with updated link info
    downloadFile(updatedMarkdown, currentFilename, 'text/markdown');

    // Update the state with link info
    setNodes(updatedNodes);

    // Wait a moment for the download, then create new list
    setTimeout(() => {
      // Find all nodes that are children of the linked node
      const linkedNodeLevel = linkNode.level;
      const linkedNodeIndex = updatedNodes.findIndex(n => n.id === linkNodeId);
      
      // Get the linked node and its children
      const newNodes = [];
      for (let i = linkedNodeIndex; i < updatedNodes.length; i++) {
        const node = updatedNodes[i];
        if (i === linkedNodeIndex) {
          // This is the main node - make it level 0 and add inheritance note
          const inheritanceNote = `\n\nInherited from: ${currentFilename}`;
          newNodes.push({
            ...node,
            level: 0,
            note: (node.note || '') + inheritanceNote,
            isLinked: false, // Reset link status in new list
            id: Date.now() + i // New ID to avoid conflicts
          });
        } else if (node.level > linkedNodeLevel) {
          // This is a child - adjust its level
          newNodes.push({
            ...node,
            level: node.level - linkedNodeLevel,
            id: Date.now() + i // New ID to avoid conflicts
          });
        } else {
          // We've moved past the children
          break;
        }
      }

      // Set the new list
      setNodes(newNodes);
      setCurrentIndentLevel(0);
      
      // Clear autosave if localStorage is available
      const storage = useLocalStorage();
      if (storage) {
        storage.removeItem('atomic-list-autosave');
      }
      
    }, 500);

    setShowLinkConfirm(false);
    setLinkNodeId(null);
  };

  const handleLinkCancel = () => {
    setShowLinkConfirm(false);
    setLinkNodeId(null);
  };

  const handleToggleTask = (nodeId) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isTask: !node.isTask, isCompleted: false } // Reset completion when toggling task status
        : node
    ));
    setSelectedNodeId(null);
  };

  const handleToggleComplete = (nodeId) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, isCompleted: !node.isCompleted }
        : node
    ));
  };

  const handleClearAll = () => {
    if (nodes.length === 0) return;
    setShowClearConfirm(true);
  };

  return (
    <div 
      className="min-h-screen w-full transition-colors duration-300 relative"
      style={{ backgroundColor: theme.background }}
    >
      {/* Theme, Save, Clear, and Info Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        {/* Info Button */}
        <button
          onClick={() => setShowAbout(true)}
          className="p-2 rounded-lg transition-colors duration-200 hover:opacity-80"
          style={{ 
            backgroundColor: theme.nodeBackground,
            color: theme.text,
            border: `1px solid ${theme.border}`
          }}
          title="About Atomic Lists"
        >
          <Info size={20} />
        </button>

        {/* Clear All Button */}
        <div className="relative">
          <button
            onClick={() => {
              if (nodes.length === 0) return;
              setShowClearConfirm(true);
            }}
            className="p-2 rounded-lg transition-colors duration-200 hover:opacity-80"
            style={{ 
              backgroundColor: theme.nodeBackground,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              opacity: nodes.length === 0 ? 0.4 : 1
            }}
            title="Clear All"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Save Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSaveMenu(!showSaveMenu)}
            className="p-2 rounded-lg transition-colors duration-200 hover:opacity-80"
            style={{ 
              backgroundColor: theme.nodeBackground,
              color: theme.text,
              border: `1px solid ${theme.border}`
            }}
          >
            <Save size={20} />
          </button>
          
          {showSaveMenu && (
            <div 
              className="absolute right-0 mt-2 py-2 rounded-lg shadow-lg border min-w-40 z-50"
              style={{ 
                backgroundColor: theme.nodeBackground,
                borderColor: theme.border
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleDownloadMD}
                className="w-full px-4 py-2 text-left hover:opacity-80 transition-opacity duration-150 flex items-center space-x-2"
                style={{ color: theme.text }}
              >
                <Download size={16} />
                <span>Download .md</span>
              </button>
              <button
                onClick={handleDownloadHTML}
                className="w-full px-4 py-2 text-left hover:opacity-80 transition-opacity duration-150 flex items-center space-x-2"
                style={{ color: theme.text }}
              >
                <Save size={16} />
                <span>Save .html</span>
              </button>
              <button
                onClick={handleUpload}
                className="w-full px-4 py-2 text-left hover:opacity-80 transition-opacity duration-150 flex items-center space-x-2"
                style={{ color: theme.text }}
              >
                <Upload size={16} />
                <span>Upload</span>
              </button>
            </div>
          )}
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".html"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-lg transition-colors duration-200 hover:opacity-80"
            style={{ 
              backgroundColor: theme.nodeBackground,
              color: theme.text,
              border: `1px solid ${theme.border}`
            }}
          >
            <Palette size={20} />
          </button>
          
          {showThemeMenu && (
            <div 
              className="absolute right-0 mt-2 py-2 rounded-lg shadow-lg border min-w-32"
              style={{ 
                backgroundColor: theme.nodeBackground,
                borderColor: theme.border
              }}
            >
              {Object.entries(themes).map(([key, themeOption]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className="w-full px-4 py-2 text-left hover:opacity-80 transition-opacity duration-150"
                  style={{ 
                    color: theme.text,
                    backgroundColor: currentTheme === key ? theme.border : 'transparent'
                  }}
                >
                  {themeOption.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div 
            className="rounded-xl p-6 max-w-sm mx-4 shadow-xl"
            style={{ 
              backgroundColor: theme.nodeBackground,
              color: theme.text,
              border: `2px solid ${theme.border}`,
              ...(currentTheme === 'matcha' && {
                boxShadow: '0 20px 40px rgba(45, 74, 45, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }),
              ...(currentTheme === 'latte' && {
                boxShadow: '0 20px 40px rgba(74, 61, 45, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }),
              ...(currentTheme === 'ocean' && {
                boxShadow: '0 20px 40px rgba(45, 61, 74, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }),
              ...(currentTheme === 'sunset' && {
                boxShadow: '0 20px 40px rgba(74, 45, 45, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }),
              ...(currentTheme === 'midnight' && {
                boxShadow: '0 20px 40px rgba(15, 15, 35, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              }),
              ...(currentTheme === 'plum' && {
                boxShadow: '0 20px 40px rgba(74, 45, 74, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }),
              ...(currentTheme === 'chess' && {
                boxShadow: '0 20px 40px rgba(26, 26, 26, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }),
              ...(currentTheme === 'espresso' && {
                boxShadow: '0 20px 40px rgba(44, 24, 16, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              })
            }}
          >
            <div className="text-center mb-6">
              <div 
                className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: theme.border,
                  boxShadow: `0 6px 20px rgba(0, 0, 0, 0.15)`
                }}
              >
                <AlertTriangle size={24} style={{ color: theme.text }} />
              </div>
              
              {currentTheme === 'matcha' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Clear your garden?</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    This will remove all your carefully cultivated thoughts.<br/>
                    <em>They cannot be replanted once cleared.</em>
                  </p>
                </>
              )}
              
              {currentTheme === 'latte' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Start fresh?</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    This will clear your cozy workspace of all notes.<br/>
                    <em>Like wiping a clean slate for new ideas.</em>
                  </p>
                </>
              )}
              
              {currentTheme === 'ocean' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Clear the waters?</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    This will wash away all your collected thoughts.<br/>
                    <em>Once the tide clears, they're gone forever.</em>
                  </p>
                </>
              )}
              
              {currentTheme === 'sunset' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">End this chapter?</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    This will fade all your notes into the sunset.<br/>
                    <em>A new dawn awaits, but this moment will pass.</em>
                  </p>
                </>
              )}
              
              {currentTheme === 'midnight' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Clear the darkness?</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    This will erase all thoughts from the night.<br/>
                    <em>Dawn will bring fresh possibilities.</em>
                  </p>
                </>
              )}
              
              {currentTheme === 'plum' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Prune the garden?</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    This will clear away all your cultivated ideas.<br/>
                    <em>Fresh blooms await in the silence.</em>
                  </p>
                </>
              )}
              
              {currentTheme === 'chess' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Reset the board?</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    This will clear all pieces from play.<br/>
                    <em>A new game awaits your opening move.</em>
                  </p>
                </>
              )}
              
              {currentTheme === 'espresso' && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Empty the cup?</h3>
                  <p className="text-sm opacity-75 leading-relaxed">
                    This will clear away all your brewing thoughts.<br/>
                    <em>A fresh roast awaits your inspiration.</em>
                  </p>
                </>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClearCancel}
                className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.text,
                  borderColor: theme.border
                }}
              >
                {currentTheme === 'matcha' ? 'Keep Growing' : 
                 currentTheme === 'latte' ? 'Stay Cozy' :
                 currentTheme === 'ocean' ? 'Keep Sailing' : 
                 currentTheme === 'midnight' ? 'Keep Dreaming' :
                 currentTheme === 'plum' ? 'Keep Blooming' :
                 currentTheme === 'chess' ? 'Continue Playing' :
                 currentTheme === 'espresso' ? 'Keep Brewing' : 'Continue Writing'}
              </button>
              <button
                onClick={handleClearConfirm}
                className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none'
                }}
              >
                {currentTheme === 'matcha' ? 'Clear Garden' : 
                 currentTheme === 'latte' ? 'Fresh Start' :
                 currentTheme === 'ocean' ? 'Clear Waters' : 
                 currentTheme === 'midnight' ? 'New Dawn' :
                 currentTheme === 'plum' ? 'Prune Garden' :
                 currentTheme === 'chess' ? 'Reset Board' :
                 currentTheme === 'espresso' ? 'Empty Cup' : 'New Chapter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{ 
              backgroundColor: theme.nodeBackground,
              border: `2px solid ${theme.border}`
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center space-x-3">
                <Info size={24} style={{ color: theme.text }} />
                <h2 className="text-xl font-semibold" style={{ color: theme.text }}>
                  About Atomic Lists
                </h2>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                className="p-1 rounded-lg hover:opacity-80 transition-opacity"
                style={{ color: theme.text }}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto" style={{ color: theme.text }}>
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">The Philosophy</h3>
                  <p className="leading-relaxed opacity-90">
                    Atomic Lists embrace the power of simplicity. Like atoms forming molecules, 
                    individual thoughts combine to create complex ideas. This minimalist approach 
                    lets you capture ideas quickly, organize them naturally, and let meaningful 
                    connections emerge organically.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Core Features</h3>
                  <div className="space-y-3 opacity-90">
                    <div>
                      <strong>Hierarchical Thinking:</strong> Use indentation (Tab/Shift+Tab) to create 
                      natural thought structures without rigid formatting.
                    </div>
                    <div>
                      <strong>Focus Mode:</strong> Click the magnifying glass to dive deep into any 
                      node with detailed notes while keeping the main structure clean.
                    </div>
                    <div>
                      <strong>Linked Networks:</strong> Create interconnected webs of knowledge by 
                      linking nodes to spawn new lists, forming a personal Zettelkasten.
                    </div>
                    <div>
                      <strong>Themed Environments:</strong> Choose from calming color schemes that 
                      match your mood and thinking style.
                    </div>
                    <div>
                      <strong>Portable Knowledge:</strong> Export as readable Markdown or save as 
                      HTML files that preserve your work across sessions.
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
                  <div className="space-y-2 opacity-90 text-sm">
                    <div>• Start typing at the <code>&gt;</code> prompt</div>
                    <div>• Use <strong>Tab</strong> to indent, <strong>Shift+Tab</strong> to outdent</div>
                    <div>• Click nodes to edit with arrow keys, focus, link, or delete</div>
                    <div>• Use the 🔍 <strong>Focus</strong> button to add detailed notes</div>
                    <div>• Use the 🔗 <strong>Link</strong> button to branch into new lists</div>
                    <div>• Icons show notes (📝) and links (🔗) at a glance</div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">The Vision</h3>
                  <p className="leading-relaxed opacity-90">
                    In a world of complex tools and overwhelming interfaces, Atomic Lists returns 
                    to the essence of thinking: capturing ideas, exploring connections, and building 
                    understanding one thought at a time. Simple, powerful, yours.
                  </p>
                </section>
              </div>
            </div>
            
            {/* Footer */}
            <div 
              className="p-6 border-t flex justify-center"
              style={{ borderColor: theme.border }}
            >
              <button
                onClick={() => setShowAbout(false)}
                className="px-6 py-2 rounded-lg transition-colors duration-200"
                style={{ 
                  backgroundColor: theme.border,
                  color: theme.text
                }}
              >
                Start Creating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Confirmation Modal */}
      {showLinkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div 
            className="rounded-xl p-6 max-w-sm mx-4 shadow-xl"
            style={{ 
              backgroundColor: theme.nodeBackground,
              color: theme.text,
              border: `2px solid ${theme.border}`
            }}
          >
            <div className="text-center mb-6">
              <div 
                className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: '#8b5cf6',
                  boxShadow: `0 6px 20px rgba(139, 92, 246, 0.3)`
                }}
              >
                <Link size={24} style={{ color: 'white' }} />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Create linked list?</h3>
              <p className="text-sm opacity-75 leading-relaxed">
                This will save the current list and start a new one<br/>
                with this node and its children as the foundation.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleLinkCancel}
                className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200 hover:opacity-80"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.text,
                  borderColor: theme.border
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLinkConfirm}
                className="flex-1 px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-90"
                style={{ 
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none'
                }}
              >
                Link & Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Overlay */}
      {focusedNodeId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="w-full max-w-2xl h-96 rounded-xl shadow-2xl flex flex-col"
            style={{ 
              backgroundColor: theme.nodeBackground,
              border: `2px solid ${theme.border}`
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center space-x-3">
                <Search size={20} style={{ color: '#3b82f6' }} />
                <h3 className="font-semibold" style={{ color: theme.text }}>
                  Focus: {nodes.find(n => n.id === focusedNodeId)?.content}
                </h3>
              </div>
              <button
                onClick={handleFocusClose}
                className="p-1 rounded-lg hover:opacity-80 transition-opacity"
                style={{ color: theme.text }}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Note Content */}
            <div className="flex-1 p-4">
              <textarea
                value={focusNote}
                onChange={(e) => setFocusNote(e.target.value)}
                placeholder="Write your detailed notes here..."
                className="w-full h-full resize-none border-none outline-none bg-transparent"
                style={{ 
                  color: theme.text,
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
                autoFocus
              />
            </div>
            
            {/* Footer */}
            <div 
              className="p-4 border-t flex justify-end space-x-3"
              style={{ borderColor: theme.border }}
            >
              <button
                onClick={handleFocusClose}
                className="px-4 py-2 rounded-lg transition-colors duration-200"
                style={{ 
                  backgroundColor: theme.border,
                  color: theme.text
                }}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col h-screen">
        {/* Scrollable Nodes Area */}
        <div 
          ref={scrollAreaRef} 
          className="flex-1 overflow-y-auto p-8 pt-20 pb-4 min-h-0"
          onClick={(e) => {
            // Deselect node if clicking on empty space (not on a node)
            if (e.target === e.currentTarget || e.target.closest('.node-container') === null) {
              setSelectedNodeId(null);
              setActiveNodeId(null);
              setNavigationMode(false);
            }
          }}
        >
          <div className="max-w-2xl mx-auto min-h-full flex flex-col justify-end">
            <div className="space-y-2 flex-shrink-0">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`transform transition-all duration-300 ease-out node-container ${
                    node.isNew 
                      ? 'translate-x-full opacity-0' 
                      : 'translate-x-0 opacity-100'
                  }`}
                  style={{ 
                    marginLeft: `${node.level * 24}px`,
                    animationDelay: node.isNew ? '0ms' : '0ms'
                  }}
                >
                  <div className="relative">
                    <div 
                      className={`px-4 py-3 rounded-lg border shadow-sm cursor-pointer transition-all duration-200 flex items-center justify-between touch-pan-y ${
                        activeNodeId === node.id ? 'ring-2' : ''
                      }`}
                      style={{ 
                        backgroundColor: selectedNodeId === node.id ? theme.border : 
                                        activeNodeId === node.id ? `${theme.border}50` : theme.nodeBackground,
                        color: theme.text,
                        borderColor: selectedNodeId === node.id ? theme.text : theme.border,
                        borderWidth: selectedNodeId === node.id ? '2px' : '1px',
                        ringColor: activeNodeId === node.id ? theme.text : 'transparent',
                        opacity: node.isTask && node.isCompleted ? 0.6 : 1
                      }}
                      onClick={() => handleNodeClick(node.id)}
                      onTouchStart={(e) => handleTouchStart(e, node.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Task Toggle Circle */}
                        {node.isTask && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(node.id);
                            }}
                            className="flex-shrink-0 transition-colors duration-200"
                            style={{ color: theme.text }}
                          >
                            {node.isCompleted ? (
                              <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
                            ) : (
                              <Circle size={18} style={{ opacity: 0.6 }} />
                            )}
                          </button>
                        )}
                        
                        {/* Node Content */}
                        <span 
                          className={`${node.isTask && node.isCompleted ? 'line-through' : ''}`}
                          style={{ 
                            opacity: node.isTask && node.isCompleted ? 0.7 : 1 
                          }}
                        >
                          {node.content}
                        </span>
                      </div>
                      
                      {/* Icons on the right */}
                      <div className="flex items-center space-x-1">
                        {node.isTask && (
                          <ListTodo 
                            size={16} 
                            style={{ color: theme.text, opacity: 0.6 }}
                            title="Task"
                          />
                        )}
                        {node.note && node.note.trim() && (
                          <FileText 
                            size={16} 
                            style={{ color: theme.text, opacity: 0.6 }}
                            title="Has note"
                          />
                        )}
                        {node.isLinked && (
                          <ExternalLink 
                            size={16} 
                            style={{ color: theme.text, opacity: 0.6 }}
                            title="Linked to new list"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Node Menu - Focus and Link only */}
                    {selectedNodeId === node.id && (
                      <div 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleToggleTask(node.id)}
                          className="p-1 rounded transition-all duration-150 hover:opacity-80 hover:scale-105"
                          style={{ 
                            backgroundColor: currentTheme === 'matcha' ? '#10b981' :
                                           currentTheme === 'latte' ? '#059669' :
                                           currentTheme === 'ocean' ? '#0891b2' : 
                                           currentTheme === 'midnight' ? '#06b6d4' :
                                           currentTheme === 'plum' ? '#8b5cf6' :
                                           currentTheme === 'chess' ? '#059669' :
                                           currentTheme === 'espresso' ? '#10b981' : '#059669',
                            color: 'white',
                            boxShadow: `0 2px 4px rgba(0, 0, 0, 0.15)`
                          }}
                          title={node.isTask ? "Convert to Note" : "Convert to Task"}
                        >
                          <ListTodo size={14} />
                        </button>
                        <button
                          onClick={() => handleNodeFocus(node.id)}
                          className="p-1 rounded transition-all duration-150 hover:opacity-80 hover:scale-105"
                          style={{ 
                            backgroundColor: currentTheme === 'matcha' ? '#22c55e' :
                                           currentTheme === 'latte' ? '#f59e0b' :
                                           currentTheme === 'ocean' ? '#3b82f6' : 
                                           currentTheme === 'midnight' ? '#8b5cf6' :
                                           currentTheme === 'plum' ? '#a855f7' :
                                           currentTheme === 'chess' ? '#374151' :
                                           currentTheme === 'espresso' ? '#f59e0b' : '#f97316',
                            color: 'white',
                            boxShadow: `0 2px 4px rgba(0, 0, 0, 0.15)`
                          }}
                          title="Focus / Add Note"
                        >
                          <Search size={14} />
                        </button>
                        <button
                          onClick={() => handleNodeLink(node.id)}
                          className="p-1 rounded transition-all duration-150 hover:opacity-80 hover:scale-105"
                          style={{ 
                            backgroundColor: currentTheme === 'matcha' ? '#8b5cf6' :
                                           currentTheme === 'latte' ? '#a855f7' :
                                           currentTheme === 'ocean' ? '#8b5cf6' : 
                                           currentTheme === 'midnight' ? '#06b6d4' :
                                           currentTheme === 'plum' ? '#06b6d4' :
                                           currentTheme === 'chess' ? '#6b7280' :
                                           currentTheme === 'espresso' ? '#8b5cf6' : '#9333ea',
                            color: 'white',
                            boxShadow: `0 2px 4px rgba(0, 0, 0, 0.15)`
                          }}
                          title="Link / Create New List"
                        >
                          <Link size={14} />
                        </button>
                        <button
                          onClick={() => handleNodeDelete(node.id)}
                          className="p-1 rounded transition-all duration-150 hover:opacity-80 hover:scale-105"
                          style={{ 
                            backgroundColor: currentTheme === 'matcha' ? '#ef4444' :
                                           currentTheme === 'latte' ? '#dc2626' :
                                           currentTheme === 'ocean' ? '#dc2626' : 
                                           currentTheme === 'midnight' ? '#ef4444' :
                                           currentTheme === 'plum' ? '#dc2626' :
                                           currentTheme === 'chess' ? '#dc2626' :
                                           currentTheme === 'espresso' ? '#dc2626' : '#b91c1c',
                            color: 'white',
                            boxShadow: `0 2px 4px rgba(0, 0, 0, 0.15)`
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="flex-shrink-0 p-8 pt-4 bg-inherit" style={{ backgroundColor: theme.background }}>
          <div className="max-w-2xl mx-auto">
            {/* Mobile Tab Controls */}
            {isInputFocused && (
              <div className="flex justify-center space-x-4 mb-4 md:hidden">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setCurrentIndentLevel(prev => Math.max(0, prev - 1));
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  style={{ 
                    backgroundColor: theme.nodeBackground,
                    color: theme.text,
                    border: '1px solid ' + theme.border,
                    opacity: currentIndentLevel === 0 ? 0.5 : 1
                  }}
                  disabled={currentIndentLevel === 0}
                >
                  <ChevronLeft size={16} />
                  <span className="text-sm">Outdent</span>
                </button>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setCurrentIndentLevel(prev => prev + 1);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  style={{ 
                    backgroundColor: theme.nodeBackground,
                    color: theme.text,
                    border: '1px solid ' + theme.border
                  }}
                >
                  <ChevronRight size={16} />
                  <span className="text-sm">Indent</span>
                </button>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span 
                className="text-2xl font-mono"
                style={{ color: theme.prompt }}
              >
                &gt;
              </span>
              {/* Visual indent indicator */}
              {currentIndentLevel > 0 && (
                <span 
                  className="text-sm font-mono opacity-60"
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
                onBlur={() => setTimeout(() => setIsInputFocused(false), 300)}
                placeholder="Start your atomic list..."
                className="flex-1 bg-transparent border-none outline-none text-lg font-mono"
                style={{ color: theme.text }}
              />
            </div>
            
            {/* Instructions */}
            {nodes.length === 0 && (
              <div 
                className="mt-8 text-center text-sm opacity-60 font-mono"
                style={{ color: theme.text }}
              >
                <span className="hidden md:inline">Press Tab to indent • Shift+Tab to outdent • Arrow keys to navigate • Enter to add node</span>
                <span className="md:hidden">Long press to select • Swipe right to indent • Swipe left to outdent • Enter to add node</span>
              </div>
            )}
            
            {/* Context Indicator */}
            {(activeNodeId || selectedNodeId) && (
              <div 
                className="mt-4 mx-auto max-w-2xl px-4 py-2 rounded-lg text-sm font-mono"
                style={{ 
                  backgroundColor: theme.nodeBackground,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  opacity: 0.9
                }}
              >
                <div className="text-center">
                  Next node will be added as child of: <strong>"{nodes.find(n => n.id === (activeNodeId || selectedNodeId))?.content}"</strong>
                </div>
              </div>
            )}
            
            {/* Navigation Help */}
            {navigationMode && (
              <div 
                className="fixed bottom-4 left-4 px-4 py-2 rounded-lg text-xs font-mono opacity-90 hidden md:block"
                style={{ 
                  backgroundColor: theme.nodeBackground,
                  color: theme.text,
                  border: `1px solid ${theme.border}`
                }}
              >
                <div className="space-y-1">
                  <div>↑↓ / j,k: Navigate • ←→ / h,l: Indent/Outdent</div>
                  <div>Enter: Select • t: Toggle Task • f: Focus • x: Link • d: Delete • Esc: Exit</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtomicListApp;