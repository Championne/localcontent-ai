/**
 * Generate Static Example Images
 * 
 * Run this script ONCE to generate 3 AI images for the demo page examples.
 * The images will be saved to public/examples/ and should be committed to git.
 * 
 * Usage:
 *   Windows:  set OPENAI_API_KEY=your-key && node scripts/generate-example-images.js
 *   Mac/Linux: OPENAI_API_KEY=your-key node scripts/generate-example-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('\n❌ Error: OPENAI_API_KEY not set\n');
  console.log('Run with:');
  console.log('  Windows:   set OPENAI_API_KEY=sk-... && node scripts/generate-example-images.js');
  console.log('  Mac/Linux: OPENAI_API_KEY=sk-... node scripts/generate-example-images.js\n');
  process.exit(1);
}

// Three examples matching the demo page
const examples = [
  {
    name: 'restaurant-farm-to-table',
    industry: 'Restaurant',
    prompt: 'Professional photograph of fresh organic vegetables and herbs arranged beautifully on a rustic wooden cutting board in a restaurant kitchen. Tomatoes, basil, peppers, and leafy greens. Warm natural lighting, shallow depth of field. No text, no words, no letters, no signs, no logos anywhere in the image.'
  },
  {
    name: 'fitness-gym',
    industry: 'Fitness',
    prompt: 'Professional photograph of a modern, clean gym interior with weight training equipment. Dumbbells on a rack, exercise machines in background. Bright motivating atmosphere with natural light from windows. No people. No text, no words, no letters, no signs, no logos anywhere in the image.'
  },
  {
    name: 'real-estate-home',
    industry: 'Real Estate',
    prompt: 'Professional real estate photograph of a beautiful modern home exterior. Two-story house with nice landscaping, green lawn, clear blue sky. Inviting curb appeal. Bright daylight. No text, no words, no letters, no signs, no address numbers, no logos anywhere in the image.'
  }
];

async function generateImage(prompt) {
  console.log('  Calling DALL-E 3...');
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  return data.data[0].url;
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log('  Downloading image...');
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('\n🎨 GeoSpark Example Image Generator\n');
  console.log('This will generate 3 AI images for the demo page.\n');
  
  const outputDir = path.join(__dirname, '..', 'public', 'examples');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created: ${outputDir}\n`);
  }

  let successCount = 0;
  
  for (const example of examples) {
    console.log(`\n🖼️  Generating: ${example.name} (${example.industry})`);
    
    try {
      const imageUrl = await generateImage(example.prompt);
      
      const filepath = path.join(outputDir, `${example.name}.png`);
      await downloadImage(imageUrl, filepath);
      
      console.log(`  ✅ Saved: public/examples/${example.name}.png`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✨ Done! Generated ${successCount}/3 images.\n`);
  
  if (successCount > 0) {
    console.log('Next steps:');
    console.log('  1. Check the images in public/examples/');
    console.log('  2. Run: git add public/examples/');
    console.log('  3. Run: git commit -m "Add static example images"');
    console.log('  4. Run: git push\n');
  }
}

main().catch(console.error);
