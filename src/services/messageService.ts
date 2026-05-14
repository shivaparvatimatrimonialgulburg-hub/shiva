
export const messageService = {
  getChatPartners: async (userId: string) => {
    const res = await fetch(`/api/messages/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch chat partners');
    return res.json();
  },

  getChatMessages: async (userId: string, otherUserId: string) => {
    const res = await fetch(`/api/messages/${userId}?otherUserId=${otherUserId}`);
    if (!res.ok) throw new Error('Failed to fetch chat messages');
    return res.json();
  },

  sendMessage: async (fromId: string, toId: string, content: string) => {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId, toId, content })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }
};
