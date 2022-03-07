import type { RequestHandler } from "@sveltejs/kit";
import type { ServerRequest } from "@sveltejs/kit/types/hooks";
import fs from "fs-extra";
import { join } from "path";

const dataStoragePath = join(__dirname, "storage", "data");

export const post: RequestHandler = async ({ body }: ServerRequest) => {
  const data = JSON.parse(body.toString());
  try {
    fs.appendFileSync(
      join(dataStoragePath, data.batchId, data.runId + ".data"),
      data
    );
    return {
      status: 200,
    };
  } catch (err) {
    console.error("collector error", err);
    return {
      status: 501,
    };
  }
};
