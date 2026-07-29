const fs = require('fs');
const path = require('path');

const tsFilePath = path.join(__dirname, 'types/darshan.ts');
let content = fs.readFileSync(tsFilePath, 'utf-8');

const imageDir = path.join(__dirname, 'public/51_Soti_Pith_Image');
const images = fs.readdirSync(imageDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

// Custom mapping for edge cases where simple string match fails
const customMap = {
  "khamakya": "Kamakhya.jpg",
  "mangla-gauri": "Magadha.jpg", // Mangla Gauri is often associated with Magadha
  "mangal-chandika": "Mangal Chandi.jpg",
  "narmada": "Narmada_Shondesh.jpg",
  "panch-sagar": "Panch Sagar Shaktipeeth.jpg",
  "sarvashail": "Sarvashail_Rakini.jpg",
  "sravani": "Sravani_Kanyashram.jpg",
  "naina-devi": "Narayani.jpg", // sometimes known as Narayani
  "jogulamba-devi": "Sri Parvat Sakthi Peeth.jpg", // Jogulamba is at Sri Parvat
  "dakshayani": "Shakti Dakshayani.jpg",
  "chamundeshwari": "Ratnavali Sakthipeeth.jpg" // wait, there might be slight mismatches.
};

// We will find all objects in MOCK_TEMPLES and replace their deity_image_url
// Let's use regex to find each object and update it
const templeRegex = /id:\s*"([^"]+)"[\s\S]*?deity_image_url:\s*"([^"]+)"/g;

content = content.replace(templeRegex, (match, id, oldUrl) => {
  let mappedImage = null;

  // 1. Check custom map
  if (customMap[id]) {
    mappedImage = customMap[id];
  } else {
    // 2. Try to match id (e.g. amarnath) to image (Amarnath.jpg)
    let bestMatch = null;
    for (const img of images) {
      const imgBase = img.replace('.jpg', '').replace('.png', '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const idBase = id.replace(/[^a-z0-9]/g, '');
      
      if (imgBase === idBase || imgBase.includes(idBase) || idBase.includes(imgBase)) {
        bestMatch = img;
        break;
      }
    }
    
    // 3. Try matching by name if ID didn't work well
    if (!bestMatch) {
       // just a fallback if needed
    }
    
    if (bestMatch) mappedImage = bestMatch;
  }

  if (mappedImage) {
    const newUrl = `/51_Soti_Pith_Image/${mappedImage}`;
    // Replace the old URL with the new URL within this match
    return match.replace(oldUrl, newUrl);
  } else {
    console.warn(`No image found for ${id}`);
    return match;
  }
});

fs.writeFileSync(tsFilePath, content);
console.log("Done updating types/darshan.ts");
