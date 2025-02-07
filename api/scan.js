require('@babel/polyfill');
const express = require('express');
const cors = require('cors');
const Quagga = require('@ericblade/quagga2');
const sharp = require('sharp');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large base64 images

// Barcode Scanning Route (Base64 Input)
app.post('/api/scan', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'No base64 image provided' });
        }

        // Extract MIME type and validate format
        const matches = imageBase64.match(/^data:image\/(jpeg|png|webp);base64,/);
        if (!matches) {
            return res.status(400).json({ error: 'Unsupported image format. Use JPEG, PNG, or WebP' });
        }

        // Convert Base64 to Buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Preprocess Image for Better Barcode Detection
        const processedImageBuffer = await sharp(imageBuffer)
            .rotate()  // Automatically corrects image rotation
            .resize({ width: 1024 })  // Maintain aspect ratio
            .greyscale()              // Convert to grayscale
            .normalise()              // Enhance contrast
            .sharpen({ sigma: 1 })    // Sharpen edges without making the image noisy
            .threshold(100)           // Convert to high-contrast binary image
            .toFormat("png")
            .toBuffer();

        // Convert Processed Image to Base64 for Quagga
        const processedBase64 = `data:image/png;base64,${processedImageBuffer.toString('base64')}`;

        console.log("✅ Image processed successfully");

        // Run Barcode Detection in a Promise
        const barcode = await new Promise((resolve, reject) => {
            Quagga.decodeSingle({
                src: processedBase64,
                numOfWorkers: 0, // Required in Node.js
                locate: true,
                inputStream: {
                    size: 1280, // Higher resolution for better recognition
                    singleChannel: true // Process as grayscale
                },
                locator: {
                    patchSize: "large", // Larger patch size for better accuracy
                    halfSample: false
                },
                decoder: {
                    readers: ['code_128_reader'] // Focus only on Code 128
                },
                debug: true // Enable debugging logs
            }, (result) => {
                if (result && result.codeResult) {
                    console.log("✅ Barcode Detected:", result.codeResult.code);
                    resolve(result.codeResult.code);
                } else {
                    console.log("❌ No barcode detected.");
                    reject(new Error("No barcode detected. Try again with a clearer image."));
                }
            });
        });

        // Send Success Response
        return res.json({ barcode });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Backend running at http://localhost:${port}`);
});

module.exports = app; // Required for Vercel Deployment
