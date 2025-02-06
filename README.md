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
