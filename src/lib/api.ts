import ILovePDFApi from "@ilovepdf/ilovepdf-nodejs";
import fs from "fs";
import ILovePDFFile from "@ilovepdf/ilovepdf-nodejs/ILovePDFFile";

const SECRET_KEY = "secret_key_f7be8d9d84ca2387b04451a5c5cbd1e5_HDdd090a07c0757fe85f91e1f40228b68ea69";
const PUBLIC_KEY = "project_public_eadde78d09536a1291f6c99a465f95f6_U_pd13f17635efe8d276aec41389c89fc64d9";
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
