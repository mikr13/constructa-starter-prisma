import { Image, Send, Upload, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { useState } from 'react';
import { } from '@tanstack/react-router';

export const Route = createFileRoute({
  component: RouteComponent,
});

function RouteComponent() {
  const [message, setMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! Upload an image and I can help you analyze it.',
      sender: 'bot',
      image: null,
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() || uploadedImage) {
      const newMessage = {
        id: messages.length + 1,
        text: message || 'Analyze this image',
        sender: 'user' as const,
        image: uploadedImage,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setUploadedImage(null);

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: 'I can see the image you uploaded. This is a demo response, but in a real application, I would analyze the image content and provide insights.',
            sender: 'bot',
            image: null,
          },
        ]);
      }, 1500);
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex flex-col gap-6 h-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Image Chat</h1>
          <p className="text-muted-foreground">
            Upload images and get AI-powered analysis and insights.
          </p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Visual AI Assistant
            </CardTitle>
            <CardDescription>Chat about images with our AI assistant</CardDescription>
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
                      <Image className="h-4 w-4" />
                    </div>
                    <div className={`max-w-[70%] space-y-2`}>
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Uploaded"
                          className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                        />
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          msg.sender === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-4 space-y-3">
              {uploadedImage && (
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-md"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => setUploadedImage(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button type="button" variant="outline" size="icon" asChild>
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
                <Input
                  placeholder="Ask about the image..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!message.trim() && !uploadedImage}>
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
