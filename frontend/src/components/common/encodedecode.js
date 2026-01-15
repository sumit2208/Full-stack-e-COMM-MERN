import CryptoJS from "crypto-js";
export const getDecryptedRole = () => {
  const encryptedRole = localStorage.getItem("role");
  const secretKey = "SUMITGUPTA";

  if (encryptedRole) {
    const bytes = CryptoJS.AES.decrypt(encryptedRole, secretKey);
    const decryptedRole = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedRole;
  }
  return null;
};
