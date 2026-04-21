import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, MoreVertical, Phone, Video, MessageSquare } from 'lucide-react';

const MOCK_CHATS = [
  { id: 1, name: 'Priya Sharma', lastMessage: 'Hello, I liked your profile.', time: '10:30 AM', unread: 2, online: true },
  { id: 2, name: 'Sneha Patil', lastMessage: 'When can we talk?', time: 'Yesterday', unread: 0, online: false },
  { id: 3, name: 'Anjali Gupta', lastMessage: 'My parents want to meet.', time: '2 days ago', unread: 0, online: true },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState<any>(MOCK_CHATS[0]);
  const [message, setMessage] = useState('');

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
            {MOCK_CHATS.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-muted/30'
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/${chat.id + 50}/100/100`} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm truncate">{chat.name}</p>
                    <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {chat.unread}
                  </span>
                )}
              </div>
            ))}
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
                  <AvatarImage src={`https://picsum.photos/seed/${selectedChat.id + 50}/100/100`} />
                  <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{selectedChat.name}</CardTitle>
                  <p className="text-xs text-green-500">{selectedChat.online ? 'Online' : 'Offline'}</p>
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
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none max-w-[70%]">
                    <p className="text-sm">{selectedChat.lastMessage}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">10:30 AM</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none max-w-[70%]">
                    <p className="text-sm">Hi! Yes, I would love to talk more about our interests.</p>
                    <span className="text-[10px] opacity-70 mt-1 block">10:35 AM</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
              <Input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 bg-muted/50 border-none"
              />
              <Button size="icon" className="rounded-full bg-primary">
                <Send className="h-4 w-4" />
              </Button>
            </div>
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
