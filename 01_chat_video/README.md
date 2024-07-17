# Chat and Video

## Weather Agent

### Hiding API keys from GitHub

1. In the root of your `weather-agent` folder, create a new file called, config.js. In the config file, enter your API key in a JavaScript object:

```javascript
config.js

const config = {
  WEATHER_API_KEY: "<paste your api key in here>"
}
```

2. In the `index.html` file, add a script above your `main.js` file:

```html
<body>
  ...

  <script src="config.js"></script>  
  <script src="javascript/main.js"></script>
</body>
```

3. In the `main.js` file, replace the hard-coded API key with the following:

```javascript
 const API_KEY = config.WEATHER_API_KEY;
```

4. Finally, create a file called, .gitignore (you must include the period before the word)

5. Open the .gitignore file in VS Code and add the name of the config file.

```javascript
.gitignore

config.js
```

Adding the config file to the .gitignore will ensure that your API keys will not be pushed up to the cloud for everyone to steal. This may not be much of an issue with free APIs but once you start paying for API access, this practice becomes super important.

### Function Calling with Chat Completions API

1. Import the OpenAI SDK

```javascript
import OpenAI from "openai";
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

2. Create the `getLocation()` function. Use the [IP API]('https://ipapi.co/') to get the complete location of the device that is making the request.

```javascript
async function getCurrentLocation() {
    fetch("https://ipapi.co/json/")
        .then((response) => response.json())
        .then((data) => {
        // store the data in a variable of our choosing
        let current_location_data = data;
        // log the data to the browser console
        console.log(current_location_data);
        // The return statement allows the getCurrentLocation() function to produce output that can be used elsewhere in the program.
        return current_location_data
    });
}
```

Here, the response is returned in the JSON format:

```json
{
    "ip": "208.67.222.222",
    "city": "San Francisco",
    "region": "California",
    "region_code": "CA",
    "country": "US",
    "country_name": "United States",
    "continent_code": "NA",
    "in_eu": false,
    "postal": "94107",
    "latitude": 37.7697,
    "longitude": -122.3933,
    "timezone": "America/Los_Angeles",
    "utc_offset": "-0700",
    "country_calling_code": "+1",
    "currency": "USD",
    "languages": "en-US,es-US,haw,fr",
    "asn": "AS36692",
    "org": "OpenDNS, LLC"
}
```

3. Create the `getCurrentWeather()` function. Use the [OpenWeather API](https://openweathermap.org/current) to call current weather data. Use string templating to pass the latitude and longitude to the endpoint.

```javascript
async function getCurrentWeather(latitude, longitude) {

    const url = `https://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={API key}`

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // store the data in a variable of our choosing
            let current_weather_data = data;
            // log the data to the browser console
            console.log(current_weather_data);
            // The return statement allows the getCurrentWeather() function to produce output that can be used elsewhere in the program.
            return current_weather_data
    });
}
```

4. Create an array of objects called `tools`. In OpenAI, tools have the capability to invoke one or more functions as tools. Each tools will have two keys: `type` and `function`, the function key has three subkeys: `name`, `description`, and `parameters`.

```javascript
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
      description: "Get the current location based on IP address",
      parameters: {
        type: "object",
        properties: {},
      },
    }
  },
];
```

5. Define a `messages` array to keep track of all of the messages back and forth between the application and OpenAI. The first object in the array should always have the role property set to "system", which tells OpenAI that this is how we want it to behave.

```javascript
const messages = [
  {
    role: "system",
    content:
      "You are a helpful assistant. Only use the functions you have been provided with.",
  },
];
```

6. Create the agent function – this is the logic of our application. The agent function takes one argument: `userInput` which gets pushed into the messages array and set the role to "user", so that OpenAI knows that this is the input from the user.

```javascript
async function agent(userInput) {
  messages.push({
    role: "user",
    content: userInput,
  });
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
    tools: tools,
  });
  console.log(response);
}
```

Next, send a request to the Chat completions endpoint via the `chat.completions.create()` method in the Node SDK. The method takes an object with three properties:
  * model - define which OpenAI model you want to use
  * messages – history of messages between user and the AI
  * tools - list of tools the model can call.

Call the `agent()` function and pass in a simple input about your current location.

```javascript
agent("Where am I currently located?")
```

You should see the following response logged to the console:

```javascript
{
  id: 'chatcmpl-9lJkqOakfa19HMycojx9UL0EXbi1W',
  object: 'chat.completion',
  created: 1721064380,
  model: 'gpt-4-0613',
  choices: [
    {
      index: 0,
      message: { 
        role: 'assistant', 
        content: null, 
        tool_calls: [
            {
                id: 'call_AdqCZzuUIJkLwZGsz8wFDPk7',
                type: 'function',
                function: { name: 'getCurrentLocation', arguments: '{}' }
            }
        ]},
      logprobs: null,
      finish_reason: 'tool_calls'
    }
  ],
  usage: { prompt_tokens: 92, completion_tokens: 6, total_tokens: 98 },
  system_fingerprint: null
}
```

This response tells us that we should call one of our functions, as it contains the following key, finish_reason: "tool_calls". Every response will include a finish_reason. `finish_reason` has several possible values including: stop, function_call, and null. `function_call` means that the model decided to call a function. Here, the function name is `response.choices[0].message.tool_calls[0].function_name` and is set to `getCurrentLocation`.

7. Check if the `finish_reason` is equal to a tool_calls. First, use [object destructuring](https://javascript.info/destructuring-assignment#object-destructuring) to store the finish_reason and message. Then, store both functions in an object: 

```javascript

