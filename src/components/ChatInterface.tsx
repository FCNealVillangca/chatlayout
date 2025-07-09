"use client";

import { useState, useRef, useEffect } from "react";
import useVirtualKeyboard from "@/hooks/useVirtualKeyboard";

export default function ChatInterface() {
  const { handleInputFocus, handleInputBlur, isKeyboardOpen } =
    useVirtualKeyboard();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  type Message = {
    id: number;
    type: "ai" | "user";
    content: string;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      type: "ai",
      content: "Welcome to our chat! How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const scrollToBottom = () => {
    setTimeout(() => {
      const container = messagesEndRef.current?.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 300);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length,
      type: "user",
      content: inputValue.trim(),
    };

    // Add AI reply
    const aiMessage: Message = {
      id: messages.length + 1,
      type: "ai",
      content: "Just a sample reply",
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    // flex grow is very important for deeply nested flex containers
    <div className="w-[500px] flex flex-col bg-amber-100 flex-grow min-h-0">
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
        className={`flex-1 overflow-y-auto p-4 bg-blue-500 flex flex-col gap-4 ${
          isKeyboardOpen ? "justify-end" : ""
        }`}
      >
        {messages.map((message) => (
          <div key={message.id} className="w-full">
            <div
              className={`p-2 w-[90%] ${
                message.type === "ai"
                  ? "bg-blue-300 ml-0"
                  : "bg-green-300 ml-auto"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex flex-shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full h-full p-2 bg-gray-400"
          placeholder="Type your message here..."
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
        <button onClick={handleSendMessage} className="w-10 h-10 bg-gray-400">
          Send
        </button>
      </div>
    </div>
  );
}
