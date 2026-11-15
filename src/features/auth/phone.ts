/** Cho phép cách viết có dấu phân cách, nhưng phải có 8–15 chữ số thực. */
export function isValidPhoneNumber(phone: string): boolean {
  if (!/^\+?[0-9 ()-]{8,20}$/.test(phone)) return false;
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 8 && digitCount <= 15;
}
