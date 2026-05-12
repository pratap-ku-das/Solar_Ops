const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateCaptcha = (length = 6) =>
  Array.from({ length }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");

export const getPasswordStrength = (password = "") => {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (!password) {
    return { label: "Enter a password", barClass: "bg-slate-200", widthClass: "w-0" };
  }

  if (score <= 1) {
    return { label: "Weak", barClass: "bg-rose-500", widthClass: "w-1/4" };
  }

  if (score <= 3) {
    return { label: "Fair", barClass: "bg-amber-500", widthClass: "w-2/4" };
  }

  if (score <= 4) {
    return { label: "Strong", barClass: "bg-emerald-500", widthClass: "w-3/4" };
  }

  return { label: "Very strong", barClass: "bg-emerald-600", widthClass: "w-full" };
};