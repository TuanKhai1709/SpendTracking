import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const PAYOS_CLIENT_ID    = import.meta.env.VITE_PAYOS_CLIENT_ID;
const PAYOS_API_KEY      = import.meta.env.VITE_PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = import.meta.env.VITE_PAYOS_CHECKSUM_KEY;
const POLL_INTERVAL = 3000;

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
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef(null);

  const vi = lang === 'vi';
  const txt = {
    creating: vi ? 'Đang tạo đơn thanh toán...' : 'Creating payment...',
    hint:     vi ? 'Quét mã QR bằng app ngân hàng để thanh toán' : 'Scan QR with your banking app to pay',
    openPage: vi ? 'Mở trang thanh toán' : 'Open payment page',
    waiting:  vi ? 'Đang chờ thanh toán...' : 'Waiting for payment...',
    close:    vi ? 'Đóng' : 'Close',
    success:  vi ? 'Thanh toán thành công!' : 'Payment successful!',
    activated:vi ? `Tài khoản đã kích hoạt gói ${pkg.name}.` : `Account activated: ${pkg.name}.`,
    autoClose:vi ? 'Cửa sổ tự đóng sau 3 giây...' : 'Closing in 3 seconds...',
    errTitle: vi ? 'Có lỗi xảy ra' : 'An error occurred',
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
        const description = `SpendTracker ${pkg.id}`.substring(0, 25);
        const base = `${window.location.origin}${window.location.pathname}`;
        const returnUrl = `${base}#/settings`;
        const cancelUrl = `${base}#/subscription`;

        // Signature: keys in alphabetical order
        const sigData = [
          `amount=${amount}`,
          `cancelUrl=${cancelUrl}`,
          `description=${description}`,
          `orderCode=${code}`,
          `returnUrl=${returnUrl}`,
        ].join('&');
        const signature = await hmacSHA256(PAYOS_CHECKSUM_KEY, sigData);

        const res = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': PAYOS_CLIENT_ID,
            'x-api-key': PAYOS_API_KEY,
          },
          body: JSON.stringify({
            orderCode: code,
            amount,
            description,
            cancelUrl,
            returnUrl,
            signature,
            items: [{ name: pkg.name, quantity: 1, price: amount }],
          }),
        });

        const data = await res.json();
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

  // Poll PayOS API every 3s to detect payment (no backend)
  useEffect(() => {
    if (step !== 'qr' || !orderCode) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`,
          { headers: { 'x-client-id': PAYOS_CLIENT_ID, 'x-api-key': PAYOS_API_KEY } }
        );
        const data = await res.json();

        if (data.data?.status === 'PAID') {
          clearInterval(pollRef.current);

          // Calculate expiry
          let expiryDate = null;
          if (pkg.years) {
            const exp = new Date();
            exp.setFullYear(exp.getFullYear() + pkg.years);
            expiryDate = Timestamp.fromDate(exp);
          }

          // Update subscription directly in Firestore (client-side)
          await updateDoc(doc(db, 'users', user.uid), {
            'subscription.plan': pkg.id,
            'subscription.planName': pkg.name,
            'subscription.expiryDate': expiryDate,
            'subscription.activatedAt': serverTimestamp(),
          });

          await updateDoc(doc(db, 'orders', orderCode), {
            status: 'paid',
            paidAt: serverTimestamp(),
          });

          await refreshSubscription();
          setStep('success');
          setTimeout(() => { onSuccess?.(); onClose(); }, 3000);
        }
      } catch (_) { /* keep polling */ }
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [step, orderCode]);

  const fmtVND = (n) => (n || 0).toLocaleString('vi-VN') + '₫';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card payment-modal" onClick={(e) => e.stopPropagation()}>

        {step === 'loading' && (
          <div className="payment-modal__center">
            <div className="payment-spinner" />
            <p>{txt.creating}</p>
          </div>
        )}

        {step === 'qr' && (
          <>
            <h3 className="modal-title">{pkg.name}</h3>
            <p className="payment-modal__amount">{fmtVND(effectivePrice)}</p>
            <p className="payment-modal__hint">{txt.hint}</p>

            {qrCode ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrCode)}`}
                alt="QR"
                className="payment-qr-img"
              />
            ) : (
              <div className="payment-spinner" style={{ margin: '20px auto' }} />
            )}

            {checkoutUrl && (
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="payment-modal__link">
                {txt.openPage}
              </a>
            )}

            <p className="payment-modal__polling">
              <span className="payment-dot" /> {txt.waiting}
            </p>

            <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={onClose}>
              {txt.close}
            </button>
          </>
        )}

        {step === 'success' && (
          <div className="payment-modal__center">
            <div className="payment-success-icon">✓</div>
            <h3 className="payment-success-title">{txt.success}</h3>
            <p className="payment-modal__hint">{txt.activated}</p>
            <p className="payment-modal__hint" style={{ fontSize: '0.8rem', opacity: 0.6 }}>{txt.autoClose}</p>
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
