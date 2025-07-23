import React, { useEffect, useRef } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import useArduino from '../../hooks/useArduino';
import './Editor.css';

const Editor = () => {
  const { 
    code, 
    setCode, 
    activeTab, 
    setActiveTab, 
    tabs, 
    setTabs,
    saveFile
  } = useArduino();
  
  const editorRef = useRef(null);

  // Handle editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // Set editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on'
    });
  };

  // Handle code change
  const handleCodeChange = (value) => {
    setCode(value);
    
    // Update the content of the active tab
    const updatedTabs = tabs.map(tab => {
      if (tab.name === activeTab) {
        return { ...tab, content: value };
      }
      return tab;
    });
    
    setTabs(updatedTabs);
  };

  // Handle tab click
  const handleTabClick = (tabName) => {
    // Save current tab content
    const currentTab = tabs.find(tab => tab.name === activeTab);
    if (currentTab && currentTab.path) {
      saveFile(currentTab.path, code);
    }
    
    // Switch to the clicked tab
    setActiveTab(tabName);
    
    // Update code with the content of the clicked tab
    const clickedTab = tabs.find(tab => tab.name === tabName);
    if (clickedTab) {
      setCode(clickedTab.content);
    }
  };

  // Handle tab close
  const handleTabClose = (e, tabName) => {
    e.stopPropagation();
    
    // Don't close if it's the last tab
    if (tabs.length <= 1) return;
    
    // Remove the tab
    const updatedTabs = tabs.filter(tab => tab.name !== tabName);
    setTabs(updatedTabs);
    
    // If the active tab is being closed, switch to another tab
    if (activeTab === tabName) {
      const newActiveTab = updatedTabs[0].name;
      setActiveTab(newActiveTab);
      setCode(updatedTabs[0].content);
    }
  };

  // Auto-save effect
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const currentTab = tabs.find(tab => tab.name === activeTab);
      if (currentTab && currentTab.path) {
        saveFile(currentTab.path, code);
      }
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [activeTab, code, tabs, saveFile]);

  return (
    <div className="editor-container">
      <div className="editor-tabs">
        {tabs.map((tab) => (
          <div 
            key={tab.name}
            className={`editor-tab ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.name)}
          >
            <span>{tab.name}</span>
            <button 
              className="tab-close"
              onClick={(e) => handleTabClose(e, tab.name)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <div className="monaco-editor-wrapper">
        <MonacoEditor
          height="100%"
          defaultLanguage="cpp"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly: false
          }}
        />
      </div>
    </div>
  );
};

export default Editor;