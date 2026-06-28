require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const PayOS = require('@payos/node');

// ──────────────────────────────────────────────
// Firebase Admin init
// ──────────────────────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = admin.firestore();

// ──────────────────────────────────────────────
// PayOS init
// ──────────────────────────────────────────────
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

// ──────────────────────────────────────────────
// Express setup
// ──────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ──────────────────────────────────────────────
// Package definitions (mirror what's in Firestore)
// These serve as fallback / bootstrap
// ──────────────────────────────────────────────
const DEFAULT_PACKAGES = {
  '1year': { name: '1 Năm', originalPrice: 75000, years: 1 },
  '2year': { name: '2 Năm', originalPrice: 140000, years: 2 },
  '3year': { name: '3 Năm', originalPrice: 200000, years: 3 },
  'lifetime': { name: 'Vĩnh Viễn', originalPrice: 300000, years: null },
};

// ──────────────────────────────────────────────
// Helper: resolve current price of a package
// ──────────────────────────────────────────────
async function resolvePackagePrice(packageId) {
  const snap = await db.collection('packages').doc(packageId).get();
  if (!snap.exists) throw new Error(`Package ${packageId} not found`);
  const pkg = snap.data();
  const price = pkg.saleEnabled && pkg.salePrice ? pkg.salePrice : pkg.originalPrice;
  return { pkg, price };
}

// ──────────────────────────────────────────────
// POST /api/payment/create
// Body: { uid, email, packageId }
// ──────────────────────────────────────────────
app.post('/api/payment/create', async (req, res) => {
  try {
    const { uid, email, packageId } = req.body;
    if (!uid || !email || !packageId) {
      return res.status(400).json({ error: 'uid, email and packageId are required' });
    }

    // Validate package
    const { pkg, price } = await resolvePackagePrice(packageId);

    // Generate unique orderCode (numeric, max 9 digits for PayOS)
    const orderCode = Math.floor(Date.now() / 1000) % 1000000000;

    // Build PayOS payment link
    const paymentData = {
      orderCode,
      amount: price,
      description: `SpendTracker - ${pkg.name}`,
      items: [{ name: pkg.name, quantity: 1, price }],
      returnUrl: `${process.env.FRONTEND_URL}/#/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/#/payment/cancel`,
    };

    const paymentLink = await payos.createPaymentLink(paymentData);

    // Store order in Firestore
    await db.collection('orders').doc(String(orderCode)).set({
      orderCode: String(orderCode),
      uid,
      email,
      packageId,
      packageName: pkg.name,
      amount: price,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paidAt: null,
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
    });

    res.json({
      orderCode: String(orderCode),
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
    });
  } catch (err) {
    console.error('Create payment error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to create payment' });
  }
});

// ──────────────────────────────────────────────
// POST /api/payment/webhook
// Called by PayOS when payment is confirmed
// ──────────────────────────────────────────────
app.post('/api/payment/webhook', async (req, res) => {
  try {
    const webhookData = payos.verifyPaymentWebhookData(req.body);

    if (
      webhookData.code !== '00' &&
      webhookData.desc !== 'success' &&
      webhookData.data?.code !== '00'
    ) {
      // Not a success event – acknowledge but skip processing
      return res.json({ code: '00', desc: 'acknowledged' });
    }

    const orderCode = String(webhookData.data?.orderCode || webhookData.orderCode);
    if (!orderCode) return res.json({ code: '00', desc: 'no orderCode' });

    const orderRef = db.collection('orders').doc(orderCode);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.json({ code: '00', desc: 'order not found' });

    const order = orderSnap.data();
    if (order.status === 'paid') return res.json({ code: '00', desc: 'already processed' });

    // Verify amount matches
    const { price } = await resolvePackagePrice(order.packageId);
    if (Number(webhookData.data?.amount) !== price) {
      console.warn(`Amount mismatch for order ${orderCode}`);
      return res.json({ code: '00', desc: 'amount mismatch' });
    }

    // Calculate new expiry
    const pkgSnap = await db.collection('packages').doc(order.packageId).get();
    const pkg = pkgSnap.data();
    let expiryDate = null;
    const now = new Date();

    if (pkg.years) {
      expiryDate = new Date(now);
      expiryDate.setFullYear(expiryDate.getFullYear() + pkg.years);
    }

    // Update order
    await orderRef.update({
      status: 'paid',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user subscription
    await db.collection('users').doc(order.uid).update({
      'subscription.plan': order.packageId,
      'subscription.planName': order.packageName,
      'subscription.expiryDate': expiryDate
        ? admin.firestore.Timestamp.fromDate(expiryDate)
        : null,
      'subscription.activatedAt': admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ code: '00', desc: 'success' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    // Always return 200 to PayOS
    res.json({ code: '00', desc: 'error handled' });
  }
});

// ──────────────────────────────────────────────
// GET /api/payment/status/:orderCode
// Polled by frontend every 3 s while QR modal is open
// ──────────────────────────────────────────────
app.get('/api/payment/status/:orderCode', async (req, res) => {
  try {
    const { orderCode } = req.params;
    const snap = await db.collection('orders').doc(orderCode).get();
    if (!snap.exists) return res.status(404).json({ error: 'Order not found' });
    const { status, packageId, packageName, uid } = snap.data();
    res.json({ status, packageId, packageName, uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SpendTracker server running on port ${PORT}`);
});
