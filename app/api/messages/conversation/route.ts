import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserByPhone, getUserById } from "@/lib/auth";
import { getAllMessagesBetweenUsers, markMessagesAsRead, getMessages, markConversationAsRead } from "@/lib/messages";
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

    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get("adId");

    if (!adId) {
      return NextResponse.json(
        { success: false, message: "شناسه آگهی ارسال نشده" },
        { status: 400 }
      );
    }

    // Get receiver phone from ad
    const ad = getAdById(adId);
    if (!ad || !ad.phone) {
      return NextResponse.json(
        { success: false, message: "آگهی یافت نشد" },
        { status: 404 }
      );
    }

    // Use phone numbers as identifiers
    const currentUserPhone = decoded.phone;
    const currentUserId = decoded.userId;
    const adOwnerPhone = ad.phone;
    const adOwnerUserId = ad.userId;

    // Get all messages for this ad
    const allMessages = getMessages();
    
    // Current user identifiers (phone and userId)
    const currentUserIds = [currentUserPhone, currentUserId].filter(Boolean);
    // Ad owner identifiers (phone and userId)  
    const adOwnerIds = [adOwnerPhone, adOwnerUserId].filter(Boolean);
    
    // Check if current user is the ad owner (seller)
    const isAdOwner = currentUserIds.some(id => adOwnerIds.includes(id));
    
    let otherPartyIds: string[] = [];
    
    if (isAdOwner) {
      // Seller is viewing: find the buyer from existing messages
      // Find messages where seller was receiver (messages sent TO seller)
      const messagesToSeller = allMessages.filter((msg: any) => 
        msg.adId === adId && 
        msg.senderId !== msg.receiverId && // Exclude self-messages
        adOwnerIds.includes(msg.receiverId)
      );
      
      if (messagesToSeller.length > 0) {
        // Get unique buyer IDs from messages
        const buyerIds = new Set<string>();
        messagesToSeller.forEach((msg: any) => {
          if (!adOwnerIds.includes(msg.senderId)) {
            buyerIds.add(msg.senderId);
          }
        });
        
        // Use the most recent buyer (prioritize by most recent message)
        const sortedMessages = messagesToSeller.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        if (sortedMessages.length > 0) {
          otherPartyIds = [sortedMessages[0].senderId];
        }
      } else {
        // No messages to seller yet, but check if seller sent any messages
        const messagesFromSeller = allMessages.filter((msg: any) => 
          msg.adId === adId && 
          msg.senderId !== msg.receiverId &&
          adOwnerIds.includes(msg.senderId)
        );
        
        if (messagesFromSeller.length > 0) {
          // Get unique receiver IDs from seller's messages
          const receiverIds = new Set<string>();
          messagesFromSeller.forEach((msg: any) => {
            if (!adOwnerIds.includes(msg.receiverId)) {
              receiverIds.add(msg.receiverId);
            }
          });
          
          const sortedMessages = messagesFromSeller.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          if (sortedMessages.length > 0) {
            otherPartyIds = [sortedMessages[0].receiverId];
          }
        }
      }
    } else {
      // Buyer is viewing: other party is the ad owner
      otherPartyIds = adOwnerIds;
    }
    
    // Filter messages: ONLY messages between current user and other party
    const filteredMessages = allMessages.filter((msg: any) => {
      // Must be for this ad
      if (msg.adId !== adId) return false;
      
      // Skip messages where sender and receiver are the same
      if (msg.senderId === msg.receiverId) return false;
      
      const msgSenderId = msg.senderId;
      const msgReceiverId = msg.receiverId;
      
      // Check if sender is current user and receiver is other party
      const currentUserIsSender = currentUserIds.includes(msgSenderId);
      const otherPartyIsReceiver = otherPartyIds.includes(msgReceiverId);
      
      // Check if sender is other party and receiver is current user
      const otherPartyIsSender = otherPartyIds.includes(msgSenderId);
      const currentUserIsReceiver = currentUserIds.includes(msgReceiverId);
      
      // Message is valid only if it's between these two specific parties
      return (currentUserIsSender && otherPartyIsReceiver) || (otherPartyIsSender && currentUserIsReceiver);
    });
    
    // Sort by date
    const messages = filteredMessages.sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Mark all unread messages in this conversation as read for the current user
    if (otherPartyIds.length > 0) {
      const otherPartyId = otherPartyIds[0];
      // Since messages store phone numbers in senderId/receiverId, otherPartyId is likely a phone
      let otherPartyPhone = otherPartyId;
      let otherPartyUserId = "";
      
      // Try to get user by phone to find userId
      const otherPartyUser = getUserByPhone(otherPartyId);
      if (otherPartyUser) {
        otherPartyUserId = otherPartyUser.id;
      } else {
        // If not found by phone, try by ID (in case it's stored as userId)
        const userById = getUserById(otherPartyId);
        if (userById) {
          otherPartyPhone = userById.phone;
          otherPartyUserId = userById.id;
        }
      }
      
      markConversationAsRead(currentUserPhone, currentUserId, otherPartyPhone, otherPartyUserId, adId);
    }

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

