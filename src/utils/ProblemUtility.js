const axios=require('axios');

const getLanguageId = (lang) => {
  const language = {
    cpp: 54,
    java: 62,
    javascript: 63,
    python: 71,
  };

  return language[lang];
};

// getting token
const submitBatch = async (submissions) => {
  if(!process.env.RAPID_API_KEY) {
      throw new Error("Rapid API Key Missing");
  }

  const encodedSubmissions = submissions.map((sub) => ({
      ...sub,
      source_code: Buffer.from(sub.source_code).toString('base64'),
      stdin: Buffer.from(sub.stdin || '').toString('base64'),
      expected_output: Buffer.from(sub.expected_output || '').toString('base64')
  }));

  const options = {
      method: "POST",
      url: process.env.RAPID_URL,
      params: {
          base64_encoded: "true",  
      },
      headers: {
          "x-rapidapi-key": process.env.RAPID_API_KEY,
          "x-rapidapi-host": process.env.RAPID_API_HOST,
          "Content-Type": "application/json",
      },
      data: {
          submissions: encodedSubmissions, 
      },
  };

  async function fetchData() {
      try {
          const response = await axios.request(options);
          return response.data;
      } catch (error) {
          console.error(error);
      }
  }

    return await fetchData();
};

// waiting function
const waiting = (timer)=>{
  return new Promise((resolve)=>{
    setTimeout(resolve,timer);
  });
}

// getting final result
const submitToken = async (resultToken) => {
    const options = {
        method: 'GET',
        url: process.env.RAPID_URL,
        params: {
            tokens: resultToken.join(","),
            base64_encoded: 'true',  
            fields: '*'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': process.env.RAPID_API_HOST
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    while(true) {
        const result = await fetchData();

        if(!result) {
            throw new Error("Judge0 Fetch Failed");
        }

        const isResultObtained = result.submissions.every((value) => value.status.id > 2);

        if(isResultObtained) {
            // ✅ decode base64 fields before returning
            const decoded = result.submissions.map((sub) => ({
                ...sub,
                stdout: sub.stdout ? Buffer.from(sub.stdout, 'base64').toString('utf-8') : null,
                stderr: sub.stderr ? Buffer.from(sub.stderr, 'base64').toString('utf-8') : null,
                compile_output: sub.compile_output ? Buffer.from(sub.compile_output, 'base64').toString('utf-8') : null,
            }));
            return decoded;
        }

        await waiting(300);
    }
};

const validateLanguage=(language)=>{
    if(language!=='cpp' && language!='java' && language!='javascript' && language!='python')
    {
      throw new Error("Support For This Language Is Not Available!");
    }
}

module.exports = {getLanguageId,submitBatch,submitToken,validateLanguage};
