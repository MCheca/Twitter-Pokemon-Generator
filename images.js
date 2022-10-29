import Replicate from 'replicate-js';
import sharp from 'sharp';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const replicate = new Replicate({
  token: process.env.REPLICATE_TOKEN,
});

const generateImage = async (prompt) => {
  const model = await replicate.models.get('lambdal/text-to-pokemon');

  const modelPrediction = await model.predict({
    prompt,
    num_inference_steps: 35,
    guidance_scale: 7.8,
  });

  if (modelPrediction) {
    const parsedImage = await addTextOnImage(
      modelPrediction[0],
      process.env.ACCOUNT_USERNAME
    );

    return { parsedImage, originalImage: modelPrediction[0] };
  }
};

const addTextOnImage = async (imageUrl, text) => {
  try {
    const width = 512;
    const height = 512;

    const input = (await axios({ url: imageUrl, responseType: 'arraybuffer' }))
      .data;

    const svgImage = `<svg width="${width}" height="${height}">
        <style>
        .title {
          width: 100%;
          margin: 0 auto;
          fill: #fff;
          font-size: 15vw;
          font-family: sans-serif;
        }

        text {
          font-family: sans-serif;
          font-weight: 900;
          color: #fff;
        }
        </style>

        <line x1="445" y1="512" x2="512" y2="512" style="stroke:black; stroke-width: 100;" stroke-linecap="round"/>
        <text x="462" y="96%" text-anchor="middle" class="title">${text}</text>
      </svg>`;

    const svgBuffer = Buffer.from(svgImage);

    const image = (
      await sharp(input)
        .composite([
          {
            input: svgBuffer,
            top: 0,
            left: 0,
          },
        ])
        .toBuffer()
    ).toString('base64');

    return image;
  } catch (error) {
    console.log('Error generating the parsed image\n', error);
  }
};

export { generateImage };
