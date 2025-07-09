"use client";

import { useRef, useEffect, useState } from "react";

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial AI message
  const [messages, setMessages] = useState([
    { id: 0, type: "ai" as const, content: "Welcome!" },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputFocus = () => {
    setTimeout(scrollToBottom, 300); // iOS Safari workaround
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage = {
      id: messages.length,
      type: "user" as const,
      content: text,
    };

    const aiReply = {
      id: messages.length + 1,
      type: "ai" as const,
      content: `You said: ${text}`,
    };

    setMessages((prev) => [...prev, newMessage, aiReply]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (input) {
      handleSendMessage(input.value);
      input.value = "";
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-gray-100 flex flex-col">
      {/* NAVIGATION */}
      <nav className="min-h-[60px] bg-red-400"></nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-blue-400 flex flex-grow min-h-0 overflow-hidden">
        <div className="w-full bg-green-400 md:block hidden"></div>

        {/* CHAT BOX */}
        <div className="w-full max-w-[500px] flex flex-col bg-amber-100 h-full">
          {/* Header */}
          <div className="max-h-[100px] flex items-center gap-3 p-4 bg-white border-b flex-shrink-0">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">AI Assistant</h3>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>

          {/* Messages Container */}
          <div
            className="flex-1 overflow-y-auto p-4 bg-blue-500 flex flex-col gap-4"
            style={{ maxHeight: "calc(100dvh - 160px)" }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`w-full flex flex-col ${
                  message.type === "ai" ? "items-start" : "items-end"
                } `}
              >
                <div
                  className={`p-3 rounded-md w-[90%] ${
                    message.type === "ai"
                      ? "bg-blue-300 ml-0 text-left"
                      : "bg-green-300 ml-auto text-right"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-white border-t flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 p-3 border border-gray-300 rounded-lg outline-none bg-gray-100"
                placeholder="Type your message..."
                onFocus={handleInputFocus}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
