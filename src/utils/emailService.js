// EmailJS Configuration
// Custom settings configured by the user for MedhaSetu mail delivery.

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_abqpuyr',
  TEMPLATE_ID: 'template_n1sambv',
  PUBLIC_KEY: 'ufaoRSsuAkisC-81g',
};

/**
 * Sends a custom verification OTP email using EmailJS client-side HTTP API.
 * @param {string} toEmail - User email address
 * @param {string} toName - User display name
 * @param {string} otpCode - Generated 6-digit code
 * @returns {Promise<Response>}
 */
export async function sendOtpEmail(toEmail, toName, otpCode) {
  // Format expiration time (15 minutes from now)
  const expires = new Date(Date.now() + 15 * 60 * 1000);
  const timeString = expires.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  console.log(`[MedhaSetu Mail] Dispatching verification OTP for ${toEmail}: ${otpCode} (Expires: ${timeString})`);

  const payload = {
    service_id: EMAILJS_CONFIG.SERVICE_ID,
    template_id: EMAILJS_CONFIG.TEMPLATE_ID,
    user_id: EMAILJS_CONFIG.PUBLIC_KEY,
    template_params: {
      email: toEmail,
      passcode: otpCode,
      time: timeString
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("EmailJS API Error Response:", errorText);
    }
    
    return response;
  } catch (err) {
    console.error("EmailJS network error:", err);
    throw err;
  }
}
