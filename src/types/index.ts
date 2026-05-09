/* ───────────────────────────────────────────
 *  Domain types for templete-ref
 * ─────────────────────────────────────────── */

// ─── Product ───
export interface Product {
  id: number;
  slug: string;
  category: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  imageUrl: string;
  isSoldOut: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRow {
  id: number;
  slug: string;
  category: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  price: number;
  image_url: string;
  is_sold_out: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  slug?: string;
  category?: string;
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  price?: number;
  imageUrl?: string;
  isSoldOut?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

// ─── Cart ───
export interface CartItem extends Product {
  quantity: number;
}

// ─── Order ───
export interface OrderItemInput {
  product_title: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderData {
  order_number: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  total_amount: number;
  payment_method: string;
  user_id?: string | null;
  items?: OrderItemInput[];
}

export interface Order {
  id: string;
  order_number: string;
  user_email: string;
  user_name: string;
  user_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  user_id?: string | null;
  portone_payment_id?: string;
  created_at: string;
  paid_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  items?: OrderItemInput[];
  order_items?: OrderItemInput[];
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

// ─── User / Auth ───
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  display_name: string;
  avatar_url: string;
  phone: string;
  provider: string;
  role: string;
  signup_domain: string;
  visited_sites: string[];
  last_sign_in_at: string;
  updated_at: string;
}

export interface AccountBlock {
  status: string;
  reason: string;
  suspended_until: string | null;
}

// ─── Comment ───
export interface Comment {
  id: number;
  postId: number;
  postType: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CommentInput {
  postId: number;
  postType: string;
  authorId: string;
  authorName: string;
  content: string;
}

// ─── Search ───
export interface SearchResultItem {
  id: number;
  title: string;
  titleEn?: string;
  excerpt?: string;
  excerptEn?: string;
  category?: string;
  categoryEn?: string;
  description?: string;
  descriptionEn?: string;
  author?: string;
  date: string;
}

export interface SearchResults {
  blog: SearchResultItem[];
  board: SearchResultItem[];
  gallery: SearchResultItem[];
}

// ─── Site Config ───
export interface BrandPart {
  text: string;
  className: string;
}

export interface MenuItem {
  path: string;
  labelKey: string;
  activePath?: string;
  dropdown?: SubMenuItem[];
}

export interface SubMenuItem {
  path: string;
  labelKey: string;
}

export interface FamilySite {
  name: string;
  url: string;
}

export interface ColorOption {
  name: ColorTheme;
  color: string;
}

export interface CompanyInfo {
  name: string;
  ceo: string;
  bizNumber: string;
  salesNumber?: string;
  publisherNumber?: string;
  address: string;
  email: string;
  phone: string;
  kakao?: string;
  businessHours?: string;
}

export interface SiteFeatures {
  shop: boolean;
  community: boolean;
  search: boolean;
  auth: boolean;
  license: boolean;
}

export interface SiteConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  url: string;
  dbPrefix: string;
  parentSite: { name: string; url: string };
  brand: { parts: BrandPart[] };
  themeColor: string;
  company: CompanyInfo;
  features: SiteFeatures;
  colors: ColorOption[];
  menuItems: MenuItem[];
  footerLinks: { path: string; labelKey: string }[];
  familySites: FamilySite[];
}

// ─── Payment (PortOne V1) ───
export interface PaymentRequest {
  orderId: string;
  orderName: string;
  totalAmount: number;
  payMethod: 'CARD' | 'TRANSFER';
  customer: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface PaymentSuccess {
  paymentId: string;
  txId: string;
}

export interface PaymentError {
  code: string;
  message: string;
}

export type PaymentResult = PaymentSuccess | PaymentError;

// ─── Toast ───
export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ─── Theme ───
export type ThemeMode = 'auto' | 'light' | 'dark';
export type ColorTheme = 'blue' | 'red' | 'green' | 'purple' | 'orange';

// ─── Language ───
export type Language = 'ko' | 'en';

// === PPT 생성 관련 타입 ===
export type SlideType = 'cover' | 'toc' | 'section-cover' | 'content' | 'diagram' | 'workbook' | 'summary' | 'back-cover';
export type SlideOrientation = 'portrait' | 'landscape';

// ─── Design Template ───
export type DesignTemplateId = 'modern-corporate' | 'minimal-clean' | 'bold-gradient'
  | 'classic-formal' | 'tech-startup' | 'magazine' | 'education' | 'elegant';

export type TemplateCategory = 'business' | 'creative' | 'academic' | 'minimal';

export interface TemplateLayout {
  sidebar: { enabled: boolean; width: number; accentHeight: number };
  marginX: number;
  contentMarginX: number;
  sectionSpacing: number;
  sectionStartY: number;
  chapterBox: { enabled: boolean; shape: 'square' | 'circle' | 'rounded'; size: number };
  footer: { lineColor: string; pageNumberFormat: 'pad3' | 'pad2' | 'plain' | 'dash' };
  headerY: number;
  headerLineY: number;
}

export interface TemplateTypography {
  fontFamily: string;
  coverHeadline: { fontSize: number; fontWeight: number; letterSpacing: string; lineHeight: number };
  coverSubtitle: { fontSize: number; fontWeight: number; letterSpacing: string };
  bodyText: { fontSize: number; fontWeight: number; lineHeight: number; textAlign: 'left' | 'justify' };
  sectionTitle: { fontSize: number; fontWeight: number };
  chapterLabel: { fontSize: number; fontWeight: number; letterSpacing: string };
  chapterTitle: { fontSize: number; fontWeight: number; lineHeight: number };
  labelText: { fontSize: number; fontWeight: number; letterSpacing: string };
  tocTitle: { fontSize: number; fontWeight: number; lineHeight: number };
  summaryHeadline: { fontSize: number; fontWeight: number; letterSpacing: string; lineHeight: number };
}

export interface TemplateDecorations {
  cover: {
    topPanelRatio: number;
    gridOverlay: boolean;
    cornerAccents: boolean;
    cornerSize: number;
    categoryChip: { shape: 'square' | 'pill' | 'rounded' };
  };
  bulletStyle: 'diamond' | 'circle' | 'dash' | 'none';
  calloutStyle: { borderRadius: number; borderLeftWidth: number };
  dividerStyle: 'solid' | 'dashed' | 'double' | 'none';
  sectionCover: { partNumberFontSize: number; accentBarWidth: number; accentBarHeight: number };
  summary: { dotPattern: boolean; cornerMarkSize: number };
  workbook: { stepBlockSize: number; stepBlockShape: 'square' | 'rounded'; checkboxShape: 'square' | 'circle'; checkboxSize: number; checklistBorder: 'dashed' | 'solid' | 'none' };
  diagram: { cardBorderRadius: number; cardBorder: boolean; headerHeight: number };
  toc: { accentBarWidth: number; accentBarHeight: number; sectionSpacing: number };
  codeBlock: { background: string; borderLeftWidth: number };
}

export interface DesignTemplate {
  id: DesignTemplateId;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  category: TemplateCategory;
  layout: TemplateLayout;
  typography: TemplateTypography;
  decorations: TemplateDecorations;
}

export interface ColorScheme {
  id: string;
  name: string;
  nameKo: string;
  primary: string;
  accent: string;
  accent2: string;
  background: string;
  mute: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface CodeBlock {
  label: string;
  title: string;
  content: string;
}

export interface KeyPoint {
  type: 'key-point' | 'caution' | 'tip';
  title?: string;
  content: string;
}

export interface TOCItem {
  number: string;
  title: string;
  page?: string;
}

export interface ChapterItem {
  number: number;
  title: string;
  description: string;
}

export interface WorkbookStep {
  number: number;
  title: string;
  description: string;
}

export interface ChecklistItem {
  label: string;
  options: string[];
}

export interface SummaryItem {
  partLabel: string;
  title: string;
  description: string;
}

export interface DiagramCard {
  title: string;
  headerColor: string;
  items: { label: string; value: string }[];
  difficulty?: string;
}

export interface SlideData {
  type: SlideType;
  title?: string;
  subtitle?: string;
  partNumber?: number;
  partTitle?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  pageNumber?: number;
  headline?: string;
  categoryChip?: string;
  modules?: { unitNumber: string; title: string }[];
  partIndex?: { partNumber: string; title: string }[];
  publisherInfo?: { left: string; right: string };
  tocSections?: { partNumber: string; partTitle: string; items: TOCItem[] }[];
  howToUse?: string;
  chapters?: ChapterItem[];
  sections?: {
    subTitle?: string;
    keyTopic?: string;
    body?: string;
    table?: TableData;
    codeBlock?: CodeBlock;
    keyPoint?: KeyPoint;
    diagramCaption?: string;
    diagramContent?: string;
  }[];
  footnote?: string;
  diagramCards?: DiagramCard[];
  listItems?: { label: string; description: string }[];
  stepNumber?: number;
  stepLabel?: string;
  learningObjective?: string;
  scenario?: string;
  steps?: WorkbookStep[];
  checklist?: ChecklistItem[];
  caution?: string;
  workbookCode?: CodeBlock;
  summaryHeadline?: string;
  summaryItems?: SummaryItem[];
  fromHere?: string;
}

export interface PresentationData {
  id?: string;
  title: string;
  description?: string;
  author?: string;
  orientation: SlideOrientation;
  colorScheme: ColorScheme;
  designTemplateId?: DesignTemplateId;
  canvas: { width: number; height: number };
  slides: SlideData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateRequest {
  topic: string;
  slideCount: number;
  orientation: SlideOrientation;
  colorSchemeId: string;
  designTemplateId?: DesignTemplateId;
  language: 'ko' | 'en';
  aiEngine: 'openai' | 'claude';
  apiKey?: string;
  additionalInstructions?: string;
  referenceContent?: string;
}

export interface GenerationProgress {
  status: 'idle' | 'generating' | 'parsing' | 'rendering' | 'complete' | 'error';
  progress: number;
  message: string;
  currentSlide?: number;
  totalSlides?: number;
}

export type SubscriptionPlan = 'free' | 'basic' | 'pro';

export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlan;
  monthlyLimit: number;
  usedCount: number;
  maxSlides: number;
  canUsePlatformKey: boolean;
  canExportPptx: boolean;
  expiresAt?: string;
}
