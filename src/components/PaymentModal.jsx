import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const PAYOS_CLIENT_ID = import.meta.env.VITE_PAYOS_CLIENT_ID?.trim();
const PAYOS_API_KEY = import.meta.env.VITE_PAYOS_API_KEY?.trim();
const PAYOS_CHECKSUM_KEY = import.meta.env.VITE_PAYOS_CHECKSUM_KEY?.trim();
const POLL_INTERVAL = 3000;
const PENDING_KEY = 'payos_pending_order';

const EN_PKG_NAMES = {
  '1year': '1 Year',
  '2year': '2 Years',
  '3year': '3 Years',
  'lifetime': 'Lifetime',
};

// In dev, use Vite proxy (/payos) to avoid CORS. In production, call PayOS directly.
const PAYOS_BASE = import.meta.env.DEV
  ? '/payos'
  : 'https://api-merchant.payos.vn';

// HMAC-SHA256 via Web Crypto API – no backend needed
async function hmacSHA256(key, data) {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', keyMat, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PaymentModal({ pkg, effectivePrice, onClose, onSuccess }) {
  const { user, refreshSubscription } = useAuth();
  const { lang } = useLang();
  const [step, setStep] = useState('loading'); // loading | qr | success | error
  const [orderCode, setOrderCode] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [expiryInfo, setExpiryInfo] = useState('');
  const [bankInfo, setBankInfo] = useState(null);
  const [pollError, setPollError] = useState('');
  const [checking, setChecking] = useState(false);
  const pollRef = useRef(null);

  const vi = lang === 'vi';
  const displayName = vi ? pkg.name : (EN_PKG_NAMES[pkg.id] || pkg.name);

  const txt = {
    creating: vi ? 'Đang tạo đơn thanh toán...' : 'Creating payment...',
    hint: vi ? 'Quét mã QR bằng app ngân hàng để thanh toán' : 'Scan QR with your banking app to pay',
    openPage: vi ? 'Mở trang thanh toán' : 'Open payment page',
    waiting: vi ? 'Đang chờ thanh toán...' : 'Waiting for payment...',
    close: vi ? 'Đóng' : 'Close',
    closeWarning: vi
      ? 'Bạn đã chuyển khoản chưa? Nếu đóng bây giờ và chưa chuyển, đơn sẽ bị hủy. Tiếp tục đóng?'
      : 'Have you paid yet? Closing now before payment is detected may require reopening. Close anyway?',
    success: vi ? 'Thanh toán thành công! 🎉' : 'Payment Successful! 🎉',
    activated: vi ? `Tài khoản đã kích hoạt gói ${displayName}.` : `Account upgraded: ${displayName}.`,
    autoClose: vi ? 'Cửa sổ tự đóng sau 3 giây...' : 'Closing in 3 seconds...',
    errTitle: vi ? 'Có lỗi xảy ra' : 'An error occurred',
  };

  const handleClose = () => {
    if (step === 'qr') {
      if (!window.confirm(txt.closeWarning)) return;
    }
    // Clear pending order from localStorage when user consciously closes
    localStorage.removeItem(PENDING_KEY);
    onClose();
  };

  // Create PayOS payment directly from browser (no backend server)
  useEffect(() => {
    let cancelled = false;

    async function create() {
      try {
        if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
          throw new Error(
            vi
              ? 'Chưa cấu hình PayOS. Thêm VITE_PAYOS_* vào GitHub Secrets.'
              : 'PayOS not configured. Add VITE_PAYOS_* to GitHub Secrets.'
          );
        }

        const code = Math.floor(Date.now() / 1000) % 1_000_000_000;
        const amount = Math.round(effectivePrice);
        // Max 9 ASCII chars, no spaces (PayOS non-linked bank limit)
        const description = ('ST' + pkg.id).toUpperCase().substring(0, 9);
        const base = window.location.origin + window.location.pathname;
        const returnUrl = base;
        const cancelUrl = base;

        // Signature: keys strictly alphabetical (PayOS spec)
        const sigData = [
          `amount=${amount}`,
          `cancelUrl=${cancelUrl}`,
          `description=${description}`,
          `orderCode=${code}`,
          `returnUrl=${returnUrl}`,
        ].join('&');

        // Debug info in console — open DevTools (F12 > Console) to inspect
        console.log('[PayOS] sigData:', sigData);
        console.log('[PayOS] checksumKey length:', PAYOS_CHECKSUM_KEY.length,
          '| starts with:', PAYOS_CHECKSUM_KEY.substring(0, 8));

        const signature = await hmacSHA256(PAYOS_CHECKSUM_KEY, sigData);
        console.log('[PayOS] computed signature:', signature);

        const reqBody = {
          orderCode: code,
          amount,
          description,
          cancelUrl,
          returnUrl,
          signature,
          items: [{ name: pkg.name, quantity: 1, price: amount }],
        };
        console.log('[PayOS] request body:', JSON.stringify(reqBody));

        const res = await fetch(`${PAYOS_BASE}/v2/payment-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': PAYOS_CLIENT_ID,
            'x-api-key': PAYOS_API_KEY,
          },
          body: JSON.stringify(reqBody),
        });

        const data = await res.json();
        console.log('[PayOS] response:', JSON.stringify(data));
        if (data.code !== '00') throw new Error(data.desc || (vi ? 'Tạo đơn thất bại' : 'Failed to create payment'));
        if (cancelled) return;

        // Store order in Firestore (client-side, no backend needed)
        await setDoc(doc(db, 'orders', String(code)), {
          orderCode: String(code),
          uid: user.uid,
          email: user.email,
          packageId: pkg.id,
          packageName: pkg.name,
          amount,
          status: 'pending',
          createdAt: serverTimestamp(),
        });

        setOrderCode(String(code));
        setQrCode(data.data?.qrCode);
        setCheckoutUrl(data.data?.checkoutUrl);
        setBankInfo({
          accountNumber: data.data?.accountNumber || '',
          accountName: data.data?.accountName || '',
          description,
          amount,
        });
        // Save to localStorage so we can recover if modal is closed before detection
        localStorage.setItem(PENDING_KEY, JSON.stringify({
          orderCode: String(code),
          pkgId: pkg.id,
          pkgName: pkg.name,
          pkgYears: pkg.years ?? null,
          amount,
        }));
        setStep('qr');
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err.message);
        setStep('error');
      }
    }

    create();
    return () => { cancelled = true; };
  }, []);

  // Shared logic: check PayOS status and activate subscription if PAID
  const confirmIfPaid = async (code) => {
    const res = await fetch(
      `${PAYOS_BASE}/v2/payment-requests/${code}`,
      { headers: { 'x-client-id': PAYOS_CLIENT_ID, 'x-api-key': PAYOS_API_KEY } }
    );
    const data = await res.json();
    console.log('[PayOS] poll status:', data.data?.status);

    if (data.data?.status === 'PAID') {
      clearInterval(pollRef.current);

      let expiryDate = null;
      let expiryInfoText = '';
      if (pkg.years) {
        const exp = new Date();
        exp.setFullYear(exp.getFullYear() + pkg.years);
        expiryDate = Timestamp.fromDate(exp);
        const totalDays = pkg.years * 365;
        const expStr = exp.toLocaleDateString(vi ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
        expiryInfoText = vi
          ? `Gói ${displayName} — ${totalDays} ngày sử dụng.\nHạn dùng đến: ${expStr}`
          : `Plan: ${displayName} — ${totalDays} days.\nExpires: ${expStr}`;
      } else {
        expiryInfoText = vi
          ? `Gói ${displayName} — Sử dụng vĩnh viễn. Không có ngày hết hạn.`
          : `Plan: ${displayName} — Lifetime access. No expiry date.`;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        'subscription.plan': pkg.id,
        'subscription.planName': pkg.name,
        'subscription.expiryDate': expiryDate,
        'subscription.activatedAt': serverTimestamp(),
      });
      await updateDoc(doc(db, 'orders', code), { status: 'paid', paidAt: serverTimestamp() });
      await refreshSubscription();
      localStorage.removeItem(PENDING_KEY);
      setExpiryInfo(expiryInfoText);
      setStep('success');
      return true;
    }
    return false;
  };

  // Poll PayOS every 3s
  useEffect(() => {
    if (step !== 'qr' || !orderCode) return;

    pollRef.current = setInterval(async () => {
      try {
        await confirmIfPaid(orderCode);
        setPollError('');
      } catch (err) {
        console.warn('[PayOS] poll error:', err.message);
        setPollError(err.message);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [step, orderCode]);

  // Manual check triggered by button
  const handleManualCheck = async () => {
    if (!orderCode || checking) return;
    setChecking(true);
    setPollError('');
    try {
      const paid = await confirmIfPaid(orderCode);
      if (!paid) {
        setPollError(vi
          ? 'Chưa nhận được xác nhận thanh toán. Vui lòng đợi thêm.'
          : 'Payment not confirmed yet. Please wait a moment.');
      }
    } catch (err) {
      setPollError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const fmtVND = (n) => (n || 0).toLocaleString('vi-VN') + '₫';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card payment-modal" onClick={(e) => e.stopPropagation()}>

        {step === 'loading' && (
          <div className="payment-modal__center">
            <div className="payment-spinner" />
            <p>{txt.creating}</p>
          </div>
        )}

        {step === 'qr' && (
          <>
            <h3 className="modal-title">{displayName}</h3>
            <p className="payment-modal__amount">{fmtVND(effectivePrice)}</p>
            <p className="payment-modal__hint">{txt.hint}</p>

            {qrCode ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                alt="QR"
                className="payment-qr-img"
              />
            ) : (
              <div className="payment-spinner" style={{ margin: '20px auto' }} />
            )}

            {/* Bank account details */}
            {bankInfo && (
              <div className="payment-bank-info">
                <div className="payment-bank-row">
                  <span className="payment-bank-label">{vi ? 'Ngân hàng' : 'Bank'}</span>
                  <span className="payment-bank-value">BIDV</span>
                </div>
                <div className="payment-bank-row">
                  <span className="payment-bank-label">{vi ? 'Chủ TK' : 'Account name'}</span>
                  <span className="payment-bank-value">{bankInfo.accountName}</span>
                </div>
                <div className="payment-bank-row">
                  <span className="payment-bank-label">{vi ? 'Số TK' : 'Account no.'}</span>
                  <span className="payment-bank-value payment-bank-copy" onClick={() => navigator.clipboard?.writeText(bankInfo.accountNumber)}>
                    {bankInfo.accountNumber} 📋
                  </span>
                </div>
                <div className="payment-bank-row">
                  <span className="payment-bank-label">{vi ? 'Số tiền' : 'Amount'}</span>
                  <span className="payment-bank-value payment-bank-copy" onClick={() => navigator.clipboard?.writeText(String(bankInfo.amount))}>
                    {fmtVND(bankInfo.amount)} 📋
                  </span>
                </div>
                <div className="payment-bank-row">
                  <span className="payment-bank-label">{vi ? 'Nội dung' : 'Description'}</span>
                  <span className="payment-bank-value payment-bank-copy" onClick={() => navigator.clipboard?.writeText(bankInfo.description)}>
                    {bankInfo.description} 📋
                  </span>
                </div>
              </div>
            )}

            <p className="payment-modal__polling">
              <span className="payment-dot" /> {txt.waiting}
            </p>

            {pollError && (
              <p style={{ fontSize: '0.75rem', color: '#FC5C65', textAlign: 'center', margin: '4px 0' }}>
                {pollError}
              </p>
            )}

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 8, marginBottom: 6 }}
              onClick={handleManualCheck}
              disabled={checking}
            >
              {checking
                ? (vi ? 'Đang kiểm tra...' : 'Checking...')
                : (vi ? 'Đã chuyển khoản → Kiểm tra ngay' : 'Transferred → Check now')}
            </button>

            <button className="btn-secondary" style={{ width: '100%' }} onClick={handleClose}>
              {txt.close}
            </button>
          </>
        )}

        {step === 'success' && (
          <div className="payment-modal__center">
            <div className="payment-success-icon">✓</div>
            <h3 className="payment-success-title">{txt.success}</h3>
            {expiryInfo.split('\n').map((line, i) => (
              <p key={i} className="payment-modal__hint" style={{ margin: '2px 0' }}>{line}</p>
            ))}
            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 20 }}
              onClick={() => { onSuccess?.(); onClose(); }}
            >
              OK
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="payment-modal__center">
            <div className="payment-error-icon">✕</div>
            <h3>{txt.errTitle}</h3>
            <p className="payment-modal__hint">{errorMsg}</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={onClose}>{txt.close}</button>
          </div>
        )}
      </div>
    </div>
  );
}
