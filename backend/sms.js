const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE;

function canSend() { return accountSid && authToken && fromNumber; }

async function sendSms(to, body) {
  if (!canSend()) return;
  if (!to || !to.startsWith('+')) return;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: fromNumber, To: to, Body: body }).toString(),
    });
    return res.ok;
  } catch { return false; }
}

const SEVERITY_PREFIX = {
  EMERGENCY: '🚨 EMERGENCY ALERT',
  WATCH:     '⚠️  WATCH ALERT',
  WARNING:   '⚠️  WARNING',
  INFO:      'ℹ️  ADVISORY',
};

async function broadcastAlert(alert, users) {
  if (!canSend()) return 0;
  const prefix = SEVERITY_PREFIX[alert.severity] || 'ALERT';
  const msg = `${prefix} - PrepareJM\n${alert.title}\n${alert.message}\n\nShelters: preparejm.com/shelters`;
  let sent = 0;
  for (const u of users) {
    if (u.phone) {
      const ok = await sendSms(u.phone, msg);
      if (ok) sent++;
    }
  }
  return sent;
}

async function notifyCheckinReceived(contactPhone, userName, status) {
  if (!canSend() || !contactPhone) return;
  const icon = status === 'SAFE' ? '✅' : status === 'NEED_HELP' ? '🆘' : '⚠️';
  await sendSms(contactPhone,
    `${icon} PrepareJM: ${userName} has checked in as ${status}. Reply to this number or call them directly.`
  );
}

module.exports = { sendSms, broadcastAlert, notifyCheckinReceived };
