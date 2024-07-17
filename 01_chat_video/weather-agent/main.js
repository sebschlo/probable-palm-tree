import OpenAI from "openai";
import * as dotenv from 'dotenv';
dotenv.config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const API_KEY = process.env.WEATHER_API_KEY;


async function getCurrentWeather(latitude, longitude) {

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`

  const response = await fetch(url);
  const data = await response.json();
  return data;
}
// getCurrentWeather(40.793362, -73.961151)

async function getCurrentLocation() {
  const response = await fetch("https://ipapi.co/json/");
  const data = await response.json();
  let current_location_data = data;
  console.log("Current location data:", current_location_data);
  return current_location_data;
}
// getCurrentLocation()

const tools = [
  {
    type: "function",
    function: {
      name: "getCurrentWeather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          latitude: {
            type: "string",
          },
          longitude: {
            type: "string",
          },
        },
        required: ["longitude", "latitude"],
      },
    }
  },
  {
    type: "function",
    function: {
      name: "getCurrentLocation",
      description: "Get the user's location based on their IP address",
      parameters: {
        type: "object",
        properties: {},
      },
    }
  },
];

const availableTools = {
  getCurrentLocation,
  getCurrentWeather,
};

const messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant. Only use the functions you have been provided with.",
  },
];

async function agent(userInput) {

  console.log('User input:', userInput)

  messages.push({
    role: "user",
    content: userInput,
  });

  for (let i = 0; i < 5; i++) {

    const completions = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      tools: tools,
    });
    console.log('openai response:', JSON.stringify(completions, null, 2));

    const { finish_reason, message } = completions.choices[0];

    if (finish_reason === "tool_calls" && message.tool_calls) {
      const functionName = message.tool_calls[0].function.name;
      const functionToCall = availableTools[functionName];
      const functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
      console.log("Function arguments:", functionArgs);

      // { latitude: '40.7809', longitude: '-73.9502' }

      const functionArgsArr = Object.values(functionArgs);

      console.log("Function arguments array:", functionArgsArr)

      // [ '40.7809', '-73.9502' ]

      const functionResponse = await functionToCall.apply(null, functionArgsArr);

      messages.push({
        role: "function",
        name: functionName,
        content: `This is the result: ${JSON.stringify(functionResponse)}`
      });

    } else if (finish_reason === "stop") {
      console.log("Message:", message)
      messages.push(message)
      return message.content;
    }
  }
  return `The maximum number of iterations has been met without a suitable answer. Please try again with a more specific input.`
}


const response = await agent(
  "Please suggest some activities based on my current location and the weather."
  // "Where am I located?"
);

console.log("Response:", response);