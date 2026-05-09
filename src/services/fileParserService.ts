/**
 * File Parser Service
 * Extracts text content from uploaded files (.txt, .md, .pdf, .docx, .pptx)
 */

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.pdf', '.docx', '.pptx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function isSupported(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

export function getFileExtension(file: File): string {
  return '.' + (file.name.split('.').pop()?.toLowerCase() || '');
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('파일 크기가 10MB를 초과합니다.');
  }

  const ext = getFileExtension(file);

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(`지원하지 않는 파일 형식입니다: ${ext}`);
  }

  switch (ext) {
    case '.txt':
    case '.md':
      return file.text();

    case '.pdf':
      return extractFromPdf(file);

    case '.docx':
      return extractFromDocx(file);

    case '.pptx':
      return extractFromPptx(file);

    default:
      throw new Error(`지원하지 않는 파일 형식입니다: ${ext}`);
  }
}

async function extractFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    if (pageText.trim()) {
      textParts.push(`[Page ${i}]\n${pageText}`);
    }
  }

  return textParts.join('\n\n');
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
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

  return textParts.join('\n\n');
}
