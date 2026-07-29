const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'public/51_Soti_Pith_Image');
const tsFilePath = path.join(__dirname, 'types/darshan.ts');

const images = fs.readdirSync(imageDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
let tsContent = fs.readFileSync(tsFilePath, 'utf-8');

images.forEach(img => {
  if (img.includes(' ')) {
    const newName = img.replace(/ /g, '_');
    
    // Rename file
    fs.renameSync(path.join(imageDir, img), path.join(imageDir, newName));
    
    // Update TS file
    // Replace exactly the old filename in the TS file
    tsContent = tsContent.replace(new RegExp(img, 'g'), newName);
  }
});

fs.writeFileSync(tsFilePath, tsContent);
console.log("Renamed files and updated types/darshan.ts");
