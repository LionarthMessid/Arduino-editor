import { useContext } from 'react';
import { ArduinoContext } from '../context/ArduinoContext';

/**
 * Custom hook to access the Arduino context
 * @returns {Object} The Arduino context
 */
const useArduino = () => {
  const context = useContext(ArduinoContext);
  
  if (!context) {
    throw new Error('useArduino must be used within an ArduinoProvider');
  }
  
  return context;
};

export default useArduino;