/**
 * Data Analysis Service (Phase 2)
 * xlsx/csv 업로드 → 데이터 구조 분석 → ChartConfig 자동 생성
 */
import type { ParsedSpreadsheet, DataColumn, ChartSuggestion } from '../types';

/**
 * xlsx/csv 파일 파싱
 */
export async function parseSpreadsheet(file: File): Promise<ParsedSpreadsheet> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    return parseCsv(file);
  } else if (ext === 'xlsx' || ext === 'xls') {
    return parseXlsx(file);
  }

  throw new Error('지원하지 않는 파일 형식입니다. (.xlsx, .csv만 지원)');
}

async function parseCsv(file: File): Promise<ParsedSpreadsheet> {
  const text = await file.text();
  const lines = text.trim().split('\n').map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));

  if (lines.length < 2) {
    throw new Error('CSV 파일에 충분한 데이터가 없습니다. (헤더 + 1행 이상 필요)');
  }

  const headers = lines[0];
  const dataRows = lines.slice(1);

  const columns: DataColumn[] = headers.map((name, colIdx) => {
    const values = dataRows.map(row => row[colIdx] || '');
    const type = inferColumnType(values);
    return {
      name,
      type,
      values: type === 'number' ? values.map(v => parseFloat(v) || 0) : values,
    };
  });

  const preview: Record<string, (string | number)[]> = {};
  columns.forEach(col => {
    preview[col.name] = col.values.slice(0, 5);
  });

  return {
    sheetName: file.name.replace(/\.[^.]+$/, ''),
    columns,
    rowCount: dataRows.length,
    preview,
  };
}

async function parseXlsx(file: File): Promise<ParsedSpreadsheet> {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { header: 1 });

  if (jsonData.length < 2) {
    throw new Error('스프레드시트에 충분한 데이터가 없습니다.');
  }

  const headers = (jsonData[0] as any[]).map(h => String(h || ''));
  const dataRows = jsonData.slice(1) as any[][];

  const columns: DataColumn[] = headers.map((name, colIdx) => {
    const values = dataRows.map(row => row[colIdx] ?? '');
    const type = inferColumnType(values.map(v => String(v)));
    return {
      name,
      type,
      values: type === 'number' ? values.map(v => (typeof v === 'number' ? v : parseFloat(String(v)) || 0)) : values.map(v => String(v)),
    };
  });

  const preview: Record<string, (string | number)[]> = {};
  columns.forEach(col => {
    preview[col.name] = col.values.slice(0, 5);
  });

  return {
    sheetName,
    columns,
    rowCount: dataRows.length,
    preview,
  };
}

/**
 * 열 데이터 타입 추론
 */
function inferColumnType(values: string[]): 'number' | 'string' | 'date' {
  const sample = values.slice(0, 20).filter(v => v !== '');
  if (sample.length === 0) return 'string';

  // Check if mostly numbers
  const numericCount = sample.filter(v => !isNaN(parseFloat(v)) && isFinite(Number(v))).length;
  if (numericCount / sample.length >= 0.8) return 'number';

  // Check if dates
  const datePatterns = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/,
    /^\d{4}년/,
    /^\d{4}Q[1-4]$/i,
  ];
  const dateCount = sample.filter(v => datePatterns.some(p => p.test(v))).length;
  if (dateCount / sample.length >= 0.6) return 'date';

  return 'string';
}

/**
 * 데이터 분석 → 차트 추천 목록 생성
 */
