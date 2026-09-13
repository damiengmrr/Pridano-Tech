const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const target = path.join(__dirname, '../public/assets/images/pridano');
// Crop only: original interface, text and values are preserved in the PNGs.
const crops = {
  dashboard: {left:244, top:72, width:1196, height:820},
  factures: {left:244, top:190, width:1196, height:650},
  planning: {left:244, top:240, width:1196, height:1050},
  login: {left:0, top:480, width:1435, height:930}
};
async function main() {
  fs.mkdirSync(target, {recursive:true});
  for (const [name, crop] of Object.entries(crops)) {
    const original = path.join(target, `${name}.png`);
    for (const width of [640, 1200]) {
      await sharp(original).extract(crop).resize({width,withoutEnlargement:true}).webp({quality:88,effort:6}).toFile(path.join(target, `${name}-${width}.webp`));
    }
  }
  const mobileCrops = {
    dashboard:{left:283,top:388,width:648,height:460},
    factures:{left:805,top:312,width:590,height:190},
    planning:{left:600,top:975,width:330,height:255}
  };
  for(const [name,crop] of Object.entries(mobileCrops)) {
    await sharp(path.join(target, `${name}.png`)).extract(crop).webp({quality:92,effort:6}).toFile(path.join(target, `${name}-mobile.webp`));
  }
  console.log('Responsive WebP crops generated; original PNGs preserved.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
