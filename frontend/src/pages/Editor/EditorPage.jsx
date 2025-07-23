import React from 'react';
import Toolbar from '../../components/Toolbar/Toolbar';
import FileExplorer from '../../components/FileExplorer/FileExplorer';
import Editor from '../../components/Editor/Editor';
import SerialMonitor from '../../components/SerialMonitor/SerialMonitor';
import SerialPlotter from '../../components/SerialPlotter/SerialPlotter';
import BoardManager from '../../components/BoardManager/BoardManager';
import LibraryManager from '../../components/LibraryManager/LibraryManager';
import useArduino from '../../hooks/useArduino';
import './EditorPage.css';

const EditorPage = () => {
  const { 
    rightPanelView, 
    showBoardManager, 
    showLibraryManager,
    compileOutput,
    uploadOutput,
    isCompiling,
    isUploading
  } = useArduino();

  return (
    <div className="editor-page">
      <Toolbar />
      
      <div className="main-content">
        <div className="left-panel">
          <FileExplorer />
        </div>
        
        <div className="center-panel">
          <Editor />
          
          <div className="output-panel">
            <div className="output-header">
              <span>Output</span>
            </div>
            <div className="output-content">
              {isCompiling && <div className="output-section">Compiling...</div>}
              {compileOutput && !isCompiling && (
                <div className="output-section">
                  <div className="output-title">Compile Output:</div>
                  <pre>{compileOutput}</pre>
                </div>
              )}
              
              {isUploading && <div className="output-section">Uploading...</div>}
              {uploadOutput && !isUploading && (
                <div className="output-section">
                  <div className="output-title">Upload Output:</div>
                  <pre>{uploadOutput}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={`right-panel ${rightPanelView ? 'visible' : ''}`}>
          {rightPanelView === 'serial-monitor' && <SerialMonitor />}
          {rightPanelView === 'serial-plotter' && <SerialPlotter />}
        </div>
      </div>
      
      {showBoardManager && <BoardManager />}
      {showLibraryManager && <LibraryManager />}
    </div>
  );
};

export default EditorPage;