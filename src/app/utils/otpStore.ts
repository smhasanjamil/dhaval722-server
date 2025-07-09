const otpStore: { [email: string]: { otp: string; expiresAt: number } } = {};

export const saveOTP = (email: string, otp: string) => {
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
  };
};

export const verifyOTP = (email: string, otp: string) => {
  const data = otpStore[email];
  if (!data) return false;
  const isValid = data.otp === otp && Date.now() < data.expiresAt;
  if (isValid) delete otpStore[email];
  return isValid;
};
