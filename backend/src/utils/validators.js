// Input validation rules matching assessment requirements strictly

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const len = name.trim().length;
  // Assessment requirement: Name: Min 20 characters, Max 60 characters
  return len >= 20 && len <= 60;
};

const validateAddress = (address) => {
  if (address === undefined || address === null || typeof address !== 'string') return false;
  // Assessment requirement: Address: Max 400 characters
  const len = address.trim().length;
  return len > 0 && len <= 400;
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  // Assessment requirement: Password: 8-16 characters, must include at least one uppercase letter and one special character
  if (password.length < 8 || password.length > 16) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  return hasUpperCase && hasSpecialChar;
};

const validateRating = (rating) => {
  const num = Number(rating);
  // Assessment requirement: ratings should range from 1 to 5
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

module.exports = {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
  validateRating,
};