const availableTools = {
  getCurrentWeather,
  getCurrentLocation,
};

const { finish_reason, message } = response.choices[0];

console.log(message)

if (finish_reason === "tool_calls" && message.tool_calls) {
    // name of the function
    const functionName = message.tool_calls[0].function.name;
    // use the function name variable to access the name of the function to call 
    const functionToCall = availableTools[functionName];
    // grab any arguments OpenAI wants to pass into the function
    // Note: we won't need any arguments for this first function call
    const functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
    // 
    const functionArgsArr = Object.values(functionArgs);
    // 
    const functionResponse = await functionToCall.apply(null, functionArgsArr);
    console.log(functionResponse);
}
```

Now, when you run the `agent()` function again with the same input, the `functionResponse` returns an object with the users' current location:

```javascript
[
  {
    id: 'call_qARRUfNoG52zNyoGmlkegyUm',
    type: 'function',
    function: { name: 'getLocation', arguments: '{}' }
  }
]
{
  ip: '100.2.90.7',
  network: '100.2.90.0/24',
  version: 'IPv4',
  city: 'New York',
  region: 'New York',
  region_code: 'NY',
  country: 'US',
  country_name: 'United States',
  country_code: 'US',
  country_code_iso3: 'USA',
  country_capital: 'Washington',
  country_tld: '.us',
  continent_code: 'NA',
  in_eu: false,
  postal: '10128',
  latitude: 40.7809,
  longitude: -73.9502,
  timezone: 'America/New_York',
  utc_offset: '-0400',
  country_calling_code: '+1',
  currency: 'USD',
  currency_name: 'Dollar',
  languages: 'en-US,es-US,haw,fr',
  country_area: 9629091,
  country_population: 327167434,
  asn: 'AS701',
  org: 'UUNET'
}
```

8. Take this data, add it to a new item in the messages array and specify the name of the function called:

```javascript
messages.push({
  role: "function",
  name: functionName,
  content: `The result of the last function was this: ${JSON.stringify(
    functionResponse
  )}
  `,
});
```

Note, the role is now set to "function" which tells OpenAI that the content parameter contains the result of the function call and not the input from the user.

9. Send a new request to OpenAI with this updated `messages` array. For this, we will use a for loop to run the entire procedure and keep updating the messages array until we get `finish_reason: "stop"` and the GPT has found a suitable answer.

```javascript
for (let i = 0; i < 5; i++) {

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      tools: tools,
    });

    // more code

} else if (finish_reason === "stop"){
    messages.push(message);
    return message.content;
}
```

If the else case is not met within the five iterations, return a fail message outside the for loop.

```javascript
return "The maximum number of iterations has been met without a suitable answer. Try again with a more specific input.";
```

10. Running the app. Save the instantiated function to a variable called response and log the result to the terminal. 

```javascript
const response = await agent(
  "Please suggest some activities based on my location and the current weather."
);
console.log(response);
```

You should see the following result:

```bash
response: Based on your current location in New York and the weather (clear sky), here are some activities you might enjoy:

1. Have a picnic in Central Park
2. Take a walk across the Brooklyn Bridge
3. Visit the Statue of Liberty and Ellis Island
4. Explore the Metropolitan Museum of Art
5. Enjoy a bike ride along the Hudson River Greenway
6. Visit Times Square and the Broadway district
7. Take a ferry to Governors Island
8. Tour the historic Stonewall Inn and the surrounding area

Please remember to stay hydrated and apply sunblock. Enjoy your day!
```

## ChatBot

Resource: [simple_chat_ui](https://codepen.io/celestelayne/pen/VwVajdE)

1. Open a Terminal window and create a new project directory:

```bash
  mkdir simple-chatbot
  cd simple-chatbot
```

2. Change into the directory and set up the Node environment by running npm init, respectively:

```bash
$ cd simple-chatbot

