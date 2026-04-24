/**
 * Génère les PNG (72…512) depuis public/icons/icon-source.svg
 * Usage : node scripts/generate-icons.js
 */
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const sourceSvg = path.join(__dirname, "../public/icons/icon-source.svg")
const outputDir = path.join(__dirname, "../public/icons")

async function main() {
  if (!fs.existsSync(sourceSvg)) {
    console.error("Fichier manquant :", sourceSvg)
    process.exit(1)
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  const svgBuffer = fs.readFileSync(sourceSvg)
  for (const size of sizes) {
    const out = path.join(outputDir, `icon-${size}x${size}.png`)
    await sharp(svgBuffer).resize(size, size).png().toFile(out)
    console.log(`✓ icon-${size}x${size}.png`)
  }
  const sourcePng = path.join(outputDir, "icon-source.png")
  await sharp(svgBuffer).resize(512, 512).png().toFile(sourcePng)
  console.log("✓ icon-source.png (512×512)")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
