/* Découpe une capture pleine page en tranches lisibles (inspection visuelle). */
const sharp = require('sharp');
const path = require('node:path');
(async () => {
  const [file, width = 760, slice = 1500] = process.argv.slice(2);
  const meta = await sharp(file).metadata();
  const scale = Number(width) / meta.width;
  const resized = await sharp(file).resize({ width: Number(width) }).png().toBuffer();
  const h = Math.round(meta.height * scale);
  const outs = [];
  for (let y = 0, i = 0; y < h; y += Number(slice), i++) {
    const out = file.replace('.png', `.part${i}.png`);
    await sharp(resized).extract({ left: 0, top: y, width: Number(width), height: Math.min(Number(slice), h - y) }).toFile(out);
    outs.push(path.basename(out));
  }
  console.log(outs.join('\n'));
})();
