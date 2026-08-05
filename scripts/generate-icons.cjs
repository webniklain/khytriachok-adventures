const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const sourcePath = path.resolve(
  'public/icons/icon-source.png',
)

const outputDirectory = path.resolve(
  'public/icons',
)

const sizes = [
  72,
  96,
  128,
  144,
  152,
  180,
  192,
  384,
  512,
]

async function generateIcons() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      'Не знайдено public/icons/icon-source.png',
    )
  }

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  })

  for (const size of sizes) {
    await sharp(sourcePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'centre',
      })
      .png({
        compressionLevel: 9,
      })
      .toFile(
        path.join(
          outputDirectory,
          `icon-${size}.png`,
        ),
      )

    console.log(`Created icon-${size}.png`)
  }

  /*
   * Maskable-іконки:
   * герой займає приблизно 74% полотна,
   * а навколо залишається безпечне поле.
   */
  for (const size of [192, 512]) {
    const innerSize = Math.round(size * 0.74)
    const padding = Math.floor(
      (size - innerSize) / 2,
    )

    const resizedIcon = await sharp(sourcePath)
      .resize(innerSize, innerSize, {
        fit: 'cover',
        position: 'centre',
      })
      .png()
      .toBuffer()

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: {
          r: 126,
          g: 176,
          b: 67,
          alpha: 1,
        },
      },
    })
      .composite([
        {
          input: resizedIcon,
          left: padding,
          top: padding,
        },
      ])
      .png({
        compressionLevel: 9,
      })
      .toFile(
        path.join(
          outputDirectory,
          `icon-${size}-maskable.png`,
        ),
      )

    console.log(
      `Created icon-${size}-maskable.png`,
    )
  }

  /*
   * Apple Touch Icon.
   */
  await sharp(sourcePath)
    .resize(180, 180, {
      fit: 'cover',
      position: 'centre',
    })
    .flatten({
      background: '#7eb043',
    })
    .png({
      compressionLevel: 9,
    })
    .toFile(
      path.join(
        outputDirectory,
        'apple-touch-icon.png',
      ),
    )

  /*
   * Favicon PNG.
   */
  await sharp(sourcePath)
    .resize(48, 48, {
      fit: 'cover',
      position: 'centre',
    })
    .png({
      compressionLevel: 9,
    })
    .toFile(
      path.resolve('public/favicon.png'),
    )

  console.log('')
  console.log('Усі PWA-іконки створено')
}

generateIcons().catch((error) => {
  console.error(error)
  process.exit(1)
})
