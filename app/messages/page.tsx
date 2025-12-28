"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";
import { useAuth } from "@/lib/auth-context";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const adId = searchParams.get("adId");
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (adId) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [adId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!adId || !user) return;

    try {
      const response = await fetch(
        `/api/messages/conversation?adId=${adId}`,
        {
          credentials: "include", // Ensure cookies are sent
        }
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        console.error("Failed to fetch messages:", data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adId || !user || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({
          receiverId: "", // Not needed anymore, will be extracted from ad
          adId: adId,
          content: newMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        fetchMessages();
      } else {
        alert(data.message || "خطا در ارسال پیام");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return "همین الان";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} دقیقه پیش`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ساعت پیش`;
    } else {
      return new Intl.DateTimeFormat("fa-IR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  };

  if (!user) {
    return null;
  }

  if (!adId) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <h1 className="text-2xl font-bold mb-4" dir="rtl">گفتگوها</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600 text-center py-8" dir="rtl">
              شناسه آگهی یافت نشد
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
          {/* Header */}
          <div className="border-b border-slate-200 p-4 flex items-center space-x-3 space-x-reverse" dir="rtl">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="font-semibold text-slate-900" dir="rtl">گفتگو با فروشنده</h2>
              <p className="text-sm text-slate-500" dir="rtl">آگهی: {adId}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500" dir="rtl">
                  هنوز پیامی ارسال نشده است
                </p>
                <p className="text-sm text-slate-400 mt-2" dir="rtl">
                  اولین پیام را شما ارسال کنید
                </p>
              </div>
            ) : (
              messages.map((message) => {
                // Check if message is from current user (by phone or userId)
                const isOwnMessage = message.senderId === user.phone || message.senderId === user.id;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    dir="rtl"
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-900 border border-slate-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed" dir="rtl">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-blue-100" : "text-slate-400"
                        }`}
                        dir="rtl"
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="border-t border-slate-200 p-4 bg-white"
            dir="rtl"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="rtl"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
