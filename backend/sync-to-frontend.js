const fs = require('fs').promises;
const path = require('path');

// Path to backend properties JSON file
const BACKEND_PROPERTIES = path.join(__dirname, 'data', 'properties.json');
// Path to frontend properties.js file
const FRONTEND_PROPERTIES = path.join(__dirname, '..', 'frontend', 'src', 'data', 'properties.js');

async function syncToFrontend() {
  try {
    console.log('🔄 Syncing properties from backend to frontend...');
    
    // Read backend properties.json
    const data = await fs.readFile(BACKEND_PROPERTIES, 'utf8');
    const properties = JSON.parse(data);
    
    // Generate the JavaScript file content
    const jsContent = `export const properties = ${JSON.stringify(properties, null, 2)};\n`;
    
    // Write to frontend properties.js
    await fs.writeFile(FRONTEND_PROPERTIES, jsContent, 'utf8');
    
    console.log(`✅ Successfully synced ${properties.length} properties to ${FRONTEND_PROPERTIES}`);
    return { success: true, count: properties.length };
  } catch (error) {
    console.error('❌ Error syncing to frontend:', error);
    throw error;
  }
}

// If run directly, execute sync
if (require.main === module) {
  syncToFrontend()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = syncToFrontend;

