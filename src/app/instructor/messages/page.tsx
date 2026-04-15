import type { Metadata } from "next";
import {
  LuSearch as Search,
  LuSend as Send,
  LuPaperclip as Paperclip,
  LuPhone as Phone,
  LuVideo as Video,
  LuCircle as Circle,
} from "react-icons/lu";

export const metadata: Metadata = {
  title: "Instructor messages",
};

type Conversation = {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  online: boolean;
};

type Message = {
  id: string;
  sender: "me" | "other";
  text: string;
  time: string;
};

const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Nadia Rahman",
    role: "Student",
    lastMessage: "Could you explain chapter 3 again?",
    lastTime: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: "c2",
    name: "Imran Hossain",
    role: "Student",
    lastMessage: "I submitted assignment 2.",
    lastTime: "1h ago",
    unread: 0,
    online: false,
  },
  {
    id: "c3",
    name: "Course Support",
    role: "Admin",
    lastMessage: "New enrollment batch synced.",
    lastTime: "Yesterday",
    unread: 1,
    online: true,
  },
];

const activeMessages: Message[] = [
  { id: "m1", sender: "other", text: "Hello sir, I am confused about vectors.", time: "10:02 AM" },
  { id: "m2", sender: "me", text: "No problem. Which part is confusing?", time: "10:04 AM" },
  { id: "m3", sender: "other", text: "Dot product vs cross product examples.", time: "10:06 AM" },
  { id: "m4", sender: "me", text: "Great question. I will share a short example now.", time: "10:08 AM" },
];

export default function InstructorMessagesPage() {
  const activeConversation = conversations[0];

  return (
    <main className="relative z-10 p-2 sm:p-4">
      <section className="mb-4 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4">
        <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-600">
          Instructor-student messaging workspace.
        </p>
      </section>

      <section className="grid min-h-[65vh] grid-cols-1 gap-4 lg:grid-cols-3">
        <aside className="rounded-xl border border-gray-200 bg-white p-3 lg:col-span-1">
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              readOnly
              value=""
              placeholder="Search conversations..."
              className="w-full border-0 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  conv.id === activeConversation.id
                    ? "border-purple-300 bg-purple-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {conv.name}
                    </p>
                    <p className="text-xs text-gray-500">{conv.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{conv.lastTime}</p>
                    {conv.unread > 0 ? (
                      <span className="mt-1 inline-flex min-w-5 justify-center rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {conv.unread}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 truncate text-xs text-gray-600">{conv.lastMessage}</p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
                  <Circle
                    className={`h-2.5 w-2.5 ${
                      conv.online ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                    }`}
                  />
                  {conv.online ? "Online" : "Offline"}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col rounded-xl border border-gray-200 bg-white lg:col-span-2">
          <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{activeConversation.name}</p>
              <p className="text-xs text-gray-500">{activeConversation.role}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <button type="button" className="rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                <Phone className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                <Video className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {activeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    msg.sender === "me"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      msg.sender === "me" ? "text-purple-100" : "text-gray-500"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                readOnly
                value=""
                placeholder="Type a message..."
                className="w-full border-0 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                className="rounded-md bg-purple-600 p-2 text-white hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
