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
    // will decide request type
    if(!process.env.RAPID_API_KEY)
    {
      throw new Error("Rapid API Key Missing");
    }

    const options = {
    method: "POST",
    url: process.env.RAPID_URL,
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
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

// waiting function
const waiting = (timer)=>{
  return new Promise((resolve)=>{
    setTimeout(resolve,timer);
  });
}

// getting final result
const submitToken = async(resultToken)=>{
const options = {
  method: 'GET',
  url: process.env.RAPID_URL,
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': process.env.RAPID_API_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
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

while(true){
const result=await fetchData();

// checking if we recieved the final result
if(!result)
{
  throw new Error("Judge0 Fetch Failed");
}

const isResultObtained=result.submissions.every((value)=>value.status.id>2);

if(isResultObtained)
{
  // sending final result array
  return result.submissions;
}

// else we have to again run the above function till we get the final result
// waiting for certain seconds 
await waiting(300);

}
}

const validateLanguage=(language)=>{
    if(language!=='cpp' && language!='java' && language!='javascript' && language!='python')
    {
      throw new Error("Support For This Language Is Not Available!");
    }
}

module.exports = {getLanguageId,submitBatch,submitToken,validateLanguage};
