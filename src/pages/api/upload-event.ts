/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextApiHandler, type NextApiRequest } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";

export const config = {
    api: {
        bodyParser: false,
    },
};

const readFile = async (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    console.log(req.body)
    const filepath = path.join(process.cwd() + "/public", "/images/upload/event");
    try {
        await fs.readdir(filepath);
    } catch (error) {
        await fs.mkdir(filepath, { recursive: true });
    }
  
    const options: formidable.Options = {};
    options.uploadDir = filepath;
    options.maxFileSize = 300 * 1024 * 1024;
    options.filename = (name, ext, path) => Date.now().toString() + "_" + path.originalFilename;

    const form = formidable(options);
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};


const handler: NextApiHandler = async (req, res) => {
    const image = await readFile(req);
    console.log(path.normalize(image.files.image?.[0]?.filepath ?? ''));
    if (image.files?.image?.length) {
        res.json({
            error: false,
            data: image.files.image.map((file) => file.filepath.replace(/\\/g, '/').split("public")[1]),
            message: 'Image uploaded successfully',
        });
    } else {
        res.status(400).json({
            error: true,
            message: 'No image files found',
        });
    }
};

export default handler;
