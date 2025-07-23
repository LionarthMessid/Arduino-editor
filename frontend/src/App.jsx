import React from 'react';
import { ArduinoProvider } from './context/ArduinoContext';
import EditorPage from './pages/Editor/EditorPage';
import './styles/App.css';

function App() {
  return (
    <ArduinoProvider>
      <div className="app-container">
        <EditorPage />
      </div>
    </ArduinoProvider>
  );
}

export default App;