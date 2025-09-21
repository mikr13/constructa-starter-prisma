import { createFileRoute } from '@tanstack/react-router'
import { Bot, Send, User } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { useState } from 'react';
import { } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/chat')({
  component: RouteComponent,
});

function RouteComponent() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' },
    { id: 2, text: 'Hi! I have a question about the dashboard.', sender: 'user' },
    {
      id: 3,
      text: "Sure! I'd be happy to help you with any questions about the dashboard.",
      sender: 'bot',
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: message,
          sender: 'user',
        },
      ]);
      setMessage('');

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: 'Thanks for your message! This is a demo response.',
            sender: 'bot',
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex flex-col gap-6 h-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions and get instant answers from our AI assistant.
          </p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Chat
            </CardTitle>
            <CardDescription>Have a conversation with our AI assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        msg.sender === 'bot' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}
                    >
                      {msg.sender === 'bot' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[70%] ${
                        msg.sender === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
