import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { sendMessage } from "@/lib/messages";
import { getAdById } from "@/lib/ads";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { adId, content } = body;

    if (!adId || !content) {
      return NextResponse.json(
        { success: false, message: "لطفاً تمام فیلدها را پر کنید" },
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
    const senderPhone = decoded.phone;
    const senderUserId = decoded.userId;
    
    // Determine receiver: if sender is ad owner, find the other party from existing messages
    // Otherwise, receiver is the ad owner
    let receiverPhone = ad.phone;
    
    // Check if sender is the ad owner (by phone or userId)
    const isAdOwner = senderPhone === ad.phone || senderUserId === ad.userId;
    
    if (isAdOwner) {
      // Seller is sending: find the buyer from existing messages
      const { getMessages } = await import("@/lib/messages");
      const allMessages = getMessages();
      
      // Find messages for this ad where:
      // 1. Receiver is the ad owner (messages sent TO the seller)
      // 2. Or sender is not the ad owner (messages FROM buyers)
      const buyerMessages = allMessages.filter((msg: any) => 
        msg.adId === adId && 
        msg.senderId !== msg.receiverId && // Exclude self-messages
        (msg.receiverId === ad.phone || msg.receiverId === ad.userId || 
         (msg.senderId !== ad.phone && msg.senderId !== ad.userId))
      );
      
      if (buyerMessages.length > 0) {
        // Get the most recent buyer's phone (prioritize messages where seller was receiver)
        const sortedMessages = buyerMessages.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // First try to find a message where seller was the receiver
        const messageToSeller = sortedMessages.find((msg: any) => 
          msg.receiverId === ad.phone || msg.receiverId === ad.userId
        );
        
        if (messageToSeller) {
          receiverPhone = messageToSeller.senderId;
        } else {
          // Fallback: use sender of most recent message
          receiverPhone = sortedMessages[0].senderId;
        }
      } else {
        // No existing messages - this shouldn't happen for seller, but handle it
        return NextResponse.json(
          { success: false, message: "ابتدا خریدار باید پیامی ارسال کند" },
          { status: 400 }
        );
      }
    }
    // If not ad owner, receiverPhone is already set to ad.phone (correct)

    const message = sendMessage(senderPhone, receiverPhone, adId, content);

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}

