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
    const { imageBase64 } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ error: 'No base64 image provided' });
    }

    try {
        // ✅ Convert Base64 to Buffer
        const imageBuffer = Buffer.from(imageBase64, 'base64');

        // ✅ Preprocess Image (Grayscale & Contrast Enhancement)
        const processedImage = await sharp(imageBuffer)
            .greyscale()
            .normalise()
            .toBuffer();

        // ✅ Convert Processed Image to Base64
        const processedBase64 = `data:image/png;base64,${processedImage.toString('base64')}`;

        // ✅ Quagga Barcode Scanner
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
                    'i2of5_reader'
                ]
            }
        }, function(result) {
            if (result && result.codeResult) {
                res.json({ barcode: result.codeResult.code });
            } else {
                res.json({ error: 'No barcode detected' });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Backend is running at http://localhost:${port}`);
});

module.exports = app; // Required for Vercel
