import { uploadImage } from "../services/ipfs_service";
import { createCanvas, loadImage } from "canvas";

const cards = {
  bronze: {
    cid: "",
    baseImageName: "Bronze.png",
  },
  silver: {
    cid: "",
    baseImageName: "Silver.png",
  },
  gold: {
    cid: "",
    baseImageName: "Gold.png",
  },
  platinum: {
    cid: "",
    baseImageName: "Platinum.png",
  },
};

const basePath = "/images/cards/";

const createAndUploadImages = async (address) => {
  for (const cardType in cards) {
    const canvas = createCanvas(900, 558);
    const ctx = canvas.getContext("2d");
    // Load Image
    await loadImage(`${basePath}${cards[cardType].baseImageName}`).then(
      async (image) => {
        ctx.drawImage(image, 0, 0, 900, 558);
        ctx.globalAlpha = 0.55;
        ctx.font = "32px Outfit";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(address, canvas.width / 2, 492);
        // Construct image
        const blob = await new Promise((resolve) =>
          canvas.toBlob((blob) => resolve(blob), "image/png")
        );
        let imageCID = await uploadImage(blob);
        cards[cardType].cid = imageCID;
        console.log(cardType, imageCID);
      }
    );
  }

  return {
    bronze: cards.bronze.cid,
    silver: cards.silver.cid,
    gold: cards.gold.cid,
    platinum: cards.platinum.cid,
  };
};

export { createAndUploadImages };
