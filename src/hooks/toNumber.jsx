 // helper function
export const toNumber = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "string") {
    if (val.trim().toLowerCase() === "null" || val.trim() === "") return 0;
  }
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};