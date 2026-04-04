import { createContext, useContext, useState, useEffect } from 'react';

const EXCHANGE_RATE = 25000; // 1 USD = 25,000 VND (approximate)

const translations = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    expenses: 'Expenses',
    income: 'Income',
    logout: 'Logout',

    // Auth
    signInTitle: 'Sign in to continue',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    createAccount: 'Create Account',
    creatingAccount: 'Creating account...',
    createYourAccount: 'Create your account',
    noAccount: "Don't have an account?",
    register: 'Register',
    haveAccount: 'Already have an account?',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    invalidCredential: 'Invalid email or password',
    emailInUse: 'Email already in use',
    weakPassword: 'Password must be at least 6 characters',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: 'Enter password',
    passwordMinPlaceholder: 'At least 6 characters',
    usernamePlaceholder: 'johndoe',

    // Dashboard
    incomeVsExpenses: 'Income vs Expenses',
    totalBalance: 'Total Balance',
    expenseCategories: 'Expense Categories',
    incomeCategories: 'Income Categories',
    noExpensesYet: 'No expenses yet',
    noIncomeYet: 'No income yet',
    totalExpenses: 'Total Expenses',
    totalIncome: 'Total Income',

    // Transactions
    recent10: 'Recent (10)',
    byDay: 'By Day',
    byMonth: 'By Month',
    noExpensesFound: 'No expenses found',
    noIncomeFound: 'No income records found',
    deleteExpenseConfirm: 'Delete this expense?',
    deleteIncomeConfirm: 'Delete this income record?',
    failedToSave: 'Failed to save',
    failedToDelete: 'Failed to delete',

    // Modal
    edit: 'Edit',
    new: 'New',
    expense: 'Expense',
    title: 'Title',
    category: 'Category',
    amount: 'Amount',
    date: 'Date',
    delete: 'Delete',
    update: 'Update',
    add: 'Add',
    saving: 'Saving...',
    enterTitle: 'Enter title',

    // Categories - Expense
    catFood: 'Food',
    catTransport: 'Transport',
    catShopping: 'Shopping',
    catBills: 'Bills',
    catEntertainment: 'Entertainment',
    catHealth: 'Health',
    catEducation: 'Education',
    catOther: 'Other',

    // Categories - Income
    catSalary: 'Salary',
    catFreelance: 'Freelance',
    catInvestment: 'Investment',
    catGift: 'Gift',
  },
  vi: {
    // Nav
    dashboard: 'Tổng quan',
    expenses: 'Chi tiêu',
    income: 'Thu nhập',
    logout: 'Đăng xuất',

    // Auth
    signInTitle: 'Đăng nhập để tiếp tục',
    signIn: 'Đăng nhập',
    signingIn: 'Đang đăng nhập...',
    createAccount: 'Tạo tài khoản',
    creatingAccount: 'Đang tạo tài khoản...',
    createYourAccount: 'Tạo tài khoản mới',
    noAccount: 'Chưa có tài khoản?',
    register: 'Đăng ký',
    haveAccount: 'Đã có tài khoản?',
    email: 'Email',
    password: 'Mật khẩu',
    username: 'Tên người dùng',
    invalidCredential: 'Email hoặc mật khẩu không đúng',
    emailInUse: 'Email đã được sử dụng',
    weakPassword: 'Mật khẩu phải có ít nhất 6 ký tự',
    emailPlaceholder: 'email@example.com',
    passwordPlaceholder: 'Nhập mật khẩu',
    passwordMinPlaceholder: 'Ít nhất 6 ký tự',
    usernamePlaceholder: 'nguyenvana',

    // Dashboard
    incomeVsExpenses: 'Thu nhập & Chi tiêu',
    totalBalance: 'Số dư',
    expenseCategories: 'Danh mục chi tiêu',
    incomeCategories: 'Danh mục thu nhập',
    noExpensesYet: 'Chưa có chi tiêu',
    noIncomeYet: 'Chưa có thu nhập',
    totalExpenses: 'Tổng chi tiêu',
    totalIncome: 'Tổng thu nhập',

    // Transactions
    recent10: 'Gần đây (10)',
    byDay: 'Theo ngày',
    byMonth: 'Theo tháng',
    noExpensesFound: 'Không tìm thấy chi tiêu',
    noIncomeFound: 'Không tìm thấy thu nhập',
    deleteExpenseConfirm: 'Xoá khoản chi tiêu này?',
    deleteIncomeConfirm: 'Xoá khoản thu nhập này?',
    failedToSave: 'Lưu thất bại',
    failedToDelete: 'Xoá thất bại',

    // Modal
    edit: 'Sửa',
    new: 'Thêm',
    expense: 'Chi tiêu',
    title: 'Tiêu đề',
    category: 'Danh mục',
    amount: 'Số tiền',
    date: 'Ngày',
    delete: 'Xoá',
    update: 'Cập nhật',
    add: 'Thêm',
    saving: 'Đang lưu...',
    enterTitle: 'Nhập tiêu đề',

    // Categories - Expense
    catFood: 'Ăn uống',
    catTransport: 'Di chuyển',
    catShopping: 'Mua sắm',
    catBills: 'Hoá đơn',
    catEntertainment: 'Giải trí',
    catHealth: 'Sức khoẻ',
    catEducation: 'Giáo dục',
    catOther: 'Khác',

    // Categories - Income
    catSalary: 'Lương',
    catFreelance: 'Freelance',
    catInvestment: 'Đầu tư',
    catGift: 'Quà tặng',
  },
};

// Map category keys to internal values (stored in DB always in English)
const EXPENSE_CATEGORIES_MAP = {
  Food: 'catFood',
  Transport: 'catTransport',
  Shopping: 'catShopping',
  Bills: 'catBills',
  Entertainment: 'catEntertainment',
  Health: 'catHealth',
  Education: 'catEducation',
  Other: 'catOther',
};

const INCOME_CATEGORIES_MAP = {
  Salary: 'catSalary',
  Freelance: 'catFreelance',
  Investment: 'catInvestment',
  Gift: 'catGift',
  Other: 'catOther',
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  const currency = lang === 'vi' ? 'VND' : 'USD';
  const currencySymbol = lang === 'vi' ? '₫' : '$';

  // Format: displays amount in current currency.
  // Data is always stored in USD. When lang=vi, multiply by exchange rate for display.
  const formatMoney = (amountUSD) => {
    if (lang === 'vi') {
      const vnd = amountUSD * EXCHANGE_RATE;
      return vnd.toLocaleString('vi-VN') + '₫';
    }
    return '$' + amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Convert displayed input amount to USD for storage
  const toUSD = (inputAmount) => {
    if (lang === 'vi') {
      return inputAmount / EXCHANGE_RATE;
    }
    return inputAmount;
  };

  // Convert USD stored amount to display currency for editing
  const fromUSD = (usdAmount) => {
    if (lang === 'vi') {
      return Math.round(usdAmount * EXCHANGE_RATE);
    }
    return usdAmount;
  };

  const translateCategory = (categoryKey) => {
    const mapKey = EXPENSE_CATEGORIES_MAP[categoryKey] || INCOME_CATEGORIES_MAP[categoryKey];
    return mapKey ? t(mapKey) : categoryKey;
  };

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'vi' : 'en'));

  return (
    <LangContext.Provider value={{
      lang, toggleLang, t, currency, currencySymbol,
      formatMoney, toUSD, fromUSD, translateCategory,
      EXCHANGE_RATE,
    }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
