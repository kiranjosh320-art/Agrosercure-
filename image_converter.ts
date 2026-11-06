import sharp from 'sharp';
import path from 'path';

export interface ConvertedImageResult {
  imageBytes: Buffer;
  format: 'JPEG';
  width: number;
  height: number;
  size: [number, number]; // [width, height] matching PIL Image.size
  filename: string;
  originalBytes: number;
  convertedBytes: number;
  dataUrl: string;
}

/**
 * Extracts an embedded preview JPEG from RAW/DNG containers (TIFF structure)
 * DNG and camera RAW files almost universally contain an embedded full-size JPEG stream.
 */
function extractEmbeddedJpegFromRaw(fileBytes: Buffer): Buffer | null {
  const startMarker = Buffer.from([0xff, 0xd8, 0xff]);
  const endMarker = Buffer.from([0xff, 0xd9]);

  let largestJpeg: { start: number; end: number; length: number } | null = null;
  let cursor = 0;

  while (cursor < fileBytes.length - 4) {
    const startIdx = fileBytes.indexOf(startMarker, cursor);
    if (startIdx === -1) break;

    const endIdx = fileBytes.indexOf(endMarker, startIdx + 3);
    if (endIdx === -1) break;

    const len = endIdx + 2 - startIdx;
    if (len > 1000) { // must be at least 1KB to be an image
      if (!largestJpeg || len > largestJpeg.length) {
        largestJpeg = { start: startIdx, end: endIdx + 2, length: len };
      }
    }
    cursor = startIdx + 3;
  }

  if (largestJpeg) {
    return fileBytes.subarray(largestJpeg.start, largestJpeg.end);
  }
  return null;
}

/**
 * Converts image file bytes (including HEIC, HEIF, RAW, DNG, TIFF, PNG, WEBP, JPEG)
 * to a normalized RGB JPEG (quality: 95) with EXIF orientation transposition applied.
 * Equivalent to Python PIL ImageOps.exif_transpose + rawpy/pillow-heif postprocessing.
 */
export async function convert_image(fileBytes: Buffer, filename: string): Promise<ConvertedImageResult> {
  const ext = path.extname(filename).toLowerCase();
  let workingBuffer = fileBytes;

  // Handle DNG and RAW formats
  if (['.dng', '.raw', '.cr2', '.nef', '.arw'].includes(ext)) {
    // Try Sharp first (handles TIFF-based DNGs directly)
    try {
      const pipeline = sharp(fileBytes, { failOn: 'none' });
      const metadata = await pipeline.metadata();
      if (metadata.width && metadata.height) {
        const converted = await pipeline
          .rotate() // Transposes EXIF orientation like PIL ImageOps.exif_transpose
          .toColourspace('srgb')
          .jpeg({ quality: 95, mozjpeg: false })
          .toBuffer({ resolveWithObject: true });

        const width = converted.info.width;
        const height = converted.info.height;
        const dataUrl = `data:image/jpeg;base64,${converted.data.toString('base64')}`;

        return {
          imageBytes: converted.data,
          format: 'JPEG',
          width,
          height,
          size: [width, height],
          filename,
          originalBytes: fileBytes.length,
          convertedBytes: converted.data.length,
          dataUrl,
        };
      }
    } catch {
      // Fallback: extract embedded preview JPEG from RAW/DNG
      const embedded = extractEmbeddedJpegFromRaw(fileBytes);
      if (embedded) {
        workingBuffer = embedded;
      } else {
        throw new Error('Unsupported or invalid RAW/DNG image');
      }
    }
  }

  try {
    const pipeline = sharp(workingBuffer, { failOn: 'none' });
    const metadata = await pipeline.metadata();

    if (!metadata.format && !metadata.width) {
      throw new Error('Unrecognized image format');
    }

    // .rotate() with no arguments automatically orients the image using EXIF orientation tag
    const { data: outputBytes, info } = await pipeline
      .rotate()
      .toColourspace('srgb')
      .jpeg({
        quality: 95,
        chromaSubsampling: '4:4:4',
      })
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const dataUrl = `data:image/jpeg;base64,${outputBytes.toString('base64')}`;

    return {
      imageBytes: outputBytes,
      format: 'JPEG',
      width,
      height,
      size: [width, height],
      filename,
      originalBytes: fileBytes.length,
      convertedBytes: outputBytes.length,
      dataUrl,
    };
  } catch (error: any) {
    // Check if there is an embedded JPEG we can recover
    const fallbackEmbedded = extractEmbeddedJpegFromRaw(fileBytes);
    if (fallbackEmbedded && fallbackEmbedded.length > 2000) {
      try {
        const { data: fallbackOutput, info } = await sharp(fallbackEmbedded)
          .rotate()
          .toColourspace('srgb')
          .jpeg({ quality: 95 })
          .toBuffer({ resolveWithObject: true });

        return {
          imageBytes: fallbackOutput,
          format: 'JPEG',
          width: info.width,
          height: info.height,
          size: [info.width, info.height],
          filename,
          originalBytes: fileBytes.length,
          convertedBytes: fallbackOutput.length,
          dataUrl: `data:image/jpeg;base64,${fallbackOutput.toString('base64')}`,
        };
      } catch {
        // Fall through
      }
    }

    throw new Error('Unsupported or invalid image');
  }
}

export default convert_image;
