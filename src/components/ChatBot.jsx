import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const categories = ["Guppies", "Stocks", "Orders", "Feeding", "Tank Setup"];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Simple rule-based mock AI
  const getBotReply = (text) => {
    const message = text.toLowerCase();
    if (message.includes("rainbow") || message.includes("moscow") || message.includes("delta")) {
      return "To breed guppies, keep males and females in a healthy tank with 24–28°C water and a 14-hour light cycle. Feed high-quality food daily.";
    }
    if (message.includes("water temperature")) {
      return "The ideal water temperature for guppies is 24–28°C (75–82°F). Maintain stable parameters for healthy fish.";
    }
    if (message.includes("feeding")) {
      return "Feed guppies small amounts 2–3 times a day. Use high-quality flakes, frozen or live foods like brine shrimp or daphnia.";
    }
    if (message.includes("care")) {
      return "Regularly change 20–30% of water weekly, keep a balanced diet, and monitor water parameters to keep guppies healthy.";
    }
    if (message.includes("stocks") || message.includes("available")) {
      return "Current stocks: Rainbow Guppies – 25, Moscow Guppies – 15, Delta Guppies – 10. Contact us for more details.";
    }
    if (message.includes("order") || message.includes("delivery")) {
      return "Your order status can be checked under 'My Orders' in your account. Delivery typically takes 3–5 business days.";
    }
    if (message.includes("tank")) {
      return "For guppies, a 20–30 gallon tank is ideal. Ensure good filtration, moderate plants, and maintain stable water parameters.";
    }
    return "I can answer questions only about guppies, aquarium care, stocks, and orders.";
  };

  const sendMessage = (msg = null) => {
    const userInput = msg || input;
    if (!userInput.trim()) return;

    const userMessage = { sender: "user", text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botMessage = { sender: "bot", text: getBotReply(userInput) };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = e => {
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
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-aqua text-white p-3 font-semibold shadow-md">
            AquaBot
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

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

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl max-w-[70%] break-words ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-primary to-aqua text-white self-end ml-auto shadow-md"
                    : "bg-gray-200 text-gray-800 self-start shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="bg-gray-200 text-gray-800 self-start p-2 rounded-xl max-w-[50%] animate-pulse">
                AquaBot is typing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex p-2 border-t border-gray-200 bg-white">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
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

      <style jsx>{`
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
