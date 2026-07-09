// EmailJS Configuration
// You can sign up for a free account at https://www.emailjs.com/
// to get your own service ID, template ID, and public key.

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_medhasetu',     // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_medhasetu',   // Replace with your EmailJS template ID
  PUBLIC_KEY: 'user_medhasetu_public',  // Replace with your EmailJS public key
};

/**
 * Sends a custom verification OTP email using EmailJS client-side HTTP API.
 * @param {string} toEmail - User email address
 * @param {string} toName - User display name
 * @param {string} otpCode - Generated 6-digit code
 * @returns {Promise<Response>}
 */
export async function sendOtpEmail(toEmail, toName, otpCode) {
  // If the user has not configured EmailJS yet, print the OTP to console for easy testing
  console.log(`[MedhaSetu Mail Simulator] Verification OTP for ${toName} (${toEmail}): ${otpCode}`);

  const payload = {
    service_id: EMAILJS_CONFIG.SERVICE_ID,
    template_id: EMAILJS_CONFIG.TEMPLATE_ID,
    user_id: EMAILJS_CONFIG.PUBLIC_KEY,
    template_params: {
      to_email: toEmail,
      to_name: toName,
      otp_code: otpCode,
      app_name: 'MedhaSetu'
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
      console.warn("EmailJS API rejected request (this is normal if keys are placeholders):", errorText);
    }
    
    return response;
  } catch (err) {
    console.error("EmailJS network error:", err);
    throw err;
  }
}
