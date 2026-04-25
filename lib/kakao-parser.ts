export interface ParsedMessage {
  sender: string;
  time: string;
  content: string;
  date: string;
}

export interface ParsedConversation {
  participants: string[];
  messages: ParsedMessage[];
  targetMessages: ParsedMessage[];
}

/**
 * Parses KakaoTalk exports in three formats:
 *
 * Format 1 (txt, old mobile):
 * --------------- 2024년 1월 15일 월요일 ---------------
 * [홍길동] [오전 10:00] 안녕하세요
 *
 * Format 2 (txt, newer mobile):
 * 2024. 1. 15. 오전 10:00, 홍길동 : 안녕하세요
 *
 * Format 3 (csv, PC KakaoTalk):
 * "Date","User","Message","Type"
 * "2024-01-15 10:00:00","홍길동","안녕하세요","Talk"
 */
export function parseKakaoExport(text: string, targetName: string): ParsedConversation {
  const lines = text.split('\n');
  const messages: ParsedMessage[] = [];
  const participantSet = new Set<string>();

  const isCsv = detectCsv(lines);
  if (isCsv) {
    parseCsv(lines, messages, participantSet);
  } else {
    const isFormat2 = lines.some(line =>
      /^\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*(오전|오후)\s*\d{1,2}:\d{2},/.test(line)
    );
    if (isFormat2) {
      parseFormat2(lines, messages, participantSet);
    } else {
      parseFormat1(lines, messages, participantSet);
    }
  }

  const targetNormalized = targetName.trim();
  const targetMessages = messages.filter(m => {
    const senderNorm = m.sender.trim();
    return senderNorm === targetNormalized ||
      senderNorm.includes(targetNormalized) ||
      targetNormalized.includes(senderNorm);
  });

  return {
    participants: Array.from(participantSet),
    messages,
    targetMessages,
  };
}

// ── CSV ──────────────────────────────────────────────────────────────────────

function detectCsv(lines: string[]): boolean {
  // Look for a header row containing Date/날짜 and User/사용자 columns
  const header = lines.find(l => l.trim().length > 0)?.toLowerCase() ?? '';
  return (
    (header.includes('date') || header.includes('날짜')) &&
    (header.includes('user') || header.includes('사용자') || header.includes('보낸사람'))
  );
}

// Minimal RFC-4180 CSV field parser (handles quoted fields with embedded commas/newlines)
function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      // Quoted field
      let val = '';
      i++; // skip opening quote
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { val += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else { val += line[i++]; }
      }
      fields.push(val);
      if (line[i] === ',') i++;
    } else {
      const end = line.indexOf(',', i);
      if (end === -1) { fields.push(line.slice(i).trim()); break; }
      fields.push(line.slice(i, end).trim());
      i = end + 1;
    }
  }
  return fields;
}

function parseCsv(lines: string[], messages: ParsedMessage[], participants: Set<string>) {
  const headerLine = lines.find(l => l.trim().length > 0) ?? '';
  const headers = parseCsvRow(headerLine).map(h => h.toLowerCase().replace(/["\s]/g, ''));

  // Map column names to indices (supports Korean and English headers)
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('날짜'));
  const userIdx = headers.findIndex(h =>
    h.includes('user') || h.includes('사용자') || h.includes('보낸사람')
  );
  const msgIdx = headers.findIndex(h =>
    h.includes('message') || h.includes('내용') || h.includes('메시지')
  );
  const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('유형'));

  if (dateIdx === -1 || userIdx === -1 || msgIdx === -1) return;

  let pastHeader = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!pastHeader) { pastHeader = true; continue; } // skip header row

    const fields = parseCsvRow(trimmed);
    if (fields.length <= Math.max(dateIdx, userIdx, msgIdx)) continue;

    const type = typeIdx !== -1 ? fields[typeIdx]?.trim() : 'Talk';
    // Skip file/photo/sticker rows
    if (type && !['talk', '텍스트', '메시지', ''].includes(type.toLowerCase())) continue;

    const rawDate = fields[dateIdx]?.trim() ?? '';
    const sender  = fields[userIdx]?.trim() ?? '';
    const content = fields[msgIdx]?.trim() ?? '';

    if (!sender || !content) continue;

    // Parse date string like "2024-01-15 10:00:00" or "2024. 1. 15 10:00:00"
    const datePart = rawDate.split(' ')[0] ?? rawDate;
    const timePart = rawDate.split(' ').slice(1).join(' ') || '';

    participants.add(sender);
    messages.push({ sender, time: timePart, content, date: datePart });
  }
}

// ── TXT Format 1 ─────────────────────────────────────────────────────────────

function parseFormat1(lines: string[], messages: ParsedMessage[], participants: Set<string>) {
  let currentDate = '';
  let currentMessage: ParsedMessage | null = null;

  const dateLineRe = /^-+\s*(\d{4}년\s*\d{1,2}월\s*\d{1,2}일.*?)\s*-+$/;
  // [이름] [오전/오후 HH:MM] content
  const msgRe = /^\[(.+?)\]\s*\[(오전|오후)\s*(\d{1,2}:\d{2})\]\s*([\s\S]*)/;

  for (const line of lines) {
    const trimmed = line.trim();

    const dateMatch = trimmed.match(dateLineRe);
    if (dateMatch) {
      if (currentMessage) messages.push(currentMessage);
      currentMessage = null;
      currentDate = dateMatch[1].trim();
      continue;
    }

    const msgMatch = trimmed.match(msgRe);
    if (msgMatch) {
      if (currentMessage) messages.push(currentMessage);
      const sender = msgMatch[1].trim();
      const ampm = msgMatch[2];
      const time = msgMatch[3];
      const content = msgMatch[4].trim();
      participants.add(sender);
      currentMessage = {
        sender,
        time: `${ampm} ${time}`,
        content,
        date: currentDate,
      };
    } else if (currentMessage && trimmed.length > 0) {
      // continuation line
      currentMessage.content += '\n' + trimmed;
    }
  }

  if (currentMessage) messages.push(currentMessage);
}

function parseFormat2(lines: string[], messages: ParsedMessage[], participants: Set<string>) {
  // 2024. 1. 15. 오전 10:00, 홍길동 : 안녕하세요
  const msgRe = /^(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.)\s*(오전|오후)\s*(\d{1,2}:\d{2}),\s*(.+?)\s*:\s*([\s\S]*)/;

  let currentMessage: ParsedMessage | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(msgRe);
    if (match) {
      if (currentMessage) messages.push(currentMessage);
      const date = match[1].trim();
      const ampm = match[2];
      const time = match[3];
      const sender = match[4].trim();
      const content = match[5].trim();
      participants.add(sender);
      currentMessage = {
        sender,
        time: `${ampm} ${time}`,
        content,
        date,
      };
    } else if (currentMessage && trimmed.length > 0) {
      currentMessage.content += '\n' + trimmed;
    }
  }

  if (currentMessage) messages.push(currentMessage);
}
