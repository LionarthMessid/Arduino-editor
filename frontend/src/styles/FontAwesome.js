// This file imports and configures FontAwesome icons for use in the application
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

// Add all solid and regular icons to the library
library.add(fas, far);

// Export the library for use in the application
export default library;