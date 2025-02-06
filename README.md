# Barcode Scanning API

## Overview
This project is a RESTful API built with **Express.js** that allows users to scan barcodes from **Base64 encoded images**. The API uses **Quagga2** for barcode detection and **Sharp** for image preprocessing to enhance barcode scanning accuracy.

## Features
- **Barcode Detection**: Supports a wide range of barcode formats (EAN, UPC, Code 128, Code 39, Code 93, and I2of5).
- **Base64 Image Input**: Accepts image data in Base64 format.
- **Image Preprocessing**: Resizes, converts to grayscale, and enhances contrast for improved barcode detection.
- **Error Handling**: Provides meaningful error messages for invalid or unsupported inputs.

## Technologies Used
- **Node.js** with **Express.js** for the backend API.
- **Quagga2** for barcode scanning.
- **Sharp** for image processing (grayscale, resizing, contrast enhancement).
- **CORS** for cross-origin requests.
- **Babel Polyfill** for backward compatibility.

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/your-username/barcode-scanning-api.git
cd barcode-scanning-api
```
### 2. Install dependencies:
```bash
npm install
```
### 3. Run the API locally:
```bash
npm start
```
The server will start at http://localhost:3000

## API Endpoint
POST /api/scan
Description:
Input: A Base64 encoded image of a barcode.
Output: The decoded barcode (if successful) or an error message.
Request Example:
```bash
curl -X POST http://localhost:3000/api/scan -H "Content-Type: application/json" -d '{
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/..."
}'
```
Response Example:
```json
{
    "barcode": "123456789012"
}
```
Error Responses:
No base64 image provided:
```json
{
    "error": "No base64 image provided"
}
```
Unsupported image format:
```json
{
    "error": "Unsupported image format. Use JPEG, PNG, or WebP"
}
```
No barcode detected:
```json

{
    "error": "No barcode detected. Try again with a clearer image"
}
```
Internal server error:

```json

{
    "error": "Internal server error"
}
```

## Deployment
Deploy on Vercel
Fork this repository on GitHub.
Go to Vercel, sign in, and click New Project.
Select your forked repository and click Deploy.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
