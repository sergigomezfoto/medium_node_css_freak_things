const Jimp = require("jimp");
const fs = require("fs");

const initOptions = {
  resizeFactor: 0.50,
  origin: "top-left", //'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
};

const imageToShadow = async (options, image, className) => {
  try {
    const img = await Jimp.read(`./${image}`);
    img.scale(options.resizeFactor);

    let firstPixelColor;
    let combinedBoxShadowText = "";
    let boxShadowTextArray = [];
    let positionTextArray = [];

    const hSpace = 1;
    const vSpace = 1;
    const blurRadius = 0;
    const spreadRadius = 1;

    let startX, startY;

    switch (options.origin) {
      case "top-left":
        startX = 0;
        startY = 0;
        break;
      case "top-right":
        startX = img.bitmap.width;
        startY = 0;
        break;
      case "bottom-left":
        startX = 0;
        startY = img.bitmap.height;
        break;
      case "bottom-right":
        startX = img.bitmap.width;
        startY = img.bitmap.height;
        break;
      case "center":
      default:
        startX = Math.floor(img.bitmap.width / 2);
        startY = Math.floor(img.bitmap.height / 2);
        break;
    }

    for (let row = 0; row < img.bitmap.height; row++) {
      for (let column = 0; column < img.bitmap.width; column++) {
        try {
          const rgba = Jimp.intToRGBA(img.getPixelColor(column, row));
          let rgbaColor = `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a / 255})`;

          if (column === startX && row === startY) {
            firstPixelColor = rgbaColor;
          }

          let offsetX = (column - startX) * hSpace;
          let offsetY = (row - startY) * vSpace;

          let singlePositionText = `${offsetX}px ${offsetY}px`;
          positionTextArray.push(singlePositionText);

          let singleBoxShadowText = `${blurRadius}px ${spreadRadius}px ${rgbaColor}`;
          boxShadowTextArray.push(singleBoxShadowText);
        } catch (error) {
          console.error(`Error processing pixel at column ${column}, row ${row}:`, error);
        }
      }
    }

    for (let i = 0; i < positionTextArray.length; i++) {
      combinedBoxShadowText += ` ${positionTextArray[i]} ${boxShadowTextArray[i]},`;
    }

    let cssContent = `
    .${className} {
      background-color: ${firstPixelColor};
      box-shadow: ${combinedBoxShadowText.replace(/.$/, ";")}
    }
    `;

    return cssContent;
  } catch (error) {
    console.error("Error processing image:", error);
    return "";
  }
};

const processSingleImage = async (imageName, className, outputFileName) => {
  try {
    const cssContent = await imageToShadow(initOptions, imageName, className);
    fs.writeFileSync(`../visualizer/${outputFileName}`, cssContent);
    console.log(`CSS for image ${imageName} written successfully to ${outputFileName}`);
  } catch (error) {
    console.error("Error processing single image:", error);
  }
};

processSingleImage("sergi_gomez_rosada_800x533.jpg", "shadow-image", "shadow_image.css");