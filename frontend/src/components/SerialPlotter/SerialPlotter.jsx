import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useArduino from '../../hooks/useArduino';
import './SerialPlotter.css';

const SerialPlotter = () => {
  const { 
    plotData, 
    connectSerial, 
    serialWebSocket,
    selectedPort
  } = useArduino();
  
  // Disconnect from serial port
  const handleDisconnect = () => {
    if (serialWebSocket) {
      serialWebSocket.close();
    }
  };
  
  // Calculate min and max values for Y axis
  const yMin = Math.min(...plotData.map(d => d.value), 0);
  const yMax = Math.max(...plotData.map(d => d.value), 10);
  const yRange = yMax - yMin;
  const yDomain = [yMin - yRange * 0.1, yMax + yRange * 0.1];
  
  return (
    <div className="serial-plotter">
      <div className="serial-plotter-header">
        <span>Serial Plotter</span>
        <div className="serial-plotter-actions">
          <button 
            className="plotter-button"
            onClick={connectSerial}
            disabled={!selectedPort || serialWebSocket}
          >
            Connect
          </button>
          <button 
            className="plotter-button"
            onClick={handleDisconnect}
            disabled={!serialWebSocket}
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <div className="serial-plotter-content">
        {plotData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={plotData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="time" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={() => ''}
                stroke="#888"
              />
              <YAxis 
                domain={yDomain}
                stroke="#888"
              />
              <Tooltip 
                formatter={(value) => [value, 'Value']}
                labelFormatter={() => ''}
                contentStyle={{ backgroundColor: '#333', border: '1px solid #444' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00e5ff" 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">
            <p>No data to display</p>
            <p>Connect to a serial port to start plotting data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SerialPlotter;