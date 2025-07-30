// useRefId.js
import { useCallback } from "react";

const useRefId = () => {
  const generateRefId = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let refId = "";
    for (let i = 0; i < 6; i++) {
      refId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return refId;
  }, []);

  return generateRefId;
};

export default useRefId;
