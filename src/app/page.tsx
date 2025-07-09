import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <div className="w-full h-[100svh] bg-gray-100 flex flex-col">
      {/* NAVIGATION */}
      <nav className="min-h-[60px] bg-red-400 flex flex-col items-center justify-center">
        Navigation bar
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-blue-400 flex flex-grow min-h-0">
        <div className="w-full bg-green-400 md:block hidden"></div>
        <ChatInterface />
      </main>
    </div>
  );
}
