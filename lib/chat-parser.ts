import { parseKakaoExport } from './kakao-parser';
import type { ParsedConversation, ParsedMessage } from './kakao-parser';

export type { ParsedConversation, ParsedMessage };
export type Platform = 'kakao' | 'whatsapp' | 'line';

export function detectPlatform(text: string): Platform {
  const sample = text.slice(0, 2000);
  if (/\[LINE\]/.test(sample)) return 'line';
  const lines = sample.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 8);
  for (const line of lines) {
    // WhatsApp iOS: [16/01/2024, 13:42:10] Name: message
    if (/^\[\d{1,2}[./]\d{1,2}[./]\d{2,4},\s*\d{1,2}:\d{2}/.test(line)) return 'whatsapp';
    // WhatsApp Android: 16/01/2024, 13:42 - Name: message
    if (/^\d{1,2}[./]\d{1,2}[./]\d{2,4},\s*\d{1,2}:\d{2}/.test(line)) return 'whatsapp';
  }
  return 'kakao';
}

export function parseChat(text: string, targetName: string, platform?: Platform): ParsedConversation {
  const resolved = platform ?? detectPlatform(text);
  if (resolved === 'whatsapp') return parseWhatsApp(text, targetName);
  if (resolved === 'line') return parseLine(text, targetName);
  return parseKakaoExport(text, targetName);
}

// ── helpers ──────────────────────────────────────────────────────────────────

const WA_MEDIA_RE = /<media omitted>|image omitted|video omitted|audio omitted|sticker omitted|gif omitted/i;
const LINE_MEDIA_RE = /^\[(Photo|Sticker|File|Video|Voice message|Album)\]$/i;

function isMedia(content: string): boolean {
  return WA_MEDIA_RE.test(content) || LINE_MEDIA_RE.test(content.trim());
}

function matchTarget(sender: string, targetName: string): boolean {
  const s = sender.trim();
  const t = targetName.trim();
  return s === t || s.includes(t) || t.includes(s);
}

function toConversation(
  messages: ParsedMessage[],
  participants: Set<string>,
  targetName: string
): ParsedConversation {
  return {
    participants: Array.from(participants),
    messages,
    targetMessages: messages.filter(m => matchTarget(m.sender, targetName)),
  };
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
// iOS:     [16/01/2024, 13:42:10] Name: message
// Android: 16/01/2024, 13:42 - Name: message  |  1/16/24, 1:42 PM - Name: message

const WA_IOS_RE =
  /^\[(\d{1,2}[./]\d{1,2}[./]\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]\s*([^:]+?):\s*([\s\S]*)/i;
const WA_ANDROID_RE =
  /^(\d{1,2}[./]\d{1,2}[./]\d{2,4}),\s*(\d{1,2}:\d{2}(?:\s*[AP]M)?)\s*-\s*([^:]+?):\s*([\s\S]*)/i;

function parseWhatsApp(text: string, targetName: string): ParsedConversation {
  const lines = text.split('\n');
  const messages: ParsedMessage[] = [];
  const participants = new Set<string>();
  let current: ParsedMessage | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const m = trimmed.match(WA_IOS_RE) ?? trimmed.match(WA_ANDROID_RE);
    if (m) {
      if (current) messages.push(current);
      const [, date, time, sender, content] = m;
      const s = sender.trim();
      const c = content.trim();
      if (isMedia(c) || !c) { current = null; continue; }
      participants.add(s);
      current = { sender: s, time, content: c, date };
    } else if (current && trimmed.length > 0) {
      current.content += '\n' + trimmed;
    }
  }
  if (current) messages.push(current);

  return toConversation(messages, participants, targetName);
}

// ── Line ──────────────────────────────────────────────────────────────────────
// Korean date:  2024.01.15 월요일
// English date: Monday, January 15, 2024
// Message (tab-separated): HH:MM\tName\tContent

const LINE_KO_DATE_RE = /^\d{4}[.년]\s*\d{1,2}[.월]\s*\d{1,2}/;
const LINE_EN_DATE_RE = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*,\s+\w+\s+\d{1,2},\s+\d{4}/i;
const LINE_MSG_RE = /^(\d{1,2}:\d{2}(?:\s*[AP]M)?)\t([^\t]+)\t([\s\S]*)/i;

function parseLine(text: string, targetName: string): ParsedConversation {
  const lines = text.split('\n');
  const messages: ParsedMessage[] = [];
  const participants = new Set<string>();
  let currentDate = '';
  let current: ParsedMessage | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('[LINE]') || /^저장날짜\s*:|^Saved Date\s*:/i.test(trimmed)) continue;

    if (LINE_KO_DATE_RE.test(trimmed) || LINE_EN_DATE_RE.test(trimmed)) {
      if (current) messages.push(current);
      current = null;
      currentDate = trimmed;
      continue;
    }

    const m = line.match(LINE_MSG_RE);
    if (m) {
      if (current) messages.push(current);
      const [, time, sender, content] = m;
      const s = sender.trim();
      const c = content.trim();
      if (isMedia(c) || s === 'LINE' || !c) { current = null; continue; }
      participants.add(s);
      current = { sender: s, time, content: c, date: currentDate };
    } else if (current && trimmed.length > 0) {
      current.content += '\n' + trimmed;
    }
  }
  if (current) messages.push(current);

  return toConversation(messages, participants, targetName);
}
