import axios from "axios";

import env from "../config.ts";

export const getLanguageId = (language: string): Number | null => {
  const languageMap: Record<string, number> = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };

  return languageMap[language.toUpperCase()] || null;
};

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${env.JUDGE0_URL}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    },
  );

 

  return data;
};

export const poolBatchResults = async (tokens: string[]) => {
  while (true) {
    const { data } = await axios.get(`${env.JUDGE0_URL}/submissions/batch`, {
      params: {
        tokens: tokens.join(","),
        base64_encoded: false,
      },
    });
    const results = data.submissions;

    const isAllDone = results.every((r) => {
      return r.status.id !== 1 && r.status.id !== 2;
    });

    if (isAllDone) return results;

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};
