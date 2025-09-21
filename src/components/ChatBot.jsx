import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! Welcome to AquaLink 🐠 How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Predefined FAQ responses
  const faqAnswers = {
    "available guppies": "We have Moscow, Delta, and Rainbow guppies.",
    "moscow": "Moscow guppies are available in stock.",
    "delta": "Delta guppies are available in stock.",
    "rainbow": "Rainbow guppies are available in stock.",
    "payment": "You can pay via PayPal, Credit Card, or Bank Transfer.",
    "shipping": "We deliver across the USA within 3-5 business days.",
    "order": "Track your orders in your dashboard under 'Manage Orders'.",
    "care": "Keep water clean, maintain temperature 24-26°C, and feed twice daily."
  };

  const fallbackReplies = [
    "Hmm, I didn’t quite get that. Could you rephrase?",
    "I’m not sure I understand. Can you ask differently?",
    "Sorry, I’m still learning. Could you try asking another way?",
    "Oops! That went over my head 😅. Can you ask something else?"
  ];

  // Add emojis based on keywords
  const addEmoji = (text) => {
    if (text.toLowerCase().includes("guppy")) return text + " 🐠";
    if (text.toLowerCase().includes("order")) return text + " 📦";
    if (text.toLowerCase().includes("shipping")) return text + " 🚚";
    if (text.toLowerCase().includes("payment")) return text + " 💳";
    return text;
  };

  // Categorize messages for better labeling
  const categorizeMessage = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("guppy")) return "GUPPY";
    if (lower.includes("order")) return "ORDER";
    if (lower.includes("payment")) return "PAYMENT";
    if (lower.includes("shipping")) return "SHIPPING";
    return "GENERAL";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    // 1. Check local FAQ first
    const lowerMessage = userMessage.toLowerCase();
    let matchedAnswer = null;
    for (const keyword in faqAnswers) {
      if (lowerMessage.includes(keyword)) {
        matchedAnswer = faqAnswers[keyword];
        break;
      }
    }

    if (matchedAnswer) {
      setMessages(prev => [
        ...prev,
        { from: "bot", text: `[FAQ] ${addEmoji(matchedAnswer)}` }
      ]);
      setIsTyping(false);
      return;
    }

    // 2. Call backend GPT if no local FAQ matched
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });

      const data = await res.json();
      const botReply = data.reply || fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      const category = categorizeMessage(userMessage);

      setMessages(prev => [
        ...prev,
        { from: "bot", text: `[${category}] ${addEmoji(botReply)}` }
      ]);
    } catch (err) {
      const botReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      setMessages(prev => [...prev, { from: "bot", text: botReply }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Auto-scroll chat
  useEffect(() => {
    const chatContainer = document.querySelector(".chatbot-messages");
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [messages, isTyping]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open && (
        <div className="w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col p-3 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-aqua/20 pb-2 mb-2">
            <span className="font-semibold text-primary">AquaLink Chat</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5 text-muted-foreground"/>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto mb-2 space-y-2 chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-lg max-w-[75%] break-words ${
                  msg.from === "bot"
                    ? "bg-aqua/20 text-black self-start"
                    : "bg-primary text-white self-end"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="px-3 py-2 rounded-lg bg-aqua/10 text-black self-start animate-pulse">
                Bot is typing...
              </div>
            )}
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
            <button
              onClick={sendMessage}
              className="bg-primary px-3 rounded text-white hover:opacity-90 transition"
            >
              Send
            </button>
          </div>

          {/* Quick reply buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {["Available guppies", "Payment methods", "Shipping", "Track order"].map((btn, i) => (
              <button
                key={i}
                className="bg-aqua/20 px-2 py-1 rounded hover:bg-aqua/40 text-black text-sm"
                onClick={() => setInput(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat toggle button */}
      <button
        className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg hover:bg-aqua transition"
        onClick={() => setOpen(!open)}
      >
        <MessageCircle className="w-6 h-6 text-white"/>
      </button>

      {/* Extra CSS */}
      <style jsx>{`
        .chatbot-messages {
          scroll-behavior: smooth;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background-color: rgba(100, 108, 255, 0.5);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
