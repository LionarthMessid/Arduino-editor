import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ArduinoProvider } from './context/ArduinoContext';
import { AuthProvider } from './context/AuthContext';
import { Login, ProtectedRoute } from './components/Auth';
import EditorPage from './pages/Editor/EditorPage';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <ArduinoProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/editor" element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/editor" replace />} />
            </Routes>
          </div>
        </Router>
      </ArduinoProvider>
    </AuthProvider>
  );
}

export default App;