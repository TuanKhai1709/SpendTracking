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
    captchaLabel: 'Security Check',
    captchaError: 'Incorrect answer, please try again',
    captchaHint: 'Failed {n} times. Please solve the math challenge to continue.',
    refreshCaptcha: 'Refresh',
    tooManyAttempts: 'Too many failed attempts. Please wait 60 seconds.',
    accountLocked: 'Account temporarily locked. Try again in {s} seconds.',

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
    byYear: 'By Year',
    allTime: 'All Time',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    noExpensesFound: 'No expenses found',
    noIncomeFound: 'No income records found',
    allCategories: 'All Categories',
    allDays: 'All Days',
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
    catFood: 'Food & Dining',
    catCoffee: 'Coffee',
    catTransport: 'Transportation',
    catShopping: 'Shopping',
    catBills: 'Bills',
    catRecurringExpenses: 'Recurring Expenses',
    catRecurringInvestments: 'Recurring Investments',
    catEntertainment: 'Entertainment',
    catHealth: 'Healthcare',
    catEducation: 'Education',
    catOther: 'Other',

    // Categories - Income
    catSalary: 'Salary',
    catBonus: 'Bonus',
    catTip: 'Tip',
    catInvestment: 'Investment',

    // Settings
    report: 'Report',
    categoryManagement: 'Category Management',
    budgeting: 'Set Budget',
    language: 'Language',
    darkMode: 'Dark Mode',
    changePassword: 'Change Password',
    logoutAction: 'Logout',

    // Report
    // (reuses byMonth, byYear, etc.)

    // Category Management
    enterCategoryName: 'Enter category name',

    // Budget
    budgets: 'Budgets',
    addBudget: 'Add Budget',
    startDate: 'Start Date',
    endDate: 'End Date',
    noBudgets: 'No budgets set',
    cancel: 'Cancel',

    // Change Password
    oldPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    enterOldPassword: 'Enter current password',
    enterNewPassword: 'Enter new password',
    confirmNewPassword: 'Confirm new password',
    passwordMismatch: 'Passwords do not match',
    passwordChanged: 'Password changed successfully',
    wrongPassword: 'Current password is incorrect',

    // Chart range
    last7Days: '7 Days',
    last14Days: '14 Days',
    thisMonth: 'This Month',

    // Recurring
    recurringExpenses: 'Recurring Expenses',
    addRecurring: 'Add Recurring',
    dayOfMonth: 'Day of Month',
    noRecurring: 'No recurring expenses set',
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
    captchaLabel: 'Xác minh bảo mật',
    captchaError: 'Kết quả không đúng, vui lòng thử lại',
    captchaHint: 'Đăng nhập sai {n} lần. Giải phép toán để tiếp tục.',
    refreshCaptcha: 'Làm mới',
    tooManyAttempts: 'Quá nhiều lần thự không thành công. Vui lòng chờ 60 giây.',
    accountLocked: 'Tài khoản tạm khóa. Thử lại sau {s} giây.',

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
    byYear: 'Theo năm',
    allTime: 'Tất cả',
    day: 'Ngày',
    month: 'Tháng',
    year: 'Năm',
    noExpensesFound: 'Không tìm thấy chi tiêu',
    noIncomeFound: 'Không tìm thấy thu nhập',
    allCategories: 'Tất cả danh mục',
    allDays: 'Tất cả',
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
    catCoffee: 'Cà phê',
    catTransport: 'Đi lại',
    catShopping: 'Mua sắm',
    catBills: 'Hóa đơn',
    catRecurringExpenses: 'Chi phí định kì',
    catRecurringInvestments: 'Đầu tư định kì',
    catEntertainment: 'Giải trí',
    catHealth: 'Sức khỏe',
    catEducation: 'Giáo dục',
    catOther: 'Khác',

    // Categories - Income
    catSalary: 'Lương',
    catBonus: 'Thưởng',
    catTip: 'Tiền tip',
    catInvestment: 'Đầu tư',

    // Settings
    report: 'Báo cáo',
    categoryManagement: 'Quản lý danh mục',
    budgeting: 'Đặt hạn mức',
    language: 'Ngôn ngữ',
    darkMode: 'Chế độ tối',
    changePassword: 'Đổi mật khẩu',
    logoutAction: 'Đăng xuất',

    // Category Management
    enterCategoryName: 'Nhập tên danh mục',

    // Budget
    budgets: 'Hạn mức',
    addBudget: 'Thêm hạn mức',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc',
    noBudgets: 'Chưa đặt hạn mức',
    cancel: 'Hủy',

    // Change Password
    oldPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu',
    enterOldPassword: 'Nhập mật khẩu hiện tại',
    enterNewPassword: 'Nhập mật khẩu mới',
    confirmNewPassword: 'Xác nhận mật khẩu mới',
    passwordMismatch: 'Mật khẩu không khớp',
    passwordChanged: 'Đổi mật khẩu thành công',
    wrongPassword: 'Mật khẩu hiện tại không đúng',

    // Chart range
    last7Days: '7 ngày',
    last14Days: '14 ngày',
    thisMonth: 'Tháng này',

    // Recurring
    recurringExpenses: 'Chi phí định kì',
    addRecurring: 'Thêm chi phí định kì',
    dayOfMonth: 'Ngày trong tháng',
    noRecurring: 'Chưa có chi phí định kì',
  },
};

// Map category keys to internal values (stored in DB always in English)
const EXPENSE_CATEGORIES_MAP = {
  'Food & Dining': 'catFood',
  Coffee: 'catCoffee',
  Transportation: 'catTransport',
  Shopping: 'catShopping',
  Bills: 'catBills',
  'Recurring Expenses': 'catRecurringExpenses',
  'Recurring Investments': 'catRecurringInvestments',
  Entertainment: 'catEntertainment',
  Healthcare: 'catHealth',
  Education: 'catEducation',
  Other: 'catOther',
};

const INCOME_CATEGORIES_MAP = {
  Salary: 'catSalary',
  Bonus: 'catBonus',
  Tip: 'catTip',
  Investment: 'catInvestment',
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
