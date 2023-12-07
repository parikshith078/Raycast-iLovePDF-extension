import { Form, ActionPanel, Action, showToast, Detail, useNavigation } from "@raycast/api";
import fs from "fs";
import { ProcessResponse, compressFile } from "./lib/api";
import { useState } from "react";

export default function Command() {
  const { push } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <Form
        isLoading={isLoading}
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Submit Name"
              onSubmit={async (values: { files: string[] }) => {
                setIsLoading(true);
                const files = values.files.filter((file: any) => fs.existsSync(file) && fs.lstatSync(file).isFile());
                console.log(files);

                (async () => {
                  const fileData = await compressFile(files[0]);
                  console.log(fileData);
                  setIsLoading(false);
                  push(<ShowLoadingMessage data={fileData} />);
                })();
              }}
            />
          </ActionPanel>
        }
      >
        <Form.FilePicker id="files" allowMultipleSelection={false} />
      </Form>
    </>
  );
}

function ShowLoadingMessage({ data }: { data: ProcessResponse }) {
  const { pop } = useNavigation();
  const { reductionPercentage, newSizeInKB, error } = calculateFileSizeReduction(data);
  let markdown = "";
  if (error) {
    markdown = "Error: Task did not succeed.";
  } else {
    markdown = `#Compressed by ${reductionPercentage.toFixed(2)}% to ${newSizeInKB.toFixed(
      2,
    )}KB  ##Check Downlaod Folder for the file`;
  }

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Pop" onAction={pop} />
        </ActionPanel>
      }
    />
  );
}

function calculateFileSizeReduction(data: ProcessResponse): {
  reductionPercentage: number;
  newSizeInKB: number;
  error: boolean;
} {
  if (data.status !== "TaskSuccess") {
    console.log("Error: Task did not succeed.");
    return { reductionPercentage: 0, newSizeInKB: 0, error: true };
  }

  const oldFileSize = data.filesize;
  const newFileSize = data.output_filesize;
  const reductionPercentage = ((oldFileSize - newFileSize) / oldFileSize) * 100;
  const newSizeInKB = newFileSize / 1024;

  return { reductionPercentage, newSizeInKB, error: false };
}
