const vision = require('@google-cloud/vision');
const { Buffer } = require('buffer');

// Check if GOOGLE_CREDENTIALS_JSON is defined
if (!process.env.GOOGLE_CREDENTIALS_JSON) {
    throw new Error('GOOGLE_CREDENTIALS_JSON environment variable is not set.');
}

// Decode the base64-encoded JSON credentials
const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_JSON, 'base64').toString('utf8');
const credentials = JSON.parse(credentialsJson);

// Create a Google Cloud client with the credentials
const client = new vision.ImageAnnotatorClient({ credentials });

async function detectText(imageData) {
    try {
        // Performs text detection on the image data
        const [result] = await client.textDetection({ image: { content: imageData } });
        const detections = result.textAnnotations;
        console.log('Text:');
        detections.forEach(text => console.log(text.description));
        return detections.map(text => text.description);
    } catch (err) {
        console.error('ERROR:', err);
    }
}

async function detectLogos(imageData) {
    try {
        const [result] = await client.logoDetection({ image: { content: imageData } });
        const logos = result.logoAnnotations;
        console.log('Logos:');
        logos.forEach(logo => console.log(logo.description, logo.score));
        return logos;
    } catch (err) {
        console.error('ERROR:', err);
    }
}

async function detectLabels(imageData) {
    try {
        const [result] = await client.labelDetection({ image: { content: imageData } });
        const labels = result.labelAnnotations;
        console.log('Labels:');
        labels.forEach(label => console.log(label.description));
        return labels;
    } catch (err) {
        console.error('ERROR:', err);
    }
}

async function detectWeb(imageData) {
    try {
        const [result] = await client.webDetection({ image: { content: imageData } });
        const webDetection = result.webDetection;
        console.log('Web Detection:');
        console.log('Best guess labels:', webDetection.bestGuessLabels);
        console.log('Full matching images:', webDetection.fullMatchingImages);
        console.log('Partial matching images:', webDetection.partialMatchingImages);
        console.log('Pages with matching images:', webDetection.pagesWithMatchingImages);
        console.log('Visually similar images:', webDetection.visuallySimilarImages);
        return webDetection;
    } catch (err) {
        console.error('ERROR:', err);
    }
}

module.exports = {
    detectText,
    detectWeb,
    detectLabels,
    detectLogos
};