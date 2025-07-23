import React from 'react';
import useArduino from '../../hooks/useArduino';
import './Toolbar.css';

const Toolbar = () => {
  const { 
    compileCode, 
    uploadCode, 
    setShowLibraryManager, 
    setShowBoardManager,
    toggleRightPanel,
    rightPanelView,
    ports,
    selectedPort,
    setSelectedPort,
    boards,
    selectedBoard,
    setSelectedBoard,
    loadPorts
  } = useArduino();

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button className="toolbar-button" onClick={() => alert('New file functionality to be implemented')}>
          <i className="fas fa-file"></i> New
        </button>
        <button className="toolbar-button" onClick={() => alert('Open file functionality to be implemented')}>
          <i className="fas fa-folder-open"></i> Open
        </button>
        <button className="toolbar-button" onClick={() => alert('Save file functionality to be implemented')}>
          <i className="fas fa-save"></i> Save
        </button>
      </div>

      <div className="toolbar-section">
        <select 
          className="port-select" 
          value={selectedPort} 
          onChange={(e) => setSelectedPort(e.target.value)}
        >
          <option value="">Select Port</option>
          {ports.map((port) => (
            <option key={port.port.address} value={port.port.address}>
              {port.port.address} - {port.port.label || 'Unknown'}
            </option>
          ))}
        </select>
        <button className="toolbar-button refresh" onClick={loadPorts}>
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      <div className="toolbar-section">
        <select 
          className="board-select" 
          value={selectedBoard} 
          onChange={(e) => setSelectedBoard(e.target.value)}
        >
          <option value="">Select Board</option>
          {boards.map((board) => (
            <option key={board.fqbn} value={board.fqbn}>
              {board.name}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-section">
        <button className="toolbar-button compile" onClick={compileCode}>
          <i className="fas fa-check"></i> Verify
        </button>
        <button className="toolbar-button upload" onClick={uploadCode}>
          <i className="fas fa-arrow-right"></i> Upload
        </button>
      </div>

      <div className="toolbar-section">
        <button 
          className={`toolbar-button ${rightPanelView === 'serial-monitor' ? 'active' : ''}`} 
          onClick={() => toggleRightPanel('serial-monitor')}
        >
          <i className="fas fa-terminal"></i> Serial Monitor
        </button>
        <button 
          className={`toolbar-button ${rightPanelView === 'serial-plotter' ? 'active' : ''}`} 
          onClick={() => toggleRightPanel('serial-plotter')}
        >
          <i className="fas fa-chart-line"></i> Serial Plotter
        </button>
      </div>

      <div className="toolbar-section">
        <button className="toolbar-button" onClick={() => setShowLibraryManager(true)}>
          <i className="fas fa-book"></i> Library Manager
        </button>
        <button className="toolbar-button" onClick={() => setShowBoardManager(true)}>
          <i className="fas fa-microchip"></i> Board Manager
        </button>
      </div>
    </div>
  );
};

export default Toolbar;