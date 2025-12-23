const fs = require('fs').promises;
const path = require('path');

// Path to frontend properties file
const FRONTEND_PROPERTIES = path.join(__dirname, '..', 'frontend', 'src', 'data', 'properties.js');
// Path to backend properties JSON file
const BACKEND_PROPERTIES = path.join(__dirname, 'data', 'properties.json');

async function syncProperties() {
  try {
    console.log('🔄 Syncing properties from frontend to backend...');
    
    // Read frontend properties.js file
    const frontendContent = await fs.readFile(FRONTEND_PROPERTIES, 'utf8');
    
    // Extract the properties array using regex
    const match = frontendContent.match(/export const properties = (\[[\s\S]*\]);/);
    
    if (!match) {
      throw new Error('Could not find properties array in frontend file');
    }
    
    // Evaluate the array (safe in this context as it's our own file)
    const properties = eval(match[1]);
    
    // Ensure data directory exists
    const dataDir = path.dirname(BACKEND_PROPERTIES);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write to JSON file
    await fs.writeFile(BACKEND_PROPERTIES, JSON.stringify(properties, null, 2));
    
    console.log(`✅ Successfully synced ${properties.length} properties to ${BACKEND_PROPERTIES}`);
  } catch (error) {
    console.error('❌ Error syncing properties:', error);
    process.exit(1);
  }
}

syncProperties();

