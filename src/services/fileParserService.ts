/**
 * File Parser Service
 * Extracts text content from uploaded files (.txt, .md, .pdf, .docx, .pptx)
 */

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.pptx'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function isSupported(file: File): boolean {
  const ext = getFileExtension(file);
  return SUPPORTED_EXTENSIONS.includes(ext);
}

export function getFileExtension(file: File): string {
  const parts = file.name.split('.');
  if (parts.length < 2) return '';
  return '.' + parts.pop()!.toLowerCase();
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기가 50MB를 초과합니다.');
  }

  const ext = getFileExtension(file);

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(`지원하지 않는 파일 형식입니다: ${ext}\n지원 형식: .pptx, .pdf, .txt, .md, .docx`);
  }

  try {
    switch (ext) {
      case '.txt':
      case '.md':
        return await file.text();

      case '.pdf':
        return await extractFromPdf(file);

      case '.docx':
        return await extractFromDocx(file);

      case '.pptx':
        return await extractFromPptx(file);

      default:
        throw new Error(`지원하지 않는 파일 형식입니다: ${ext}`);
    }
  } catch (err: any) {
    // Re-throw with more context
    if (err.message.includes('지원하지 않는') || err.message.includes('10MB')) {
      throw err;
    }
    throw new Error(`${ext} 파일 처리 중 오류: ${err.message || '알 수 없는 오류'}`);
  }
}

async function extractFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Try multiple worker sources for compatibility
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const version = pdfjsLib.version || '4.9.155';
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    }).promise;
  } catch {
    // Fallback: disable worker and try again
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      disableAutoFetch: true,
    }).promise;
  }

  const textParts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item: any) => item.str)
      .map((item: any) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) {
      textParts.push(`[Page ${i}]\n${pageText}`);
    }
  }

  if (textParts.length === 0) {
    throw new Error('PDF에서 텍스트를 추출할 수 없습니다. (이미지 기반 PDF일 수 있습니다)');
  }

  return textParts.join('\n\n');
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  if (!result.value.trim()) {
    throw new Error('DOCX에서 텍스트를 추출할 수 없습니다.');
  }
  return result.value;
}

async function extractFromPptx(file: File): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const textParts: string[] = [];
  const slideFiles = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  for (const slidePath of slideFiles) {
    const xml = await zip.files[slidePath].async('text');
    // Extract text from <a:t> tags
    const texts: string[] = [];
    const regex = /<a:t>([\s\S]*?)<\/a:t>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      const t = match[1].trim();
      if (t) texts.push(t);
    }
    if (texts.length > 0) {
      const slideNum = slidePath.match(/slide(\d+)/)?.[1] || '?';
      textParts.push(`[Slide ${slideNum}]\n${texts.join(' ')}`);
    }
  }

  if (textParts.length === 0) {
    throw new Error('PPTX에서 텍스트를 추출할 수 없습니다.');
  }

  return textParts.join('\n\n');
}
