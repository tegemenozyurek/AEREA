import type { ChatConversation } from '../types/chat';
import { CURRENT_USER_ID } from './mockChatUsers';

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function daysAgo(days: number, hours = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

export const mockConversations: ChatConversation[] = [
  {
    id: 'conv-soilsage',
    participantIds: [CURRENT_USER_ID, 'user-soilsage'],
    updatedAt: hoursAgo(2),
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-soilsage',
        body: 'Hey! Saw your question about transplanting — happy to help if you need more tips.',
        createdAt: daysAgo(1, 14),
      },
      {
        id: 'msg-2',
        senderId: CURRENT_USER_ID,
        body: 'That would be great, thanks! Should I wait for warmer nights?',
        createdAt: daysAgo(1, 15),
      },
      {
        id: 'msg-3',
        senderId: 'user-soilsage',
        body: 'Yes — once lows stay above 10°C you should be good. Row cover helps in the meantime.',
        createdAt: hoursAgo(2),
      },
    ],
  },
  {
    id: 'conv-hydroharry',
    participantIds: [CURRENT_USER_ID, 'user-hydroharry'],
    updatedAt: daysAgo(2, 16),
    messages: [
      {
        id: 'msg-h1',
        senderId: 'user-hydroharry',
        body: 'Your DWC setup looks solid. What nutrient line are you running?',
        createdAt: daysAgo(3, 11),
      },
      {
        id: 'msg-h2',
        senderId: CURRENT_USER_ID,
        body: 'General Hydroponics Flora series at half strength for now.',
        createdAt: daysAgo(3, 12),
      },
      {
        id: 'msg-h3',
        senderId: 'user-hydroharry',
        body: 'Nice — keep an eye on EC once plants start fruiting.',
        createdAt: daysAgo(2, 16),
      },
    ],
  },
  {
    id: 'conv-leaflover',
    participantIds: [CURRENT_USER_ID, 'user-leaflover'],
    updatedAt: daysAgo(5, 9),
    messages: [
      {
        id: 'msg-l1',
        senderId: 'user-leaflover',
        body: 'Want to swap some heirloom seed varieties this season?',
        createdAt: daysAgo(5, 9),
      },
    ],
  },
];
