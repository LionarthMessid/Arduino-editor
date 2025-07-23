import React, { useState } from 'react';
import useArduino from '../../hooks/useArduino';
import './FileExplorer.css';

const FileTreeItem = ({ item, level = 0, onFileClick }) => {
  const [expanded, setExpanded] = useState(false);
  const isDirectory = item.type === 'directory';
  
  const handleItemClick = () => {
    if (isDirectory) {
      setExpanded(!expanded);
    } else {
      onFileClick(item);
    }
  };
  
  return (
    <div className="file-tree-item-container">
      <div 
        className={`file-tree-item ${isDirectory ? 'directory' : 'file'}`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleItemClick}
      >
        <span className="file-icon">
          {isDirectory ? (
            expanded ? (
              <i className="fas fa-folder-open"></i>
            ) : (
              <i className="fas fa-folder"></i>
            )
          ) : (
            <i className="fas fa-file-code"></i>
          )}
        </span>
        <span className="file-name">{item.name}</span>
      </div>
      
      {isDirectory && expanded && item.children && (
        <div className="file-tree-children">
          {item.children.map((child, index) => (
            <FileTreeItem 
              key={`${child.name}-${index}`}
              item={child}
              level={level + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = () => {
  const { 
    workspaceTree, 
    loadWorkspace, 
    tabs, 
    setTabs, 
    setActiveTab, 
    setCode 
  } = useArduino();
  
  const handleFileClick = async (file) => {
    // Check if the file is already open in a tab
    const existingTab = tabs.find(tab => tab.path === file.path);
    
    if (existingTab) {
      // Switch to the existing tab
      setActiveTab(existingTab.name);
      setCode(existingTab.content);
    } else {
      // Create a new tab
      try {
        // In a real implementation, we would fetch the file content from the server
        // For now, we'll just create an empty tab
        const newTab = {
          name: file.name,
          content: '', // This would be the actual file content
          path: file.path
        };
        
        const updatedTabs = [...tabs, newTab];
        setTabs(updatedTabs);
        setActiveTab(file.name);
        setCode(newTab.content);
      } catch (error) {
        console.error('Error opening file:', error);
      }
    }
  };
  
  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span>Workspace</span>
        <button className="refresh-button" onClick={loadWorkspace}>
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      
      <div className="file-tree">
        {workspaceTree.length > 0 ? (
          workspaceTree.map((item, index) => (
            <FileTreeItem 
              key={`${item.name}-${index}`}
              item={item}
              onFileClick={handleFileClick}
            />
          ))
        ) : (
          <div className="empty-workspace">No files in workspace</div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;