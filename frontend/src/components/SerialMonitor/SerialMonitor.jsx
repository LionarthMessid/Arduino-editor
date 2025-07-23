import React, { useEffect, useRef } from 'react';
import useArduino from '../../hooks/useArduino';
import './SerialMonitor.css';

const SerialMonitor = () => {
  const { 
    serialOutput, 
    setSerialOutput, 
    serialInput, 
    setSerialInput, 
    connectSerial, 
    sendSerialData,
    serialWebSocket,
    selectedPort
  } = useArduino();
  
  const outputRef = useRef(null);
  
  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [serialOutput]);
  
  // Handle input key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendSerialData();
    }
  };
  
  // Clear output
  const handleClearOutput = () => {
    setSerialOutput('');
  };
  
  // Disconnect from serial port
  const handleDisconnect = () => {
    if (serialWebSocket) {
      serialWebSocket.close();
    }
  };
  
  return (
    <div className="serial-monitor">
      <div className="serial-monitor-header">
        <span>Serial Monitor</span>
        <div className="serial-monitor-actions">
          <button 
            className="serial-button"
            onClick={connectSerial}
            disabled={!selectedPort || serialWebSocket}
          >
            Connect
          </button>
          <button 
            className="serial-button"
            onClick={handleDisconnect}
            disabled={!serialWebSocket}
          >
            Disconnect
          </button>
          <button 
            className="serial-button"
            onClick={handleClearOutput}
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="serial-monitor-output" ref={outputRef}>
        {serialOutput.split('\n').map((line, index) => (
          <div key={index} className="serial-line">
            {line}
          </div>
        ))}
      </div>
      
      <div className="serial-monitor-input">
        <input
          type="text"
          value={serialInput}
          onChange={(e) => setSerialInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type message and press Enter"
          disabled={!serialWebSocket}
        />
        <button 
          className="send-button"
          onClick={sendSerialData}
          disabled={!serialWebSocket || !serialInput}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SerialMonitor;