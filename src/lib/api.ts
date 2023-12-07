import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import fs from "fs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  secretKey: string;
  publicKey: string;
}

const preferences = getPreferenceValues<Preferences>();

const SECRET_KEY = preferences.secretKey;
const PUBLIC_KEY = preferences.publicKey;
const SavePath = "/Users/parikshith/Downloads/";
let filename = "";

const instance = new ILovePDFApi(PUBLIC_KEY, SECRET_KEY);

export type ProcessResponse = { status: string; filesize: number; output_filesize: number; download_filename: string };
let fileData = {} as ProcessResponse;

// Public and secret key can be found in your developer panel
// at https://developer.ilovepdf.com/user/projects .

export async function compressFile(filePath: string) {
  const task = instance.newTask("compress");

  // Promise-based way to use ILovePDFApi.
  await task
    .start()
    .then(() => {
      const file = new ILovePDFFile(filePath);
      return task.addFile(file);
    })
    .then(() => {
      return task.process();
    })
    .then((data) => {
      fileData = data as ProcessResponse;
      filename = (data as ProcessResponse).download_filename;
      return task.download();
    })
    .then((data) => {
      const filepath = SavePath + filename.split(".")[0] + "compressed.pdf";
      fs.writeFileSync(filepath, data);
      console.log("File saved at " + filepath);
    })
    .catch((err) => {
      console.log("err: ", err);
    });

  return fileData as ProcessResponse;
}
