import axios from "axios";

const imageInstance = axios.create({
    baseURL: 'https://api.nft.storage/upload',
    headers: {
        'Authorization': 'Bearer ' + process.env.REACT_APP_IMG_KEY,
        'Content-Type': 'image/*',
        'Access-Control-Allow-Origin': '*'
    }
});

async function uploadImage(blob) {
    const response = await imageInstance.post("/", blob)
    return response.data.value.cid;
}

export { uploadImage }