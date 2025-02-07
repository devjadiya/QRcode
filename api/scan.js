require('@babel/polyfill');
const express = require('express');
const cors = require('cors');
const Quagga = require('@ericblade/quagga2');
const sharp = require('sharp');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // ✅ Allow large base64 images

// ✅ Barcode Scanning Route (Base64 Input)
app.post('/api/scan', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'No base64 image provided' });
        }

        // ✅ Extract MIME type (Check for valid image format)
        const matches = imageBase64.match(/^data:image\/(jpeg|png|webp);base64,/);
        if (!matches) {
            return res.status(400).json({ error: 'Unsupported image format. Use JPEG, PNG, or WebP' });
        }

        // ✅ Remove Base64 Prefix & Convert to Buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        // ✅ Preprocess Image for Better Barcode Detection
        const processedImageBuffer = await sharp(imageBuffer)
            .resize({ width: 800 }) // Resize while maintaining aspect ratio
            .greyscale() // Convert to grayscale
            .normalise() // Enhance contrast
            .toFormat("png") // Convert to PNG for better Quagga compatibility
            .toBuffer();

        // ✅ Convert Processed Image to Base64 for Quagga
        const processedBase64 = `data:image/png;base64,${processedImageBuffer.toString('base64')}`;

        // ✅ Quagga Barcode Scanner with Improved Config
        Quagga.decodeSingle({
            src: processedBase64,
            numOfWorkers: 4,
            locate: true,
            inputStream: {
                size: 800, // Improve resolution
                singleChannel: false
            },
            decoder: {
                readers: [
                    'ean_reader',
                    'upc_reader',
                    'code_128_reader',
                    'code_39_reader',
                    'code_93_reader',
                    'i2of5_reader',
                    '2of5_reader',
                    'interleaved_reader'
                ],
                multiple: true // ✅ Allow multiple barcode types to be detected
            },
            locate: true, // ✅ Ensure barcode is located correctly
            patchSize: "medium", // ✅ Adjust patch size for better accuracy
            halfSample: false // ✅ Avoid downsizing image too much
        }, function(result) {
            if (result && result.codeResult) {
                return res.json({ barcode: result.codeResult.code, format: result.codeResult.format });
            } else {
                return res.status(404).json({ error: 'No barcode detected. Try again with a clearer image' });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Start Server
app.listen(port, () => {
    console.log(`🚀 Backend running at http://localhost:${port}`);
});

module.exports = app; // Required for Vercel Deployment
