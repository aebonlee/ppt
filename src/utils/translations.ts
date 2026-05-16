export const translations: Record<string, Record<string, unknown>> = {
  ko: {
    // ─── 공용 키 (본사이트와 동일) ───
    nav: {
      home: '홈',
      itServices: 'IT서비스',
      education: '교육',
      publishing: '출판',
      portfolio: '포트폴리오',
      community: '커뮤니티',
      consulting: '컨설팅',
      about: '서비스 소개',
      contact: '연락처',
      rnd: '연구개발',
      services: 'IT서비스',
      blog: '블로그'
    },
    footer: {
      tagline: '혁신적인 IT 솔루션으로 비즈니스의 미래를 만듭니다',
      companyInfo: '회사 정보',
      contact: '연락처',
      quickLinks: '바로가기'
    },
    shop: {
      title: '스토어',
      subtitle: '도서, 전자출판, 간행물, 온라인 강좌를 만나보세요',
      all: '전체',
      book: '도서 & 교육교재',
      ebook: '전자출판',
      periodical: '간행물',
      course: '강좌',
      addToCart: '장바구니 담기',
      addedToCart: '담기 완료',
      price: '가격',
      noProducts: '해당 카테고리에 상품이 없습니다.',
      currency: '원'
    },
    cart: {
      title: '장바구니',
      empty: '장바구니가 비어있습니다.',
      total: '합계',
      subtotal: '소계',
      checkout: '결제하기',
      remove: '삭제',
      quantity: '수량',
      continueShopping: '쇼핑 계속하기',
      orderSummary: '주문 요약',
      items: '개 상품'
    },
    checkout: {
      title: '결제',
      orderSummary: '주문 요약',
      paymentMethod: '결제 수단',
      card: '카드 결제',
      bankTransfer: '계좌이체',
      customerInfo: '주문자 정보',
      name: '이름',
      email: '이메일',
      phone: '전화번호',
      namePlaceholder: '홍길동',
      emailPlaceholder: 'email@example.com',
      phonePlaceholder: '010-0000-0000',
      pay: '결제하기',
      processing: '처리 중...',
      totalAmount: '결제 금액',
      agree: '주문 내용을 확인하였으며, 결제에 동의합니다.'
    },
    order: {
      title: '주문 완료',
      success: '결제가 완료되었습니다!',
      orderNumber: '주문번호',
      paymentStatus: '결제 상태',
      paid: '결제 완료',
      pending: '대기 중',
      failed: '실패',
      orderDetails: '주문 내역',
      productName: '상품명',
      unitPrice: '단가',
      quantity: '수량',
      subtotal: '소계',
      totalAmount: '총 결제금액',
      backToShop: '스토어로 돌아가기',
      backToHome: '홈으로'
    },
    auth: {
      login: '로그인',
      logout: '로그아웃',
      signUp: '회원가입',
      loginTitle: '로그인',
      loginSubtitle: '계정에 로그인하세요',
      signUpTitle: '회원가입',
      signUpSubtitle: '새 계정을 만들어보세요',
      email: '이메일',
      emailPlaceholder: 'email@example.com',
      password: '비밀번호',
      passwordPlaceholder: '비밀번호를 입력하세요',
      passwordConfirm: '비밀번호 확인',
      passwordConfirmPlaceholder: '비밀번호를 다시 입력하세요',
      displayName: '이름',
      displayNamePlaceholder: '표시될 이름을 입력하세요',
      or: '또는',
      noAccount: '계정이 없으신가요?',
      hasAccount: '이미 계정이 있으신가요?',
      loginError: '로그인에 실패했습니다.',
      signUpError: '회원가입에 실패했습니다.',
      passwordMismatch: '비밀번호가 일치하지 않습니다.',
      passwordTooShort: '비밀번호는 6자 이상이어야 합니다.',
      loggingIn: '로그인 중...',
      signingUp: '가입 중...',
      signUpSuccess: '회원가입이 완료되었습니다!',
      checkEmail: '이메일을 확인하여 계정을 활성화해주세요.',
      goToLogin: '로그인 페이지로',
      myPage: '마이페이지',
      editProfile: '프로필 수정',
      profileUpdated: '프로필이 수정되었습니다.',
      save: '저장',
      saving: '저장 중...',
      noName: '이름 없음',
      back: '뒤로',
      loginWith: '로그인:',
      emailAccount: '이메일 계정',
      admin: '관리자',
      orderHistory: '주문 이력',
      orderDate: '주문일',
      orderAmount: '결제금액',
      noOrders: '주문 이력이 없습니다.',
      orderLoadError: '주문 이력을 불러오는 데 실패했습니다.',
      retry: '다시 시도',
      soldOut: '품절',
      uploadImage: '이미지 업로드',
      dragOrClick: '이미지를 드래그하거나 클릭하여 업로드',
      uploading: '업로드 중...',
      uploadComplete: '업로드가 완료되었습니다.',
      removeImage: '이미지 삭제',
      forgotPassword: '비밀번호를 잊으셨나요?',
      forgotPasswordTitle: '비밀번호 재설정',
      forgotPasswordSubtitle: '가입하신 이메일을 입력하시면 재설정 링크를 보내드립니다.',
      sendResetLink: '재설정 링크 보내기',
      sending: '전송 중...',
      resetEmailSent: '비밀번호 재설정 이메일이 전송되었습니다.',
      checkEmailForReset: '이메일의 링크를 클릭하여 비밀번호를 재설정하세요.',
      backToLogin: '로그인으로 돌아가기'
    },
    search: {
      placeholder: '검색어를 입력하세요...',
      searching: '검색 중...',
      noResults: '검색 결과가 없습니다.',
      hint: '사이트 내 콘텐츠를 검색합니다.',
      blog: '블로그',
      board: '게시판',
      gallery: '갤러리'
    },
    comments: {
      title: '댓글',
      loading: '댓글 로딩 중...',
      empty: '아직 댓글이 없습니다.',
      placeholder: '댓글을 입력하세요...',
      submit: '댓글 작성',
      submitting: '작성 중...',
      delete: '삭제',
      deleteConfirm: '댓글을 삭제하시겠습니까?',
      loginRequired: '댓글을 작성하려면 로그인이 필요합니다.'
    },
    community: {
      cancel: '취소',
      loading: '로딩 중...'
    },
    common: {
      learnMore: '자세히 보기',
      contactUs: '문의하기'
    },

    // ─── PPT 사이트 전용 키 ───
    site: {
      nav: {
        generate: 'PPT 생성',
        templates: '템플릿 갤러리',
        myPresentations: '내 프레젠테이션',
        pricing: '요금제'
      },
      home: {
        title: 'GenPPT',
        subtitle: 'AI 기반 프레젠테이션 자동 생성 서비스',
        welcome: 'AI로 전문 프레젠테이션을 만들어 보세요',
        description: 'OpenAI GPT-4o / Claude를 활용하여 구조화된 전문 슬라이드를 자동으로 생성합니다.'
      },
      generate: {
        title: 'PPT 생성',
        subtitle: 'AI가 자동으로 전문 프레젠테이션을 만들어 드립니다'
      },
      templates: {
        title: '디자인 템플릿',
        subtitle: '프레젠테이션에 맞는 디자인을 선택하세요',
        useThis: '이 템플릿으로 만들기',
        all: '전체',
        business: '비즈니스',
        creative: '크리에이티브',
        academic: '학술',
        minimal: '미니멀'
      },
      pricing: {
        title: '요금제',
        subtitle: '필요에 맞는 플랜을 선택하세요'
      },
      myPresentations: {
        title: '내 프레젠테이션',
        subtitle: '생성한 프레젠테이션을 관리합니다'
      }
    }
  },

  en: {
    // ─── Shared keys ───
    nav: {
      home: 'Home',
      itServices: 'IT Services',
      education: 'Education',
      publishing: 'Publishing',
      portfolio: 'Portfolio',
      community: 'Community',
      consulting: 'Consulting',
      about: 'About',
      contact: 'Contact',
      rnd: 'R&D',
      services: 'IT Services',
      blog: 'Blog'
    },
    footer: {
      tagline: 'Creating the future of business with innovative IT solutions',
      companyInfo: 'Company Info',
      contact: 'Contact',
      quickLinks: 'Quick Links'
    },
    shop: {
      title: 'Store',
      subtitle: 'Explore books, e-publications, periodicals, and online courses',
      all: 'All',
      book: 'Books & Education Materials',
      ebook: 'E-Publishing',
      periodical: 'Periodicals',
      course: 'Courses',
      addToCart: 'Add to Cart',
      addedToCart: 'Added',
      price: 'Price',
      noProducts: 'No products in this category.',
      currency: 'KRW'
    },
    cart: {
      title: 'Cart',
      empty: 'Your cart is empty.',
      total: 'Total',
      subtotal: 'Subtotal',
      checkout: 'Checkout',
      remove: 'Remove',
      quantity: 'Qty',
      continueShopping: 'Continue Shopping',
      orderSummary: 'Order Summary',
      items: 'items'
    },
    checkout: {
      title: 'Checkout',
      orderSummary: 'Order Summary',
      paymentMethod: 'Payment Method',
      card: 'Credit Card',
      bankTransfer: 'Bank Transfer',
      customerInfo: 'Customer Information',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      namePlaceholder: 'John Doe',
      emailPlaceholder: 'email@example.com',
      phonePlaceholder: '010-0000-0000',
      pay: 'Pay Now',
      processing: 'Processing...',
      totalAmount: 'Total Amount',
      agree: 'I have reviewed my order and agree to proceed with payment.'
    },
    order: {
      title: 'Order Complete',
      success: 'Payment completed successfully!',
      orderNumber: 'Order Number',
      paymentStatus: 'Payment Status',
      paid: 'Paid',
      pending: 'Pending',
      failed: 'Failed',
      orderDetails: 'Order Details',
      productName: 'Product',
      unitPrice: 'Unit Price',
      quantity: 'Qty',
      subtotal: 'Subtotal',
      totalAmount: 'Total Amount',
      backToShop: 'Back to Store',
      backToHome: 'Home'
    },
    auth: {
      login: 'Log In',
      logout: 'Log Out',
      signUp: 'Sign Up',
      loginTitle: 'Log In',
      loginSubtitle: 'Sign in to your account',
      signUpTitle: 'Sign Up',
      signUpSubtitle: 'Create a new account',
      email: 'Email',
      emailPlaceholder: 'email@example.com',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      passwordConfirm: 'Confirm Password',
      passwordConfirmPlaceholder: 'Re-enter your password',
      displayName: 'Name',
      displayNamePlaceholder: 'Enter your display name',
      or: 'or',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      loginError: 'Login failed.',
      signUpError: 'Sign up failed.',
      passwordMismatch: 'Passwords do not match.',
      passwordTooShort: 'Password must be at least 6 characters.',
      loggingIn: 'Logging in...',
      signingUp: 'Signing up...',
      signUpSuccess: 'Sign up successful!',
      checkEmail: 'Please check your email to activate your account.',
      goToLogin: 'Go to Login',
      myPage: 'My Page',
      editProfile: 'Edit Profile',
      profileUpdated: 'Profile updated.',
      save: 'Save',
      saving: 'Saving...',
      noName: 'No name',
      back: 'Back',
      loginWith: 'Login:',
      emailAccount: 'Email account',
      admin: 'Admin',
      orderHistory: 'Order History',
      orderDate: 'Order Date',
      orderAmount: 'Amount',
      noOrders: 'No order history.',
      orderLoadError: 'Failed to load order history.',
      retry: 'Retry',
      soldOut: 'Sold Out',
      uploadImage: 'Upload Image',
      dragOrClick: 'Drag or click to upload an image',
      uploading: 'Uploading...',
      uploadComplete: 'Upload complete.',
      removeImage: 'Remove Image',
      forgotPassword: 'Forgot password?',
      forgotPasswordTitle: 'Reset Password',
      forgotPasswordSubtitle: "Enter your email and we'll send you a reset link.",
      sendResetLink: 'Send Reset Link',
      sending: 'Sending...',
      resetEmailSent: 'Password reset email has been sent.',
      checkEmailForReset: 'Click the link in the email to reset your password.',
      backToLogin: 'Back to Login'
    },
    search: {
      placeholder: 'Search...',
      searching: 'Searching...',
      noResults: 'No results found.',
      hint: 'Search site content.',
      blog: 'Blog',
      board: 'Board',
      gallery: 'Gallery'
    },
    comments: {
      title: 'Comments',
      loading: 'Loading comments...',
      empty: 'No comments yet.',
      placeholder: 'Write a comment...',
      submit: 'Post Comment',
      submitting: 'Posting...',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this comment?',
      loginRequired: 'Please log in to leave a comment.'
    },
    community: {
      cancel: 'Cancel',
      loading: 'Loading...'
    },
    common: {
      learnMore: 'Learn More',
      contactUs: 'Contact Us'
    },

    // ─── PPT site-specific keys ───
    site: {
      nav: {
        generate: 'Generate PPT',
        templates: 'Template Gallery',
        myPresentations: 'My Presentations',
        pricing: 'Pricing'
      },
      home: {
        title: 'GenPPT',
        subtitle: 'AI-powered presentation generation service',
        welcome: 'Create professional presentations with AI',
        description: 'Automatically generate structured professional slides using OpenAI GPT-4o / Claude.'
      },
      generate: {
        title: 'Generate PPT',
        subtitle: 'AI creates professional presentations for you automatically'
      },
      templates: {
        title: 'Design Templates',
        subtitle: 'Choose the right design for your presentation',
        useThis: 'Use this template',
        all: 'All',
        business: 'Business',
        creative: 'Creative',
        academic: 'Academic',
        minimal: 'Minimal'
      },
      pricing: {
        title: 'Pricing',
        subtitle: 'Choose the plan that fits your needs'
      },
      myPresentations: {
        title: 'My Presentations',
        subtitle: 'Manage your generated presentations'
      }
    }
  }
};
