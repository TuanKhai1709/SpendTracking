import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';
const POLL_INTERVAL = 3000;

export default function PaymentModal({ pkg, effectivePrice, onClose, onSuccess }) {
  const { user, refreshSubscription } = useAuth();
  const [step, setStep] = useState('loading'); // loading | qr | success | error
  const [orderCode, setOrderCode] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef(null);

  // Create payment when modal opens
  useEffect(() => {
    let cancelled = false;

    async function create() {
      try {
        const res = await fetch(`${SERVER_URL}/api/payment/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, email: user.email, packageId: pkg.id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Tạo đơn thất bại');
        if (cancelled) return;
        setOrderCode(data.orderCode);
        setQrCode(data.qrCode);
        setCheckoutUrl(data.checkoutUrl);
        setStep('qr');
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err.message);
        setStep('error');
      }
    }

    create();
    return () => { cancelled = true; };
  }, [pkg.id, user.uid, user.email]);

  // Poll payment status
  useEffect(() => {
    if (step !== 'qr' || !orderCode) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/payment/status/${orderCode}`);
        const data = await res.json();
        if (data.status === 'paid') {
          clearInterval(pollRef.current);
          await refreshSubscription();
          setStep('success');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 3000);
        }
      } catch (_) {
        // silent – keep polling
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [step, orderCode, refreshSubscription, onSuccess, onClose]);

  function formatVND(n) {
    return (n || 0).toLocaleString('vi-VN') + '₫';
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Loading */}
        {step === 'loading' && (
          <div className="payment-modal__center">
            <div className="payment-spinner" />
            <p>Đang tạo đơn thanh toán...</p>
          </div>
        )}

        {/* QR */}
        {step === 'qr' && (
          <>
            <h3 className="modal-title">Thanh toán – {pkg.name}</h3>
            <p className="payment-modal__amount">{formatVND(effectivePrice)}</p>
            <p className="payment-modal__hint">
              Quét mã QR bằng app ngân hàng hoặc ví điện tử để thanh toán
            </p>

            {qrCode ? (
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
                alt="QR thanh toán"
                className="payment-qr-img"
              />
            ) : (
              <div className="payment-spinner" />
            )}

            {checkoutUrl && (
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="payment-modal__link">
                Mở trang thanh toán
              </a>
            )}

            <p className="payment-modal__polling">
              <span className="payment-dot" /> Đang chờ thanh toán...
            </p>

            <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={onClose}>
              Đóng
            </button>
          </>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="payment-modal__center">
            <div className="payment-success-icon">✓</div>
            <h3 className="payment-success-title">Thanh toán thành công!</h3>
            <p className="payment-modal__hint">Tài khoản của bạn đã được kích hoạt gói <strong>{pkg.name}</strong>.</p>
            <p className="payment-modal__hint" style={{ fontSize: '0.8rem', opacity: 0.7 }}>Cửa sổ sẽ tự đóng sau 3 giây...</p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div className="payment-modal__center">
            <div className="payment-error-icon">✕</div>
            <h3>Có lỗi xảy ra</h3>
            <p className="payment-modal__hint">{errorMsg}</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={onClose}>Đóng</button>
          </div>
        )}
      </div>
    </div>
  );
}
