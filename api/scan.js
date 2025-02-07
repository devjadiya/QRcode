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
            .resize(1024) // Resize to improve detection
            .greyscale() // Convert to grayscale
            .normalise() // Enhance contrast
            .sharpen() // Improve edges
            .toFormat("png") // Convert to PNG
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
                    size: 1024, // Higher resolution for better recognition
                    singleChannel: false
                },
                decoder: {
                    readers: [
                        'ean_reader', // EAN-13, EAN-8
                        'upc_reader', // UPC-A
                        'upc_e_reader', // UPC-E
                        'code_128_reader', // Code 128
                        'code_39_reader', // Code 39
                        'code_93_reader', // Code 93
                        'i2of5_reader', // Interleaved 2 of 5
                        '2of5_reader' // Standard 2 of 5
                    ]
                }
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
