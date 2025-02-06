require('@babel/polyfill');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Quagga = require('@ericblade/quagga2');
const sharp = require('sharp');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ✅ Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
        }
    }
});

// ✅ Barcode Scanning Route
app.post('/api/scan', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid format' });
    }

    try {
        // ✅ Preprocess Image: Convert to Grayscale & Enhance Contrast
        const processedImage = await sharp(req.file.buffer)
            .greyscale()
            .normalise()
            .toBuffer();

        // ✅ Convert to Base64 for Quagga
        const imageDataUri = `data:${req.file.mimetype};base64,${processedImage.toString('base64')}`;

        // ✅ Quagga Barcode Scanner
        Quagga.decodeSingle({
            src: imageDataUri,
            numOfWorkers: 4, // Use multiple workers for faster processing
            locate: true, // Helps detect barcodes more effectively
            inputStream: {
                size: 800, // Increase input size for better recognition
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
