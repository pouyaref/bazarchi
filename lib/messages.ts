import fs from "fs";
import path from "path";

const MESSAGES_FILE = path.join(process.cwd(), "data", "messages.json");

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  adId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  adId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

// Initialize messages file if it doesn't exist
function ensureMessagesFile() {
  const dataDir = path.dirname(MESSAGES_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
  }
}

// Read messages from file
export function getMessages(): Message[] {
  ensureMessagesFile();
  try {
    const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write messages to file
function saveMessages(messages: Message[]) {
  ensureMessagesFile();
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Create or get conversation ID
function getConversationId(userId1: string, userId2: string, adId: string): string {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}_${adId}`;
}

// Send a message (now uses phone numbers as identifiers)
export function sendMessage(
  senderPhone: string,
  receiverPhone: string,
  adId: string,
  content: string
): Message {
  const messages = getMessages();
  
  const newMessage: Message = {
    id: Date.now().toString(),
    conversationId: getConversationId(senderPhone, receiverPhone, adId),
    senderId: senderPhone, // Now stores phone number
    receiverId: receiverPhone, // Now stores phone number
    adId,
    content,
    createdAt: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);
  saveMessages(messages);
  
  return newMessage;
}

// Get messages for a conversation
export function getConversationMessages(
  userId1: string,
  userId2: string,
  adId: string
): Message[] {
  const messages = getMessages();
  const conversationId = getConversationId(userId1, userId2, adId);
  
  return messages
    .filter(msg => msg.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// Get all messages between two users for a specific ad (now uses phone numbers)
export function getAllMessagesBetweenUsers(
  phone1: string,
  phone2: string,
  adId: string
): Message[] {
  const messages = getMessages();
  
  return messages
    .filter(msg => 
      msg.adId === adId &&
      ((msg.senderId === phone1 && msg.receiverId === phone2) ||
       (msg.senderId === phone2 && msg.receiverId === phone1))
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// Get all conversations for a user
export function getUserConversations(userId: string): Conversation[] {
  const messages = getMessages();
  const userMessages = messages.filter(
    msg => msg.senderId === userId || msg.receiverId === userId
  );

  const conversationMap = new Map<string, Conversation>();

  userMessages.forEach(msg => {
    if (!conversationMap.has(msg.conversationId)) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      conversationMap.set(msg.conversationId, {
        id: msg.conversationId,
        participants: [userId, otherUserId],
        adId: msg.adId,
        unreadCount: 0,
      });
    }

    const conversation = conversationMap.get(msg.conversationId)!;
    if (!conversation.lastMessageAt || 
        new Date(msg.createdAt) > new Date(conversation.lastMessageAt)) {
      conversation.lastMessage = msg.content;
      conversation.lastMessageAt = msg.createdAt;
    }

    if (msg.receiverId === userId && !msg.read) {
      conversation.unreadCount++;
    }
  });

  return Array.from(conversationMap.values()).sort((a, b) => {
    if (!a.lastMessageAt || !b.lastMessageAt) return 0;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });
}

// Mark messages as read (now uses phone numbers)
// Marks messages as read where receiverPhone is the receiver and senderPhone is the sender
export function markMessagesAsRead(
  receiverPhone: string,
  senderPhone: string,
  adId: string
): void {
  const messages = getMessages();
  
  messages.forEach(msg => {
    if (
      msg.adId === adId &&
      msg.receiverId === receiverPhone &&
      msg.senderId === senderPhone &&
      !msg.read
    ) {
      msg.read = true;
    }
  });
  
  saveMessages(messages);
}

// Mark all unread messages in a conversation as read for the current user
export function markConversationAsRead(
  currentUserPhone: string,
  currentUserId: string,
  otherPartyPhone: string,
  otherPartyUserId: string,
  adId: string
): void {
  const messages = getMessages();
  const currentUserIds = [currentUserPhone, currentUserId].filter(Boolean);
  const otherPartyIds = [otherPartyPhone, otherPartyUserId].filter(Boolean);
  
  messages.forEach(msg => {
    if (
      msg.adId === adId &&
      currentUserIds.includes(msg.receiverId) &&
      otherPartyIds.includes(msg.senderId) &&
      !msg.read
    ) {
      msg.read = true;
    }
  });
  
  saveMessages(messages);
}

