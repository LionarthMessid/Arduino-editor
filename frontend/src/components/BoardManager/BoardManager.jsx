import React, { useState } from 'react';
import useArduino from '../../hooks/useArduino';
import './BoardManager.css';

const BoardManager = () => {
  const { 
    cores, 
    availablePlatforms, 
    installCore, 
    isInstallingCore,
    setShowBoardManager,
    loadCores,
    loadBoards
  } = useArduino();
  
  const [activeTab, setActiveTab] = useState('installed');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter platforms based on search query
  const filteredPlatforms = availablePlatforms.filter(platform => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (platform.name && platform.name.toLowerCase().includes(searchLower)) ||
      (platform.id && platform.id.toLowerCase().includes(searchLower)) ||
      (platform.boards && platform.boards.some(board => 
        board.name && board.name.toLowerCase().includes(searchLower)
      ))
    );
  });
  
  // Handle install core
  const handleInstallCore = async (platformId) => {
    await installCore(platformId);
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    await loadCores();
    await loadBoards();
  };
  
  return (
    <div className="modal-overlay">
      <div className="board-manager-modal">
        <div className="modal-header">
          <h2>Board Manager</h2>
          <button className="close-button" onClick={() => setShowBoardManager(false)}>
            ×
          </button>
        </div>
        
        <div className="modal-tabs">
          <button 
            className={`tab-button ${activeTab === 'installed' ? 'active' : ''}`}
            onClick={() => setActiveTab('installed')}
          >
            Installed
          </button>
          <button 
            className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available
          </button>
        </div>
        
        <div className="modal-search">
          <input
            type="text"
            placeholder="Search boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="refresh-button" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
        
        <div className="modal-content">
          {activeTab === 'installed' ? (
            <div className="installed-cores">
              {cores.length > 0 ? (
                <table className="cores-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Version</th>
                      <th>Boards</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cores.map((core, index) => (
                      <tr key={index}>
                        <td>{core.id}</td>
                        <td>{core.version || 'Unknown'}</td>
                        <td>{core.boards?.length || 0} boards</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-items-message">
                  No cores installed. Go to the "Available" tab to install cores.
                </div>
              )}
            </div>
          ) : (
            <div className="available-platforms">
              {isInstallingCore ? (
                <div className="loading-message">
                  Installing core... This may take a few minutes.
                </div>
              ) : filteredPlatforms.length > 0 ? (
                <div className="platforms-list">
                  {filteredPlatforms.map((platform, index) => (
                    <div key={index} className="platform-item">
                      <div className="platform-info">
                        <div className="platform-name">{platform.name}</div>
                        <div className="platform-id">{platform.id}</div>
                        <div className="platform-description">
                          {platform.boards?.length || 0} boards available
                        </div>
                      </div>
                      <button 
                        className="install-button"
                        onClick={() => handleInstallCore(platform.id)}
                        disabled={isInstallingCore}
                      >
                        Install
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-items-message">
                  No platforms found matching your search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardManager;