import sharp from "sharp";
import Debug from "debug";

const debug = Debug("myapp");

// Thermal printer specs: adjust for your model
const THERMAL_WIDTH_PX = 384; // 58mm printer @ 203 DPI
const THERMAL_HEIGHT_MAX = 1024; // max height to avoid overflow

// Function to optimize image for thermal printing
export function optimizeImage(buffer: Buffer) {
  const optimizedBuffer = sharp(buffer)
    .resize({
      width: THERMAL_WIDTH_PX,
      height: THERMAL_HEIGHT_MAX,
      fit: "inside",
    })
    .threshold(128) // convert to black and white
    .toFormat("png") // ensure format is compatible
    .toBuffer();

  return optimizedBuffer;
}

export function createPrintJob(file?: Express.Multer.File) {
  return async () => {
    if (!file) {
      throw new Error("No file provided for print job.");
    }
    debug(
      `Processing print job for file: ${file.originalname}, size: ${file.size} bytes`
    );

    const optimizedImage = await optimizeImage(file.buffer);

    // Save to file for debugging purposes
    await sharp(optimizedImage).toFile(`temp/printed_${Date.now()}_.png`);

    // Simulate print job processing
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate delay

    debug(`Print job completed for file: ${file.originalname}`);
  };
}