export function suggestCharts(data: ParsedSpreadsheet): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];
  const numericCols = data.columns.filter(c => c.type === 'number');
  const categoryCols = data.columns.filter(c => c.type === 'string');
  const dateCols = data.columns.filter(c => c.type === 'date');

  // 카테고리 + 숫자 → Column chart
  if (categoryCols.length >= 1 && numericCols.length >= 1) {
    const catCol = categoryCols[0];
    const categories = catCol.values.slice(0, 10).map(String);

    // Single numeric → simple bar chart
    const firstNum = numericCols[0];
    suggestions.push({
      chartType: 'column',
      title: `${firstNum.name} by ${catCol.name}`,
      description: `${catCol.name}별 ${firstNum.name} 비교`,
      config: {
        type: 'column',
        title: `${catCol.name}별 ${firstNum.name}`,
        categories,
        series: [{
          name: firstNum.name,
          data: (firstNum.values as number[]).slice(0, 10),
        }],
        xAxisLabel: catCol.name,
        yAxisLabel: firstNum.name,
        showLegend: false,
      },
    });

    // Multiple numeric → grouped bar chart
    if (numericCols.length >= 2) {
      suggestions.push({
        chartType: 'column',
        title: `${catCol.name}별 다중 지표 비교`,
        description: `여러 수치를 카테고리별로 비교`,
        config: {
          type: 'column',
          title: `${catCol.name}별 비교`,
          categories,
          series: numericCols.slice(0, 4).map(col => ({
            name: col.name,
            data: (col.values as number[]).slice(0, 10),
          })),
          xAxisLabel: catCol.name,
          showLegend: true,
        },
      });
    }

    // Pie chart (if few categories)
    if (categories.length <= 8 && numericCols.length >= 1) {
      suggestions.push({
        chartType: 'pie',
        title: `${firstNum.name} 비율 분포`,
        description: `${catCol.name}별 ${firstNum.name} 비율`,
        config: {
          type: 'pie',
          title: `${firstNum.name} 비율`,
          categories,
          series: [{
            name: firstNum.name,
            data: (firstNum.values as number[]).slice(0, 8),
          }],
          showLegend: true,
        },
      });
    }
  }

  // 날짜 + 숫자 → Line chart
  if (dateCols.length >= 1 && numericCols.length >= 1) {
    const dateCol = dateCols[0];
    const dates = dateCol.values.slice(0, 12).map(String);

    suggestions.push({
      chartType: 'line',
      title: `${numericCols[0].name} 추이`,
      description: `시간에 따른 ${numericCols[0].name} 변화`,
      config: {
        type: 'line',
        title: `${numericCols[0].name} 추이`,
        categories: dates,
        series: numericCols.slice(0, 3).map(col => ({
          name: col.name,
          data: (col.values as number[]).slice(0, 12),
        })),
        xAxisLabel: dateCol.name,
        yAxisLabel: numericCols[0].name,
        showLegend: numericCols.length > 1,
      },
    });
  }

  // 숫자 2개 이상 → Bubble chart
  if (numericCols.length >= 2 && categoryCols.length >= 1) {
    const catCol = categoryCols[0];
    const xCol = numericCols[0];
    const yCol = numericCols[1];
    const sizeCol = numericCols[2];

    suggestions.push({
      chartType: 'bubble',
      title: `${xCol.name} vs ${yCol.name}`,
      description: `${catCol.name}별 ${xCol.name}과 ${yCol.name} 관계`,
      config: {
        type: 'bubble',
        title: `${xCol.name} vs ${yCol.name}`,
        categories: catCol.values.slice(0, 10).map(String),
        series: [{
          name: catCol.name,
          data: (xCol.values as number[]).slice(0, 10),
        }, {
          name: yCol.name,
          data: (yCol.values as number[]).slice(0, 10),
        }, ...(sizeCol ? [{
          name: sizeCol.name,
          data: (sizeCol.values as number[]).slice(0, 10),
        }] : [])],
        xAxisLabel: xCol.name,
        yAxisLabel: yCol.name,
        showLegend: true,
      },
    });
  }

  return suggestions;
}

/**
 * 파싱된 데이터를 AI 프롬프트용 텍스트로 변환
 */
export function dataToPromptContext(data: ParsedSpreadsheet): string {
  const lines: string[] = [];
  lines.push(`[데이터: ${data.sheetName}] (${data.rowCount}행 x ${data.columns.length}열)`);
  lines.push(`열: ${data.columns.map(c => `${c.name}(${c.type})`).join(', ')}`);
  lines.push('');
  lines.push('미리보기 (처음 5행):');

  // Header
  lines.push(data.columns.map(c => c.name).join(' | '));
  lines.push(data.columns.map(() => '---').join(' | '));

  // Rows
  for (let i = 0; i < Math.min(5, data.rowCount); i++) {
    lines.push(data.columns.map(c => String(c.values[i] ?? '')).join(' | '));
  }

  return lines.join('\n');
}