$ npm init -y ** create package.json for the project
```

> Note: This command walks you through creating a package.json file which stores important information about the project.

The structure of the backend directory should now look like this:
```md
simple-chatbot
├── package.json
└── .git
```
Install the required dependencies:

```bash
$ npm install dotenv express openai
```
Define all the variables in a central location and load them into the file modules that need them.

```
$ touch .env
```

The structure of the project will now look like this:

```javascript
├── node_modules/
├── package.json
├── package.lock.json
├── server.js
└── .env
```

Create an Express application (express)

Now that Express is installed, create the `server.js` file and add the boilerplate code:

```bash
$ touch server.ts
```

Add boilerplate code found [here]():

```javascript
// grab the main Express module from package installed
const express = require('express')
// create the app variable and call the Express function
const app = express()
//  establish which port you’d like to use
const port = 3000

//  define route handler for GET requests to the server
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```

In the Terminal, run `node server.js`:

```
$ node server.js
``` 

You should see: Example app listening on 3000. When using Express, our server-side console logs show up in the Terminal window. Now visit http://localhost:3000/ in your browser window and you should see "Hello World!".

Install Nodemon
```bash
$ npm install --save-dev nodemon
``` 

Add a start script to the `package.json` that executes the `server.js` file using nodemon:
```javascript
"scripts": {
  "start": "nodemon server.js"
},
```
Now, in the Terminal, run `npm start` or `node server.js` to launch the Node application. Navigate to `http://localhost:8000`.

### Routing

Once the web server is listening, it can respond to requests. Routes are how a server side application responds to the client request of a particular HTTP endpoint. An HTTP endpoint is a URL in the web application, examples include:

```
https://localhost:8000/fruits
```

In JavaScript, a GET request is a way to retrieve data from a specified resource, like an API endpoint. It's one of the most common HTTP methods used for communication between the client (your browser) and a server. One of the most common ways to make a GET request is via the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

A POST request is a method of sending data to a server to create or update a resource. We can also use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) to make a POST request:

```javascript
    fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log(data))
```

Read: [Basic routing](https://expressjs.com/en/starter/basic-routing.html) with Express.

### Load frontend

#### Serving Static Files

In order to serve up static files such as images, stylesheets and client side javascript, Express provides a middleware function called, `express.static`. Static files are those that a client downloads from a server. 

A common practice in the development of a web application is to store all static files under the `public` directory in the root of a project. We can serve this folder to serve static files by adding this snippet of code to our `server.js` file:
```
app.use(express.static('public'));
```
Make a directory in your project called `public`. Then, create three new directories, public/scripts, public/styles and public/images subdirectories.

```bash
$ mkdir public
$ touch public/index.html public/main.js public/styles.css
```
Currently, we are just passing in a string of HTML to the `res.send()` method. Let’s send an HTML file. To store your files on the client-side, create a public directory.


Create an `index.html` file, place a div element that has a class called container. Connect the corresponding styles.css and main.js files:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Simple Chatbot</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container"></div>

  <script src="main.js"></script>
</body>
</html>
```

```
simple-chatbot
├── public/
    ├── app.js
    ├── styles.css
    └── images/
├── server.js
├── package.json
└── .env
```
Open the `app.js` file and add a console.log("Sanity Check: JS is working!") to the app.js so that it appears in your browser dev tools console. In the `styles.css` file add the following:

```css
body {
  background: yellow;
}
```
The webpage should now be yellow.

## Initialize openai module

Load the openai api key to the `.env` file: 

```javascript
// import modules from OpenAI library
const OpenAI = require("openai");
// instantiate an instance of openai
const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY
})

// establish which port you’d like to use
const port = process.env.PORT || 3000;

// create GET route to render HTML page
app.get('/ask', (req, res) => {
    res.sendFile(path.join(__dirname,'./public/index.html'));
})

// create POST route to send user input to the model
app.post('/ask', async (req, res) => {
    const { prompt } = req.body;
})
```
### Connecting the Frontend to the Backend

Create reference to the web document:

```javascript
const promptInput = document.querySelector(".prompt-input");
const resultText = document.querySelector(".result-container");
const generateBtn = document.getElementById("generateBtn");
```

Create a POST request to the `/chat` endpoint.

```javascript
const sendPromptToServer = async (event) => {
    let prompt = promptInput.value;

        try {
        const response = await fetch('http://localhost:3000/ask', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                // Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({ prompt })
        })
        // console.log(response.body)
        const data = await response.json()
        // console.log(data)
        renderToPage(data.data.content)
    } catch (error) {
        console.error("Error:", error);
    }
}
```

Render the response to the webpage using an event handler:

```javascript
const renderToPage = (text) => {
    console.log(text)
    let paragraph = document.createElement("p");
    paragraph.classList.add("card")
    paragraph.innerHTML = text
    resultText.appendChild(paragraph)
}
```

Create an event listener to set the whole program rolling on button click:

```javascript
// button click
generateBtn.addEventListener("click", sendPromptToServer);
```