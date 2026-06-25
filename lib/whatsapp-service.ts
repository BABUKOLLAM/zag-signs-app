import axios from 'axios';

const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const BASE_URL = `https://graph.instagram.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}`;

interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text' | 'template' | 'document' | 'image';
  text?: { preview_url: boolean; body: string };
  template?: { name: string; language: { code: string }; parameters?: { body: Array<{ type: string; text: string }> } };
  document?: { link: string; filename: string };
  image?: { link: string };
}

interface WhatsAppResponse {
  messages: Array<{ id: string }>;
  contacts: Array<{ input: string; wa_id: string }>;
}

// Send text message
export async function sendWhatsAppMessage(to: string, message: string): Promise<string> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('WhatsApp API credentials not configured');
  }

  // Format phone number (remove non-digits, ensure country code)
  const formattedPhone = formatPhoneNumber(to);

  const payload: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'text',
    text: {
      preview_url: true,
      body: message,
    },
  };

  try {
    const response = await axios.post<WhatsAppResponse>(`${BASE_URL}/messages`, payload, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    return response.data.messages[0].id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('WhatsApp API Error:', error.response?.data);
      throw new Error(`Failed to send WhatsApp message: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

// Send document (PDF)
export async function sendWhatsAppDocument(to: string, documentUrl: string, filename: string, caption?: string): Promise<string> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('WhatsApp API credentials not configured');
  }

  const formattedPhone = formatPhoneNumber(to);

  const payload: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'document',
    document: {
      link: documentUrl,
      filename: filename,
    },
  };

  try {
    const response = await axios.post<WhatsAppResponse>(`${BASE_URL}/messages`, payload, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    return response.data.messages[0].id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('WhatsApp API Error:', error.response?.data);
      throw new Error(`Failed to send WhatsApp document: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

// Send pre-approved template message
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  parameters?: string[]
): Promise<string> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error('WhatsApp API credentials not configured');
  }

  const formattedPhone = formatPhoneNumber(to);

  const payload: WhatsAppMessage = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      parameters: parameters
        ? {
            body: parameters.map(param => ({ type: 'text', text: param })),
          }
        : undefined,
    },
  };

  try {
    const response = await axios.post<WhatsAppResponse>(`${BASE_URL}/messages`, payload, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    return response.data.messages[0].id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('WhatsApp API Error:', error.response?.data);
      throw new Error(`Failed to send WhatsApp template: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

// Format phone number for WhatsApp API
function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // If doesn't start with country code, assume India (+91)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    return '91' + cleaned;
  }

  return cleaned;
}

// Verify webhook token (for receiving messages)
export function verifyWebhookToken(token: string): boolean {
  const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_TOKEN || 'whatsapp_webhook_token_zag_signs';
  return token === WEBHOOK_VERIFY_TOKEN;
}

// Parse incoming webhook message
export interface IncomingMessage {
  from: string;
  type: 'text' | 'document' | 'image' | 'location';
  text?: string;
  mediaUrl?: string;
  timestamp: number;
  messageId: string;
  customerName?: string;
}

export function parseIncomingMessage(webhookData: any): IncomingMessage | null {
  try {
    const changes = webhookData.entry?.[0]?.changes?.[0]?.value;
    if (!changes) return null;

    const message = changes.messages?.[0];
    const contact = changes.contacts?.[0];

    if (!message) return null;

    const parsed: IncomingMessage = {
      from: message.from,
      timestamp: parseInt(message.timestamp),
      messageId: message.id,
      type: message.type,
      customerName: contact?.profile?.name,
      text: message.text?.body,
    };

    if (message.type === 'document' && message.document) {
      parsed.mediaUrl = message.document.link;
    } else if (message.type === 'image' && message.image) {
      parsed.mediaUrl = message.image.link;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse incoming message:', error);
    return null;
  }
}

// Get message status
export async function getMessageStatus(messageId: string): Promise<'sent' | 'delivered' | 'read' | 'failed'> {
  if (!ACCESS_TOKEN) {
    throw new Error('WhatsApp API credentials not configured');
  }

  try {
    const response = await axios.get(`https://graph.instagram.com/${WHATSAPP_API_VERSION}/${messageId}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    });

    return response.data.status;
  } catch (error) {
    console.error('Failed to get message status:', error);
    return 'failed';
  }
}
