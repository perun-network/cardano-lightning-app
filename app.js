// Cardano Lightning Bridge — Frontend
//
// Talks to the relay REST API. The relay is centralized operator infrastructure;
// users interact only through this frontend.

const RELAY_URL = window.RELAY_URL || 'http://localhost:3000';
const EXPLORER_BASE = window.EXPLORER_BASE || 'https://preprod.cardanoscan.io/transaction/';
const POLL_INTERVAL_MS = 5000;

// ─── Tab switching ──────────────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ─── Pool info ──────────────────────────────────────────────────────────────

async function refreshPoolInfo() {
  try {
    const resp = await fetch(`${RELAY_URL}/pool/info`);
    if (!resp.ok) throw new Error('pool query failed');
    const data = await resp.json();
    document.getElementById('pool-info').innerHTML =
      `<span>Pool: ${fmt(data.total_liquidity)} cBTC total | ${fmt(data.available)} available | ${data.active_invoices} active invoices</span>`;
  } catch (e) {
    document.getElementById('pool-info').innerHTML =
      `<span>Pool: offline</span>`;
  }
}

function fmt(n) {
  return Number(n).toLocaleString();
}

refreshPoolInfo();
setInterval(refreshPoolInfo, 30000);

// ─── Onramp ─────────────────────────────────────────────────────────────────

document.getElementById('onramp-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = parseInt(document.getElementById('onramp-amount').value);
  const address = document.getElementById('onramp-address').value.trim();

  try {
    const resp = await fetch(`${RELAY_URL}/swap/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_cbtc: amount, cardano_address: address }),
    });
    if (!resp.ok) {
      const err = await resp.json();
      alert('Onramp failed: ' + (err.error || 'unknown error'));
      return;
    }
    const data = await resp.json();
    showOnrampResult(data);
    pollOnrampStatus(data.payment_hash);
  } catch (e) {
    alert('Request failed: ' + e.message);
  }
});

function showOnrampResult(data) {
  const section = document.getElementById('onramp-result');
  section.classList.remove('hidden');
  document.getElementById('onramp-bolt11').value = data.bolt11;
  setStatus('onramp-status', 'Pending', 'pending');

  // QR code (if library loaded)
  const qrDiv = document.getElementById('onramp-qr');
  qrDiv.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrDiv, { text: data.bolt11, width: 200, height: 200 });
  }
}

async function pollOnrampStatus(paymentHash) {
  const poll = async () => {
    try {
      const resp = await fetch(`${RELAY_URL}/swap/status/${paymentHash}`);
      if (!resp.ok) return;
      const data = await resp.json();
      const status = data.status.toLowerCase();
      setStatus('onramp-status', data.status, status);

      if (status === 'completed') {
        if (data.cardano_tx_hash) {
          const txDiv = document.getElementById('onramp-tx');
          txDiv.classList.remove('hidden');
          const link = txDiv.querySelector('a');
          link.href = EXPLORER_BASE + data.cardano_tx_hash;
          link.textContent = data.cardano_tx_hash;
        }
        refreshPoolInfo();
        return; // stop polling
      }
      if (status === 'expired' || status === 'failed') return;
    } catch (e) { /* retry */ }
    setTimeout(poll, POLL_INTERVAL_MS);
  };
  setTimeout(poll, POLL_INTERVAL_MS);
}

// ─── Offramp ────────────────────────────────────────────────────────────────

let currentOfframpId = null;

document.getElementById('offramp-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const bolt11 = document.getElementById('offramp-bolt11').value.trim();
  const amount = parseInt(document.getElementById('offramp-amount').value);
  const address = document.getElementById('offramp-address').value.trim();

  try {
    const resp = await fetch(`${RELAY_URL}/offramp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bolt11, amount_cbtc: amount, cardano_address: address }),
    });
    if (!resp.ok) {
      const err = await resp.json();
      alert('Offramp failed: ' + (err.error || 'unknown error'));
      return;
    }
    const data = await resp.json();
    currentOfframpId = data.offramp_id;
    showOfframpResult(data, amount);
  } catch (e) {
    alert('Request failed: ' + e.message);
  }
});

function showOfframpResult(data, amount) {
  const section = document.getElementById('offramp-result');
  section.classList.remove('hidden');
  document.getElementById('offramp-send-amount').textContent = fmt(amount);
  document.getElementById('offramp-operator-addr').textContent = data.operator_address;
  setStatus('offramp-status', data.status, data.status.toLowerCase());
}

async function submitOfframpDeposit() {
  const txHash = document.getElementById('offramp-cbtc-tx').value.trim();
  if (!txHash || !currentOfframpId) return;

  try {
    const resp = await fetch(`${RELAY_URL}/offramp/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offramp_id: currentOfframpId, cbtc_tx_hash: txHash }),
    });
    if (!resp.ok) {
      const err = await resp.json();
      alert('Deposit notification failed: ' + (err.error || 'unknown error'));
      return;
    }
    const data = await resp.json();
    setStatus('offramp-status', data.status, data.status.toLowerCase());
    document.getElementById('offramp-deposit-btn').disabled = true;
    pollOfframpStatus(currentOfframpId);
  } catch (e) {
    alert('Request failed: ' + e.message);
  }
}

async function pollOfframpStatus(offrampId) {
  const poll = async () => {
    try {
      const resp = await fetch(`${RELAY_URL}/offramp/status/${offrampId}`);
      if (!resp.ok) return;
      const data = await resp.json();
      const status = data.status.toLowerCase();
      setStatus('offramp-status', data.status, status);

      if (status === 'completed') {
        if (data.create_offramp_tx_hash) {
          const txDiv = document.getElementById('offramp-tx');
          txDiv.classList.remove('hidden');
          const link = txDiv.querySelector('a');
          link.href = EXPLORER_BASE + data.create_offramp_tx_hash;
          link.textContent = data.create_offramp_tx_hash;
        }
        refreshPoolInfo();
        return;
      }
      if (status === 'failed') return;
    } catch (e) { /* retry */ }
    setTimeout(poll, POLL_INTERVAL_MS);
  };
  setTimeout(poll, POLL_INTERVAL_MS);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function setStatus(elementId, text, cssClass) {
  const el = document.getElementById(elementId);
  const span = el.querySelector('span');
  span.textContent = text;
  span.className = cssClass;
}
