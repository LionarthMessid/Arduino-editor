import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  FileText, 
  Save, 
  Play, 
  Upload, 
  Monitor, 
  BarChart3, 
  Settings,
  FolderOpen,
  Plus,
  Trash2,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Terminal,
  Zap,
  Code,
  Wrench
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ArduinoCodeEditor = () => {
  // State management
  const [code, setCode] = useState(`void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
  Serial.println("Hello Arduino!");
}`);

  const [activeTab, setActiveTab] = useState('main.ino');
  const [tabs, setTabs] = useState([{ name: 'main.ino', content: code, path: '/tmp/arduino_workspace/main.ino' }]);
  const [rightPanelView, setRightPanelView] = useState('');
  const [serialData, setSerialData] = useState([]);
  const [serialOutput, setSerialOutput] = useState('');
  const [boards, setBoards] = useState([]);
  const [ports, setPorts] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedPort, setSelectedPort] = useState('');
  const [workspaceTree, setWorkspaceTree] = useState([]);
  const [compileOutput, setCompileOutput] = useState('');
  const [uploadOutput, setUploadOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLibraryManager, setShowLibraryManager] = useState(false);
  const [showBoardManager, setShowBoardManager] = useState(false);
  const [serialInput, setSerialInput] = useState('');
  const [plotData, setPlotData] = useState([]);
  const [availableBoards, setAvailableBoards] = useState([]);
  const [availableLibraries, setAvailableLibraries] = useState([]);
  const [cores, setCores] = useState([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [isSearchingLibraries, setIsSearchingLibraries] = useState(false);
  const [isInstallingLibrary, setIsInstallingLibrary] = useState(false);
  const [isInstallingCore, setIsInstallingCore] = useState(false);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  
  const wsRef = useRef(null);
  const editorRef = useRef(null);

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

  // API calls
  const loadBoards = async () => {
    try {
      const response = await axios.get(`${API}/boards`);
      if (response.data.success) {
        const boardsArray = response.data.boards || [];
        setBoards(boardsArray);
        if (boardsArray.length > 0) {
          setSelectedBoard(boardsArray[0].fqbn);
        }
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadPorts = async () => {
    try {
      const response = await axios.get(`${API}/ports`);
      if (response.data.success) {
        const portsArray = response.data.ports.detected_ports || [];
        setPorts(portsArray);
        if (portsArray.length > 0) {
          setSelectedPort(portsArray[0].port);
        }
      }
    } catch (error) {
      console.error('Error loading ports:', error);
    }
  };

  const loadLibraries = async () => {
    try {
      const response = await axios.get(`${API}/libraries`);
      if (response.data.success) {
        const librariesArray = response.data.libraries || [];
        setLibraries(librariesArray);
      }
    } catch (error) {
      console.error('Error loading libraries:', error);
    }
  };

  const loadWorkspace = async () => {
    try {
      const response = await axios.get(`${API}/workspace`);
      if (response.data.success) {
        setWorkspaceTree(response.data.tree);
      }
    } catch (error) {
      console.error('Error loading workspace:', error);
    }
  };

  const loadAvailableBoards = async () => {
    try {
      const response = await axios.get(`${API}/boards/available`);
      if (response.data.success) {
        setAvailableBoards(response.data.boards || []);
      }
    } catch (error) {
      console.error('Error loading available boards:', error);
    }
  };

  const loadCores = async () => {
    try {
      const response = await axios.get(`${API}/cores`);
      if (response.data.success) {
        setCores(response.data.cores || []);
      }
    } catch (error) {
      console.error('Error loading cores:', error);
    }
  };

  const loadAvailablePlatforms = async () => {
    try {
      const response = await axios.get(`${API}/cores/search`);
      if (response.data.success) {
        setAvailablePlatforms(response.data.platforms || []);
      }
    } catch (error) {
      console.error('Error loading available platforms:', error);
    }
  };

  const searchLibraries = async (query = '') => {
    setIsSearchingLibraries(true);
    try {
      const response = await axios.post(`${API}/libraries/search`, { query });
      if (response.data.success) {
        setAvailableLibraries(response.data.libraries || []);
      }
    } catch (error) {
      console.error('Error searching libraries:', error);
    }
    setIsSearchingLibraries(false);
  };

  const installLibrary = async (libraryName) => {
    setIsInstallingLibrary(true);
    try {
      const response = await axios.post(`${API}/libraries/install`, { library_name: libraryName });
      if (response.data.success) {
        await loadLibraries(); // Refresh installed libraries
        alert('Library installed successfully!');
      } else {
        alert('Failed to install library: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error installing library:', error);
      alert('Error installing library');
    }
    setIsInstallingLibrary(false);
  };

  const installCore = async (coreName) => {
    setIsInstallingCore(true);
    try {
      const response = await axios.post(`${API}/cores/install`, { core_name: coreName });
      if (response.data.success) {
        await loadCores(); // Refresh cores
        await loadBoards(); // Refresh available boards
        await loadAvailablePlatforms(); // Refresh available platforms
        alert('Core installed successfully!');
      } else {
        alert('Failed to install core: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error installing core:', error);
      alert('Error installing core: ' + error.message);
    }
    setIsInstallingCore(false);
  };

  const saveFile = async (path, content) => {
    try {
      await axios.post(`${API}/files`, { path, content });
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const compileCode = async () => {
    setIsCompiling(true);
    setCompileOutput('Compiling...');
    try {
      const response = await axios.post(`${API}/compile`, {
        code: code,
        board: selectedBoard,
        sketch_path: '/tmp/arduino_workspace'
      });
      setCompileOutput(response.data.message);
    } catch (error) {
      setCompileOutput(`Error: ${error.message}`);
    }
    setIsCompiling(false);
  };

  const uploadCode = async () => {
    if (!selectedPort) {
      setUploadOutput('Please select a port first');
      return;
    }
    
    setIsUploading(true);
    setUploadOutput('Uploading...');
    try {
      const response = await axios.post(`${API}/upload`, {
        code: code,
        board: selectedBoard,
        port: selectedPort,
        sketch_path: '/tmp/arduino_workspace'
      });
      setUploadOutput(response.data.message);
    } catch (error) {
      setUploadOutput(`Error: ${error.message}`);
    }
    setIsUploading(false);
  };

  // Serial monitor WebSocket
  const connectSerial = () => {
    if (!selectedPort) return;
    
    const wsUrl = `${BACKEND_URL.replace('http', 'ws')}/api/serial/${selectedPort}`;
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
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
  };

  const sendSerialData = () => {
    if (wsRef.current && serialInput) {
      wsRef.current.send(serialInput);
      setSerialInput('');
    }
  };

  const toggleRightPanel = (view) => {
    setRightPanelView(rightPanelView === view ? '' : view);
  };

  const FileTreeItem = ({ item, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className={`ml-${level * 4}`}>
        <div 
          className="flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer"
          onClick={() => {
            if (item.type === 'file') {
              // Open file in editor
              setActiveTab(item.name);
              const existingTab = tabs.find(t => t.path === item.path);
              if (!existingTab) {
                setTabs([...tabs, { name: item.name, content: '', path: item.path }]);
              }
            } else {
              setIsOpen(!isOpen);
            }
          }}
        >
          {item.type === 'directory' ? (
            isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <FileText size={16} />
          )}
          <span className="ml-2 text-sm">{item.name}</span>
        </div>
        {item.type === 'directory' && isOpen && item.children && (
          <div>
            {item.children.map((child, index) => (
              <FileTreeItem key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {/* Top Menu Bar */}
      <div className="bg-gray-800 border-b border-gray-600 px-4 py-2">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <span className="font-semibold">Arduino IDE</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 rounded hover:bg-gray-700"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="dropdown">
              <button className="px-3 py-1 hover:bg-gray-700 rounded">File</button>
              <div className="dropdown-content">
                <button onClick={() => setTabs([...tabs, { name: 'new.ino', content: '', path: '' }])}>
                  New
                </button>
                <button onClick={() => saveFile(tabs.find(t => t.name === activeTab)?.path, code)}>
                  Save
                </button>
              </div>
            </div>
            
            <div className="dropdown">
              <button className="px-3 py-1 hover:bg-gray-700 rounded">Edit</button>
            </div>
            
            <div className="dropdown">
              <button className="px-3 py-1 hover:bg-gray-700 rounded">Tools</button>
              <div className="dropdown-content">
                <button onClick={compileCode}>Compile</button>
                <button onClick={uploadCode}>Upload</button>
                <button onClick={() => setShowBoardManager(true)}>Board Manager</button>
                <button onClick={() => setShowLibraryManager(true)}>Library Manager</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="w-80 bg-gray-800 border-r border-gray-600 flex flex-col">
          {/* File Manager */}
          <div className="flex-1 p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <FolderOpen size={16} className="mr-2" />
              Workspace
            </h3>
            <div className="bg-gray-700 rounded p-2 max-h-60 overflow-y-auto">
              {workspaceTree.map((item, index) => (
                <FileTreeItem key={index} item={item} />
              ))}
            </div>
          </div>

          {/* Tools Section */}
          <div className="p-4 border-t border-gray-600">
            <h3 className="font-semibold mb-2">Tools</h3>
            
            {/* COM Port Selection */}
            <div className="mb-4">
              <label className="block text-sm mb-1">COM Port</label>
              <div className="flex">
                <select 
                  value={selectedPort} 
                  onChange={(e) => setSelectedPort(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-2 py-1 rounded-l text-sm"
                >
                  <option value="">Select Port</option>
                  {ports.map((port, index) => (
                    <option key={index} value={port.port}>{port.port}</option>
                  ))}
                </select>
                <button 
                  onClick={loadPorts}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-r"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Board Selection */}
            <div className="mb-4">
              <label className="block text-sm mb-1">Board</label>
              <select 
                value={selectedBoard} 
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full bg-gray-700 text-white px-2 py-1 rounded text-sm"
              >
                <option value="">Select Board</option>
                {boards.map((board, index) => (
                  <option key={index} value={board.fqbn}>{board.name}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={compileCode}
                disabled={isCompiling}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-2 rounded flex items-center justify-center"
              >
                {isCompiling ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Play size={16} className="mr-2" />}
                {isCompiling ? 'Compiling...' : 'Compile'}
              </button>
              
              <button
                onClick={uploadCode}
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded flex items-center justify-center"
              >
                {isUploading ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              
              <button
                onClick={() => setShowLibraryManager(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded flex items-center justify-center"
              >
                <Wrench size={16} className="mr-2" />
                Libraries
              </button>
              
              <button
                onClick={() => setShowBoardManager(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded flex items-center justify-center"
              >
                <Settings size={16} className="mr-2" />
                Boards
              </button>
            </div>
          </div>
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          <div className="bg-gray-800 border-b border-gray-600 px-4 py-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-3 py-1 rounded ${activeTab === tab.name ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {tab.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTabs(tabs.filter(t => t.name !== tab.name));
                      if (activeTab === tab.name && tabs.length > 1) {
                        setActiveTab(tabs[0].name);
                      }
                    }}
                    className="ml-2 hover:bg-red-600 rounded px-1"
                  >
                    ×
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              ref={editorRef}
              height="100%"
              defaultLanguage="cpp"
              theme={darkMode ? "vs-dark" : "vs-light"}
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-40 bg-gray-800 border-t border-gray-600 p-4">
            <h3 className="font-semibold mb-2">Output</h3>
            <div className="bg-gray-900 p-2 rounded h-32 overflow-y-auto text-sm font-mono">
              {compileOutput && <div className="text-green-400">{compileOutput}</div>}
              {uploadOutput && <div className="text-blue-400">{uploadOutput}</div>}
            </div>
          </div>
        </div>

        {/* Right Panel - Serial Monitor/Plotter */}
        <div className="flex">
          {/* Toggle Buttons */}
          <div className="bg-gray-800 border-l border-gray-600 p-2 flex flex-col space-y-2">
            <button
              onClick={() => toggleRightPanel('serial')}
              className={`p-2 rounded ${rightPanelView === 'serial' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title="Serial Monitor"
            >
              <Monitor size={20} />
            </button>
            <button
              onClick={() => toggleRightPanel('plotter')}
              className={`p-2 rounded ${rightPanelView === 'plotter' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              title="Serial Plotter"
            >
              <BarChart3 size={20} />
            </button>
          </div>

          {/* Right Panel Content */}
          {rightPanelView && (
            <div className="w-80 bg-gray-800 border-l border-gray-600 flex flex-col">
              {rightPanelView === 'serial' && (
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Serial Monitor</h3>
                    <button
                      onClick={connectSerial}
                      className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-sm"
                    >
                      Connect
                    </button>
                  </div>
                  <div className="bg-gray-900 p-2 rounded h-64 overflow-y-auto text-sm font-mono mb-2">
                    {serialOutput}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={serialInput}
                      onChange={(e) => setSerialInput(e.target.value)}
                      className="flex-1 bg-gray-700 text-white px-2 py-1 rounded-l text-sm"
                      placeholder="Send data..."
                      onKeyPress={(e) => e.key === 'Enter' && sendSerialData()}
                    />
                    <button
                      onClick={sendSerialData}
                      className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-r"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {rightPanelView === 'plotter' && (
                <div className="flex-1 p-4">
                  <h3 className="font-semibold mb-2">Serial Plotter</h3>
                  <div className="bg-gray-900 p-2 rounded h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={plotData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Library Manager Modal */}
      {showLibraryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold mb-4">Library Manager</h3>
            
            {/* Search Box */}
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search libraries..."
                  value={librarySearchQuery}
                  onChange={(e) => setLibrarySearchQuery(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l text-sm"
                />
                <button
                  onClick={() => searchLibraries(librarySearchQuery)}
                  disabled={isSearchingLibraries}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-r"
                >
                  {isSearchingLibraries ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Installed Libraries */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Installed Libraries</h4>
              <div className="max-h-32 overflow-y-auto bg-gray-700 rounded p-2">
                {libraries.length === 0 ? (
                  <p className="text-gray-400 text-sm">No libraries installed</p>
                ) : (
                  libraries.map((lib, index) => (
                    <div key={index} className="flex items-center justify-between py-1 border-b border-gray-600">
                      <div>
                        <span className="text-sm font-medium">{lib.name}</span>
                        <span className="text-xs text-gray-400 ml-2">v{lib.version}</span>
                      </div>
                      <button 
                        onClick={() => {
                          // TODO: Implement uninstall
                          console.log('Uninstall', lib.name);
                        }}
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Libraries */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Available Libraries</h4>
              <div className="max-h-60 overflow-y-auto bg-gray-700 rounded p-2">
                {availableLibraries.length === 0 ? (
                  <p className="text-gray-400 text-sm">Search for libraries to install</p>
                ) : (
                  availableLibraries.map((lib, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-600">
                      <div>
                        <span className="text-sm font-medium">{lib.name}</span>
                        <span className="text-xs text-gray-400 ml-2">v{lib.latest?.version}</span>
                        <p className="text-xs text-gray-500 mt-1">{lib.latest?.sentence}</p>
                      </div>
                      <button 
                        onClick={() => installLibrary(lib.name)}
                        disabled={isInstallingLibrary}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {isInstallingLibrary ? 'Installing...' : 'Install'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowLibraryManager(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Manager Modal */}
      {showBoardManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <h3 className="font-semibold mb-4">Board Manager</h3>
            
            {/* Installed Cores */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Installed Cores</h4>
              <div className="max-h-32 overflow-y-auto bg-gray-700 rounded p-2">
                {cores.length === 0 ? (
                  <p className="text-gray-400 text-sm">No cores installed</p>
                ) : (
                  cores.map((core, index) => (
                    <div key={index} className="flex items-center justify-between py-1 border-b border-gray-600">
                      <div>
                        <span className="text-sm font-medium">{core.name}</span>
                        <span className="text-xs text-gray-400 ml-2">v{core.version}</span>
                      </div>
                      <button 
                        onClick={() => {
                          // TODO: Implement uninstall
                          console.log('Uninstall core', core.id);
                        }}
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Available Boards */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Available Boards</h4>
              <div className="max-h-60 overflow-y-auto bg-gray-700 rounded p-2">
                {availableBoards.length === 0 ? (
                  <p className="text-gray-400 text-sm">No boards available</p>
                ) : (
                  availableBoards.map((board, index) => (
                    <div key={index} className="py-2 border-b border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{board.name}</div>
                          <div className="text-xs text-gray-400">{board.fqbn}</div>
                          <div className="text-xs text-gray-500">{board.platform?.metadata?.maintainer}</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-xs text-gray-400">
                            {board.platform?.release?.installed ? 'Installed' : 'Not Installed'}
                          </div>
                          {!board.platform?.release?.installed && (
                            <button 
                              onClick={() => installCore(board.platform?.metadata?.id)}
                              disabled={isInstallingCore}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-2 py-1 rounded text-xs mt-1"
                            >
                              {isInstallingCore ? 'Installing...' : 'Install'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowBoardManager(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArduinoCodeEditor;