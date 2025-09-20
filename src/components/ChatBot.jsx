import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! Welcome to AquaLink 🐠 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  // Predefined FAQ responses
  const faqAnswers = {
    "available guppies": "We have Moscow, Delta, and Rainbow guppies.",
    "payment methods": "You can pay via PayPal, Credit Card, or Bank Transfer.",
    "shipping": "We deliver across the USA within 3-5 business days.",
    "order status": "You can track your orders in your dashboard under 'Manage Orders'.",
    "care tips": "Keep water clean, maintain temperature 24-26°C, and feed twice daily.",
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages([...messages, { from: "user", text: userMessage }]);
    setInput("");

    const lowerCaseMessage = userMessage.toLowerCase();
    let response = "Sorry, I didn't understand that. Please ask about guppies, orders, or shipping.";

    Object.keys(faqAnswers).forEach((key) => {
      if (lowerCaseMessage.includes(key)) {
        response = faqAnswers[key];
      }
    });

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: response }]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div className="w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col p-3 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-aqua/20 pb-2 mb-2">
            <span className="font-semibold text-primary">AquaLink Chat</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto mb-2 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-lg max-w-[75%] ${
                  msg.from === "bot" ? "bg-aqua/20 text-black self-start" : "bg-primary text-white self-end"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 border border-aqua/20 rounded px-2 py-1 focus:outline-none focus:border-primary"
            />
            <button onClick={sendMessage} className="bg-primary px-3 rounded text-white hover:opacity-90 transition">
              Send
            </button>
          </div>
        </div>
      )}

      {/* Chat toggle button */}
      <button
        className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg hover:bg-aqua transition"
        onClick={() => setOpen(!open)}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default ChatBot;
