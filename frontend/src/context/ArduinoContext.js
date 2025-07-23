import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Create context
export const ArduinoContext = createContext();

// Provider component
export const ArduinoProvider = ({ children }) => {
  // State for boards
  const [boards, setBoards] = useState([]);
  const [availableBoards, setAvailableBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  
  // State for ports
  const [ports, setPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');
  
  // State for libraries
  const [libraries, setLibraries] = useState([]);
  const [availableLibraries, setAvailableLibraries] = useState([]);
  const [isSearchingLibraries, setIsSearchingLibraries] = useState(false);
  const [isInstallingLibrary, setIsInstallingLibrary] = useState(false);
  
  // State for cores
  const [cores, setCores] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [isInstallingCore, setIsInstallingCore] = useState(false);
  
  // State for code
  const [code, setCode] = useState(`void setup() {\n  Serial.begin(9600);\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n  Serial.println("Hello Arduino!");\n}`);
  const [activeTab, setActiveTab] = useState('main.ino');
  const [tabs, setTabs] = useState([{ name: 'main.ino', content: '', path: '/tmp/arduino_workspace/main.ino' }]);
  
  // State for workspace
  const [workspaceTree, setWorkspaceTree] = useState([]);
  
  // State for output
  const [compileOutput, setCompileOutput] = useState('');
  const [uploadOutput, setUploadOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for serial
  const [serialOutput, setSerialOutput] = useState('');
  const [serialInput, setSerialInput] = useState('');
  const [plotData, setPlotData] = useState([]);
  const [serialWebSocket, setSerialWebSocket] = useState(null);
  
  // State for UI
  const [darkMode, setDarkMode] = useState(true);
  const [rightPanelView, setRightPanelView] = useState('');
  const [showLibraryManager, setShowLibraryManager] = useState(false);
  const [showBoardManager, setShowBoardManager] = useState(false);
  
  // Load initial data
  useEffect(() => {
    loadBoards();
    loadPorts();
    loadLibraries();
    loadWorkspace();
    loadAvailableBoards();
    loadCores();
    loadAvailablePlatforms();
    searchLibraries(); // Load initial library list
  }, []);
  
  // Load boards
  const loadBoards = async () => {
    try {
      const response = await api.boards.getBoards();
      if (response.success) {
        const boardsArray = response.boards || [];
        setBoards(boardsArray);
        if (boardsArray.length > 0 && !selectedBoard) {
          setSelectedBoard(boardsArray[0].fqbn);
        }
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };
  
  // Load available boards
  const loadAvailableBoards = async () => {
    try {
      const response = await api.boards.getAvailableBoards();
      if (response.success) {
        setAvailableBoards(response.boards || []);
      }
    } catch (error) {
      console.error('Error loading available boards:', error);
    }
  };
  
  // Load ports
  const loadPorts = async () => {
    try {
      const response = await api.ports.getPorts();
      if (response.success) {
        const portsArray = response.ports.detected_ports || [];
        setPorts(portsArray);
        if (portsArray.length > 0 && !selectedPort) {
          setSelectedPort(portsArray[0].port.address);
        }
      }
    } catch (error) {
      console.error('Error loading ports:', error);
    }
  };
  
  // Load libraries
  const loadLibraries = async () => {
    try {
      const response = await api.libraries.getLibraries();
      if (response.success) {
        const librariesArray = response.libraries || [];
        // Transform the library data to match the expected format
        const formattedLibraries = librariesArray.map(lib => ({
          name: lib.library?.name || 'Unknown Library',
          version: lib.library?.version || lib.library?.latest?.version || '0.0.0',
          author: lib.library?.author || 'Unknown',
          maintainer: lib.library?.maintainer || 'Unknown',
          website: lib.library?.website || '',
          category: lib.library?.category || 'Uncategorized'
        }));
        setLibraries(formattedLibraries);
      }
    } catch (error) {
      console.error('Error loading libraries:', error);
    }
  };
  
  // Load workspace
  const loadWorkspace = async () => {
    try {
      const response = await api.files.getWorkspace();
      if (response.success) {
        setWorkspaceTree(response.tree);
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
    }
  };
  
  // Load cores
  const loadCores = async () => {
    try {
      const response = await api.cores.getCores();
      if (response.success) {
        setCores(response.cores || []);
      }
    } catch (error) {
      console.error('Error loading cores:', error);
    }
  };
  
  // Load available platforms
  const loadAvailablePlatforms = async () => {
    try {
      const response = await api.cores.searchCores();
      if (response.success) {
        setAvailablePlatforms(response.platforms || []);
      }
    } catch (error) {
      console.error('Error loading available platforms:', error);
    }
  };
  
  // Search libraries
  const searchLibraries = async (query = '') => {
    setIsSearchingLibraries(true);
    try {
      const response = await api.libraries.searchLibraries(query);
      if (response.success) {
        setAvailableLibraries(response.libraries || []);
      }
    } catch (error) {
      console.error('Error searching libraries:', error);
    }
    setIsSearchingLibraries(false);
  };
  
  // Install library
  const installLibrary = async (libraryName) => {
    setIsInstallingLibrary(true);
    try {
      const response = await api.libraries.installLibrary(libraryName);
      if (response.success) {
        await loadLibraries(); // Refresh installed libraries
        alert(`Library "${libraryName}" installed successfully!`);
      } else {
        alert('Failed to install library: ' + response.message);
      }
    } catch (error) {
      console.error('Error installing library:', error);
      alert('Error installing library: ' + error.message);
    }
    setIsInstallingLibrary(false);
  };
  
  // Install core
  const installCore = async (coreName) => {
    setIsInstallingCore(true);
    try {
      const response = await api.cores.installCore(coreName);
      if (response.success) {
        await loadCores(); // Refresh cores
        await loadBoards(); // Refresh available boards
        await loadAvailablePlatforms(); // Refresh available platforms
        alert('Core installed successfully!');
      } else {
        alert('Failed to install core: ' + response.message);
      }
    } catch (error) {
      console.error('Error installing core:', error);
      alert('Error installing core: ' + error.message);
    }
    setIsInstallingCore(false);
  };
  
  // Save file
  const saveFile = async (path, content) => {
    try {
      await api.files.saveFile(path, content);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };
  
  // Compile code
  const compileCode = async () => {
    setIsCompiling(true);
    setCompileOutput('Compiling...');
    try {
      const response = await api.code.compileCode(code, selectedBoard, '/tmp/arduino_workspace');
      setCompileOutput(response.message);
    } catch (error) {
      setCompileOutput(`Error: ${error.message}`);
    }
    setIsCompiling(false);
  };
  
  // Upload code
  const uploadCode = async () => {
    if (!selectedPort) {
      setUploadOutput('Please select a port first');
      return;
    }
    
    setIsUploading(true);
    setUploadOutput('Uploading...');
    try {
      const response = await api.code.uploadCode(code, selectedBoard, selectedPort, '/tmp/arduino_workspace');
      setUploadOutput(response.message);
    } catch (error) {
      setUploadOutput(`Error: ${error.message}`);
    }
    setIsUploading(false);
  };
  
  // Connect to serial
  const connectSerial = useCallback(() => {
    if (!selectedPort) return;
    
    const ws = api.serial.connectWebSocket(selectedPort);
    
    ws.onmessage = (event) => {
      const data = event.data;
      setSerialOutput(prev => prev + data + '\n');
      
      // Try to parse as numeric data for plotting
      const numericValue = parseFloat(data);
      if (!isNaN(numericValue)) {
        setPlotData(prev => [...prev.slice(-49), { 
          time: Date.now(), 
          value: numericValue 
        }]);
      }
    };
    
    setSerialWebSocket(ws);
  }, [selectedPort]);
  
  // Send serial data
  const sendSerialData = useCallback(() => {
    if (serialWebSocket && serialInput) {
      serialWebSocket.send(serialInput);
      setSerialInput('');
    }
  }, [serialWebSocket, serialInput]);
  
  // Toggle right panel
  const toggleRightPanel = (view) => {
    setRightPanelView(rightPanelView === view ? '' : view);
  };
  
  // Context value
  const value = {
    // Boards
    boards,
    availableBoards,
    selectedBoard,
    setSelectedBoard,
    loadBoards,
    loadAvailableBoards,
    
    // Ports
    ports,
    selectedPort,
    setSelectedPort,
    loadPorts,
    
    // Libraries
    libraries,
    availableLibraries,
    isSearchingLibraries,
    isInstallingLibrary,
    loadLibraries,
    searchLibraries,
    installLibrary,
    
    // Cores
    cores,
    availablePlatforms,
    isInstallingCore,
    loadCores,
    loadAvailablePlatforms,
    installCore,
    
    // Code
    code,
    setCode,
    activeTab,
    setActiveTab,
    tabs,
    setTabs,
    
    // Workspace
    workspaceTree,
    loadWorkspace,
    
    // Output
    compileOutput,
    uploadOutput,
    isCompiling,
    isUploading,
    
    // Actions
    saveFile,
    compileCode,
    uploadCode,
    
    // Serial
    serialOutput,
    setSerialOutput,
    serialInput,
    setSerialInput,
    plotData,
    connectSerial,
    sendSerialData,
    
    // UI
    darkMode,
    setDarkMode,
    rightPanelView,
    toggleRightPanel,
    showLibraryManager,
    setShowLibraryManager,
    showBoardManager,
    setShowBoardManager
  };
  
  return (
    <ArduinoContext.Provider value={value}>
      {children}
    </ArduinoContext.Provider>
  );
};