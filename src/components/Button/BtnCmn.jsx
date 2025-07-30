const BtnCmn = ({ children }) => {
  return (
    <button
      type="submit"
      className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300  cursor-pointer"
    >
      {children}
    </button>
  );
};

export default BtnCmn;
