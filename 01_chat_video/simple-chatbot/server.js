const OpenAI = require("openai");
const dotenv = require('dotenv');
dotenv.config();


// grab the main Express module from package installed
const express = require('express')
// create the app variable and call the Express function
const app = express()
//  establish which port you’d like to use
const port = process.env.PORT || 3000

// instantiate an instance of openai
const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY
})


// create POST route to send the body of the response to openai as a message
app.use(express.json());

app.post('/ask', async (req, res) => {
  console.log('Request body:', req.body); // Log the entire request body
  const { prompt } = req.body;
  try {
    if (!prompt) {
      throw new Error("Prompt is undefined");
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    res.json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

// serve the static files in the public directory
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
