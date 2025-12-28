import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserByPhone, getUserById } from "@/lib/auth";
import { getMessages } from "@/lib/messages";
import { getAdById } from "@/lib/ads";

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const token = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "احراز هویت نشده" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (decoded.error || !decoded.userId || !decoded.phone) {
      return NextResponse.json(
        { success: false, message: "توکن نامعتبر" },
        { status: 401 }
      );
    }

    const userPhone = decoded.phone;
    const userId = decoded.userId;
    const allMessages = getMessages();

    // Get all messages where user is involved
    const userMessages = allMessages.filter(
      (msg: any) => msg.senderId === userPhone || msg.receiverId === userPhone ||
                     msg.senderId === userId || msg.receiverId === userId
    );

    // Group by adId and other party
    const conversationMap = new Map<string, any>();

    userMessages.forEach((msg: any) => {
      // Determine the other party
      const isSender = msg.senderId === userPhone || msg.senderId === userId;
      const otherPartyId = isSender ? msg.receiverId : msg.senderId;
      
      // Create unique conversation key: adId + otherPartyId
      const conversationKey = `${msg.adId}_${otherPartyId}`;

      if (!conversationMap.has(conversationKey)) {
        const ad = getAdById(msg.adId);
        
        // Find the other party user by phone or userId
        let otherPartyUser = getUserByPhone(otherPartyId);
        if (!otherPartyUser) {
          otherPartyUser = getUserById(otherPartyId);
        }
        
        // Get display name: name if exists, otherwise phone number
        const otherPartyName = otherPartyUser?.name || otherPartyUser?.phone || otherPartyId;
        
        conversationMap.set(conversationKey, {
          id: conversationKey,
          adId: msg.adId,
          adTitle: ad?.title || "آگهی",
          otherPartyPhone: otherPartyId,
          otherPartyName: otherPartyName,
          unreadCount: 0,
        });
      }

      const conversation = conversationMap.get(conversationKey)!;
      
      // Update last message
      if (!conversation.lastMessageAt || 
          new Date(msg.createdAt) > new Date(conversation.lastMessageAt)) {
        conversation.lastMessage = msg.content;
        conversation.lastMessageAt = msg.createdAt;
      }

      // Count unread messages
      const isReceiver = msg.receiverId === userPhone || msg.receiverId === userId;
      if (isReceiver && !msg.read) {
        conversation.unreadCount++;
      }
    });

    const conversations = Array.from(conversationMap.values()).sort((a, b) => {
      if (!a.lastMessageAt || !b.lastMessageAt) return 0;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

