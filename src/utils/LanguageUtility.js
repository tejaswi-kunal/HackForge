const axios=require('axios');

const getLanguageId = (lang) => {
  const language = {
    cpp: 54,
    java: 62,
    javascript: 53,
    python: 71,
  };

  return language[lang];
};

const submitBatch = async (submissions) => {

    // will decide request type
    const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "true",
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions,
    },
    };

    //fetching request
    async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
    }

    // calling the function with await
    return await fetchData();

};

module.exports = {getLanguageId,submitBatch};
