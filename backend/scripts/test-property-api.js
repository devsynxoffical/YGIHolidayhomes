require('dotenv').config();

const API_BASE_URL = process.env.BACKEND_URL || 'https://ygiholidayhomes-production.up.railway.app';

async function testPropertyAPI() {
  try {
    console.log('🧪 Testing Property API...\n');
    console.log(`API URL: ${API_BASE_URL}/api/properties\n`);
    
    const response = await fetch(`${API_BASE_URL}/api/properties`);
    const data = await response.json();
    
    if (data.success && data.properties) {
      const waterfrontProperty = data.properties.find(p => p.id === 2);
      
      if (waterfrontProperty) {
        console.log('✅ Found Waterfront property (ID: 2)');
        console.log(`Title: ${waterfrontProperty.title}`);
        console.log(`Images count: ${waterfrontProperty.images?.length || 0}\n`);
        
        if (waterfrontProperty.images && waterfrontProperty.images.length > 0) {
          console.log('📸 Image URLs:');
          waterfrontProperty.images.forEach((img, index) => {
            const url = typeof img === 'string' ? img : (img?.url || img);
            console.log(`  ${index + 1}. ${url}`);
          });
          
          // Test first image URL
          console.log('\n🔍 Testing first image URL...');
          const firstImageUrl = typeof waterfrontProperty.images[0] === 'string' 
            ? waterfrontProperty.images[0] 
            : (waterfrontProperty.images[0]?.url || waterfrontProperty.images[0]);
          
          // Remove query parameters for testing
          const cleanUrl = firstImageUrl.split('?')[0];
          console.log(`Testing: ${cleanUrl}`);
          
          const imageResponse = await fetch(cleanUrl);
          if (imageResponse.ok) {
            console.log(`✅ Image is accessible! Status: ${imageResponse.status}`);
            console.log(`   Content-Type: ${imageResponse.headers.get('content-type')}`);
          } else {
            console.log(`❌ Image not accessible! Status: ${imageResponse.status}`);
          }
        } else {
          console.log('❌ No images found for this property');
        }
      } else {
        console.log('❌ Waterfront property (ID: 2) not found in API response');
      }
    } else {
      console.log('❌ API response error:', data);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with native fetch support');
  console.log('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

testPropertyAPI();

