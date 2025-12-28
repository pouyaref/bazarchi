"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { useAuth } from "@/lib/auth-context";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Conversation {
  id: string;
  adId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  otherPartyPhone?: string;
  otherPartyName?: string;
  adTitle?: string;
}

export default function ConversationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchConversations();
    // Refresh every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/messages/conversations", {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return "همین الان";
    if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
    if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ساعت پیش`;
    }
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const handleConversationClick = (conversation: Conversation) => {
    if (conversation.otherPartyPhone) {
      router.push(`/messages?adId=${conversation.adId}&customerPhone=${conversation.otherPartyPhone}`);
    } else {
      router.push(`/messages?adId=${conversation.adId}`);
    }
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6 flex items-center justify-between" dir="rtl">
          <h1 className="text-2xl font-bold text-slate-900">گفتگوها</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2" dir="rtl">
              هنوز گفتگویی ندارید
            </h2>
            <p className="text-slate-600" dir="rtl">
              برای شروع گفتگو، روی یک آگهی کلیک کنید و "پیام دادن" را بزنید
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleConversationClick(conversation)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
                dir="rtl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">
                        {conversation.otherPartyName || "کاربر"}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    {conversation.adTitle && (
                      <p className="text-xs text-slate-500 mb-1" dir="rtl">
                        درباره: {conversation.adTitle}
                      </p>
                    )}
                    {conversation.lastMessage && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-1" dir="rtl">
                        {conversation.lastMessage}
                      </p>
                    )}
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-slate-400">
                        {formatTime(conversation.lastMessageAt)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

