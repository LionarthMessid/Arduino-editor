import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Boards API
export const boardsApi = {
  getBoards: async () => {
    try {
      const response = await axios.get(`${API}/boards`);
      return response.data;
    } catch (error) {
      console.error('Error loading boards:', error);
      throw error;
    }
  },
  
  getAvailableBoards: async () => {
    try {
      const response = await axios.get(`${API}/boards/available`);
      return response.data;
    } catch (error) {
      console.error('Error loading available boards:', error);
      throw error;
    }
  }
};

// Ports API
export const portsApi = {
  getPorts: async () => {
    try {
      const response = await axios.get(`${API}/ports`);
      return response.data;
    } catch (error) {
      console.error('Error loading ports:', error);
      throw error;
    }
  }
};

// Libraries API
export const librariesApi = {
  getLibraries: async () => {
    try {
      const response = await axios.get(`${API}/libraries`);
      return response.data;
    } catch (error) {
      console.error('Error loading libraries:', error);
      throw error;
    }
  },
  
  searchLibraries: async (query = '') => {
    try {
      const response = await axios.post(`${API}/libraries/search`, { query });
      return response.data;
    } catch (error) {
      console.error('Error searching libraries:', error);
      throw error;
    }
  },
  
  installLibrary: async (libraryName) => {
    try {
      const response = await axios.post(`${API}/libraries/install`, { library_name: libraryName });
      return response.data;
    } catch (error) {
      console.error('Error installing library:', error);
      throw error;
    }
  },
  
  uninstallLibrary: async (libraryName) => {
    try {
      const response = await axios.post(`${API}/libraries/uninstall`, { library_name: libraryName });
      return response.data;
    } catch (error) {
      console.error('Error uninstalling library:', error);
      throw error;
    }
  }
};

// Cores API
export const coresApi = {
  getCores: async () => {
    try {
      const response = await axios.get(`${API}/cores`);
      return response.data;
    } catch (error) {
      console.error('Error loading cores:', error);
      throw error;
    }
  },
  
  searchCores: async () => {
    try {
      const response = await axios.get(`${API}/cores/search`);
      return response.data;
    } catch (error) {
      console.error('Error loading available platforms:', error);
      throw error;
    }
  },
  
  installCore: async (coreName) => {
    try {
      const response = await axios.post(`${API}/cores/install`, { core_name: coreName });
      return response.data;
    } catch (error) {
      console.error('Error installing core:', error);
      throw error;
    }
  },
  
  uninstallCore: async (coreName) => {
    try {
      const response = await axios.post(`${API}/cores/uninstall`, { core_name: coreName });
      return response.data;
    } catch (error) {
      console.error('Error uninstalling core:', error);
      throw error;
    }
  }
};

// Code API
export const codeApi = {
  compileCode: async (code, board, sketchPath) => {
    try {
      const response = await axios.post(`${API}/compile`, {
        code,
        board,
        sketch_path: sketchPath
      });
      return response.data;
    } catch (error) {
      console.error('Error compiling code:', error);
      throw error;
    }
  },
  
  uploadCode: async (code, board, port, sketchPath) => {
    try {
      const response = await axios.post(`${API}/upload`, {
        code,
        board,
        port,
        sketch_path: sketchPath
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading code:', error);
      throw error;
    }
  }
};

// Files API
export const filesApi = {
  getFile: async (filePath) => {
    try {
      const response = await axios.get(`${API}/files/${filePath}`);
      return response.data;
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  },
  
  saveFile: async (path, content) => {
    try {
      const response = await axios.post(`${API}/files`, { path, content });
      return response.data;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },
  
  getWorkspace: async () => {
    try {
      const response = await axios.get(`${API}/workspace`);
      return response.data;
    } catch (error) {
      console.error('Error loading workspace:', error);
      throw error;
    }
  }
};

// Serial API
export const serialApi = {
  connectWebSocket: (port) => {
    const wsUrl = `${BACKEND_URL.replace('http', 'ws')}/api/serial/${port}`;
    return new WebSocket(wsUrl);
  }
};

// Export all APIs as a single object
const api = {
  boards: boardsApi,
  ports: portsApi,
  libraries: librariesApi,
  cores: coresApi,
  code: codeApi,
  files: filesApi,
  serial: serialApi
};

export default api;