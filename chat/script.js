const API_BASE_URL = "http://localhost:5502";

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

async function sendMessage() {
  const message = input.value.trim();

  if (!message) {
    return;
  }

  addMessage(`You: ${message}`, "user");
  input.value = "";

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Unable to get AI response.");
    }

    const emotion = data.emotion || "unknown";
    const reply = data.reply || "I'm here for you.";
    addMessage(`AI: ${reply}`, "bot");
  } catch (error) {
    console.error(error);
    addMessage(`AI: ${error.message || "Something went wrong."}`, "bot");
  }
}

function addMessage(text, className) {
  const div = document.createElement("div");
  div.className = className;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
