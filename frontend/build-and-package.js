const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build and package process...');

try {
  // Build the project
  console.log('📦 Building the project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
  // Create deployment zip
  console.log('📁 Creating deployment package...');
  const distPath = path.join(__dirname, 'dist');
  
  if (fs.existsSync(distPath)) {
    console.log('📋 Contents of dist folder:');
    const files = fs.readdirSync(distPath, { withFileTypes: true });
    files.forEach(file => {
      if (file.isDirectory()) {
        console.log(`  📁 ${file.name}/`);
      } else {
        console.log(`  📄 ${file.name}`);
      }
    });
    
    console.log('✅ Deployment package ready!');
    console.log('🌐 Upload the contents of the "dist" folder to your web hosting.');
  } else {
    console.error('❌ Dist folder not found. Build may have failed.');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
