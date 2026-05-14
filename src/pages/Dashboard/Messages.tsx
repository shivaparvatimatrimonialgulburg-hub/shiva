import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, MoreVertical, Phone, Video, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { messageService } from '@/services/messageService';
import { toast } from 'sonner';

export default function Messages() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedChat) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [user, selectedChat]);

  const fetchChats = async () => {
    try {
      const data = await messageService.getChatPartners(user!.id);
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await messageService.getChatMessages(user!.id, selectedChat.id);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedChat || !user) return;
    try {
      setLoading(true);
      await messageService.sendMessage(user.id, selectedChat.id, messageText);
      setMessageText('');
      fetchMessages();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] flex gap-6">
      {/* Chat List */}
      <Card className="w-80 flex flex-col border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 bg-muted/50 border-none" placeholder="Search chats..." />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {chats.length > 0 ? chats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-muted/30'
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/${chat.id}/100/100`} />
                    <AvatarFallback>{chat.fullName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm truncate">{chat.fullName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Click to view messages</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No active conversations
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Window */}
      <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden">
        {selectedChat ? (
          <>
            <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://picsum.photos/seed/${selectedChat.id}/100/100`} />
                  <AvatarFallback>{selectedChat.fullName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selectedChat.fullName}</CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.fromId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[70%] ${
                      msg.fromId === user?.id 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted rounded-tl-none'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-[10px] mt-1 block ${msg.fromId === user?.id ? 'opacity-70' : 'text-muted-foreground'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    No messages yet. Say hello!
                  </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 border-t flex gap-2">
              <Input 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 bg-muted/50 border-none"
              />
              <Button type="submit" size="icon" disabled={loading} className="rounded-full bg-primary">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
}
