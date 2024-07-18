const promptInput = document.querySelector(".chat-input");
const resultText = document.querySelector(".result-container");
const generateBtn = document.getElementById("generateBtn");

const sendPromptToServer = async (event) => {
    event.preventDefault()
    console.log('submit clicked')
    let prompt = promptInput.value;

        try {
        const response = await fetch('http://localhost:3000/ask', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: prompt })
        })
        const data = await response.json()
        console.log(data)
        const messageContent = data?.choices?.[0]?.message?.content || "No content available";
        console.log(messageContent)
        renderToPage(messageContent)
    } catch (error) {
        console.error("Error:", error);
    }
}

const renderToPage = (text) => {
    console.log(text)
    let paragraph = document.createElement("p");
    paragraph.classList.add("card")
    paragraph.innerHTML = text
    resultText.appendChild(paragraph)
}

generateBtn.addEventListener("click", sendPromptToServer);