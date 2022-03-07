export const save = (
  data: Record<string, any> & {
    timestamp: Date;
    batchId: `${
      | "mon"
      | "tue"
      | "wed"
      | "thu"
      | "fri"
      | "sat"
      | "sun"}_${number}`;
    runId: number;
  }
) => {
  const response = fetch("/collector", {
    method: "post",
    body: JSON.stringify(data),
  });

  response.then((result) => {
    console.log("Data collected", result);
  });
};
