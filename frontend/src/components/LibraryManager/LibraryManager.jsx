import React, { useState, useEffect } from 'react';
import useArduino from '../../hooks/useArduino';
import './LibraryManager.css';

const LibraryManager = () => {
  const { 
    libraries, 
    availableLibraries, 
    isSearchingLibraries, 
    isInstallingLibrary,
    searchLibraries,
    installLibrary,
    setShowLibraryManager,
    loadLibraries
  } = useArduino();
  
  const [activeTab, setActiveTab] = useState('installed');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search to avoid too many requests
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    setSearchTimeout(setTimeout(() => {
      if (activeTab === 'available') {
        searchLibraries(query);
      }
    }, 500));
  };
  
  // Filter installed libraries based on search query
  const filteredInstalledLibraries = libraries.filter(lib => {
    const searchLower = searchQuery.toLowerCase();
    return (
      lib.name.toLowerCase().includes(searchLower) ||
      (lib.author && lib.author.toLowerCase().includes(searchLower)) ||
      (lib.category && lib.category.toLowerCase().includes(searchLower))
    );
  });
  
  // Handle tab change
  useEffect(() => {
    if (activeTab === 'available') {
      searchLibraries(searchQuery);
    }
  }, [activeTab, searchLibraries]);
  
  // Handle install library
  const handleInstallLibrary = async (libraryName) => {
    await installLibrary(libraryName);
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    if (activeTab === 'installed') {
      await loadLibraries();
    } else {
      await searchLibraries(searchQuery);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="library-manager-modal">
        <div className="modal-header">
          <h2>Library Manager</h2>
          <button className="close-button" onClick={() => setShowLibraryManager(false)}>
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
            placeholder={activeTab === 'installed' ? "Filter installed libraries..." : "Search libraries..."}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="refresh-button" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
        
        <div className="modal-content">
          {activeTab === 'installed' ? (
            <div className="installed-libraries">
              {filteredInstalledLibraries.length > 0 ? (
                <table className="libraries-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Version</th>
                      <th>Author</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstalledLibraries.map((lib, index) => (
                      <tr key={index}>
                        <td>{lib.name}</td>
                        <td>{lib.version || 'Unknown'}</td>
                        <td>{lib.author || 'Unknown'}</td>
                        <td>{lib.category || 'Uncategorized'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-items-message">
                  {searchQuery ? 'No libraries match your search.' : 'No libraries installed.'}
                </div>
              )}
            </div>
          ) : (
            <div className="available-libraries">
              {isSearchingLibraries ? (
                <div className="loading-message">
                  Searching libraries...
                </div>
              ) : isInstallingLibrary ? (
                <div className="loading-message">
                  Installing library... This may take a few minutes.
                </div>
              ) : availableLibraries.length > 0 ? (
                <div className="libraries-list">
                  {availableLibraries.map((lib, index) => (
                    <div key={index} className="library-item">
                      <div className="library-info">
                        <div className="library-name">{lib.name}</div>
                        <div className="library-author">
                          {lib.author ? `by ${lib.author}` : ''}
                          {lib.version ? ` (${lib.version})` : ''}
                        </div>
                        <div className="library-description">
                          {lib.paragraph || lib.sentence || 'No description available.'}
                        </div>
                      </div>
                      <button 
                        className="install-button"
                        onClick={() => handleInstallLibrary(lib.name)}
                        disabled={isInstallingLibrary}
                      >
                        Install
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-items-message">
                  {searchQuery ? 'No libraries match your search.' : 'Type in the search box to find libraries.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryManager;