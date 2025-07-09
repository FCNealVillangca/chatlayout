export default function Home() {
  const messages = Array.from({ length: 2 }, (_, index) => ({
    id: index,
    type: index % 2 === 0 ? "ai" : "user",
    content:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,",
  }));

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      {/* NAVIGATION */}
      <nav className="min-h-[60px] bg-red-400"></nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-blue-400 flex flex-grow min-h-0">
        <div className="w-full bg-green-400 md:block hidden"></div>
        {/* CHAT BOX */}
        <div className="w-[500px] flex flex-col bg-amber-100">
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
          {/* ADD justify end when keyboard is open */}
          <div className="flex-1 overflow-y-auto p-4 bg-blue-500 flex flex-col gap-4 justify-end">
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
          </div>

          {/* Input */}
          <div className="flex">
            <input
              type="text"
              className="w-full h-full p-2 bg-gray-400"
              placeholder="Type your message here..."
            />
            <button className="w-10 h-10 bg-gray-400">Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}
