import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const categories = ["Guppies 🐠", "Stocks 📦", "Orders 🛒", "Feeding 🍽️", "Tank Setup 🏞️", "Website ℹ️"];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBotReply = (text) => {
    const msg = text.toLowerCase();

    if (msg.includes("rainbow") || msg.includes("moscow") || msg.includes("delta")) {
      return "🐟 To breed guppies, keep males and females in a healthy tank with 24–28°C water and a 14-hour light cycle. Feed high-quality food daily!";
    }
    if (msg.includes("water temperature") || msg.includes("temperature")) {
      return "🌡️ The ideal water temperature for guppies is 24–28°C (75–82°F). Keep it stable for healthy fish.";
    }
    if (msg.includes("feeding") || msg.includes("food")) {
      return "🍽️ Feed guppies small amounts 2–3 times a day. Use high-quality flakes, frozen or live foods like brine shrimp.";
    }
    if (msg.includes("care") || msg.includes("health")) {
      return "🛡️ Regularly change 20–30% of water weekly, monitor water parameters, and provide a balanced diet to keep guppies healthy.";
    }
    if (msg.includes("stocks") || msg.includes("available")) {
      return "📦 Current stocks: Rainbow Guppies – 25, Moscow Guppies – 15, Delta Guppies – 10. Contact us for more details!";
    }
    if (msg.includes("order") || msg.includes("delivery") || msg.includes("shipping")) {
      return "🛒 Check your order status under 'My Orders'. Delivery usually takes 3–5 business days.";
    }
    if (msg.includes("tank") || msg.includes("setup")) {
      return "🏞️ A 20–30 gallon tank is ideal for guppies. Ensure good filtration, moderate plants, and stable water parameters.";
    }
    if (msg.includes("website") || msg.includes("site") || msg.includes("help")) {
      return "💻 You can browse guppies, check stocks, place orders, and manage your profile easily on our website! Need guidance on any page?";
    }
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      return "👋 Hello! I’m AquaBot 🤖. Ask me about guppies 🐠, stocks 📦, orders 🛒, feeding 🍽️, or tank setup 🏞️.";
    }
    if (msg.includes("thanks") || msg.includes("thank you")) {
      return "😊 You’re welcome! Let me know if you have more questions.";
    }

    return "🤔 Sorry, I can only answer questions about guppies 🐠, feeding 🍽️, stocks 📦, orders 🛒, tank setup 🏞️, and our website 💻.";
  };

  const sendMessage = (msg = null) => {
    const userInput = msg || input;
    if (!userInput.trim()) return;

    const userMessage = { sender: "user", text: userInput, time: getTime() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMessage = { sender: "bot", text: getBotReply(userInput), time: getTime() };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-tr from-primary to-aqua p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
        >
          <MessageCircle className="text-white w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-[500px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-slide-in border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-aqua text-white p-3 font-semibold shadow-md">
            AquaBot 🤖
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => sendMessage(cat)}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`p-2 rounded-xl max-w-[70%] break-words flex flex-col ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-primary to-aqua text-white self-end ml-auto shadow-md"
                  : "bg-gray-200 text-gray-800 self-start shadow-sm"
              }`}>
                <span>{msg.text}</span>
                <span className="text-[10px] text-gray-500 self-end mt-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="bg-gray-200 text-gray-800 self-start p-2 rounded-xl max-w-[50%] animate-pulse">
                AquaBot is typing...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex p-2 border-t border-gray-200 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about guppies, stocks, orders..."
              className="flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-aqua/50"
            />
            <button
              onClick={() => sendMessage()}
              className="ml-2 bg-gradient-to-tr from-primary to-aqua text-white p-2 rounded-xl hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          0% { transform: translateY(200px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
