// import React, { forwardRef, useEffect } from "react";

// const InvoicePrint = forwardRef(({ data }, ref) => {
//    const {
//     voucherNo,
//     receiver,
//     address,
//     truckNo,
//     dln,
//     loadingPoint,
//     unloadingPoint,
//     rent,
//     loadingDemurrage,
//     inTime,
//     outTime,
//     totalDay,
//     totalDemurrage,
//     others,
//   } = data;

//   useEffect(() => {
//   console.log("Rendered InvoicePrint", data);
// }, []);


//   return (
//     <div ref={ref} className="text-sm p-8 bg-pink-100 w-[794px] h-[900px] text-black font-sans mx-auto">
//       <div className="text-center mb-2">
//         <h2 className="text-xl font-bold text-primary">লক্ষ্মাম পরিবহন সংস্থা</h2>
//         <h3 className="font-semibold text-blue-900">LAKSHAM PORIBOHAN SONGSTHA</h3>
//         <p className="text-xs">
//           Transport Contractor & Commission Agent all over Bangladesh<br />
//           <span className="font-semibold">Dhaka Office:</span> Union Office (4th Floor), Tejgaon, Dhaka-1208<br />
//           <span>📞</span> 01717 314747, 01797 394658, 01615 314747<br />
//           📧 lpsongstha@gmail.com
//         </p>
//         <button className="bg-primary px-3 py-2 rounded-full text-white my-5">Voucher</button>
//       </div>

//       <div className="flex justify-between mb-2 border-b border-black pb-2">
//         <div>
//           <span className="font-semibold">Voucher no:</span> {voucherNo}
//         </div>
//         <div>
//           <span className="font-semibold">Date:</span> __________
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-2 mb-4 space-y-3">
//         <div className="space-y-2">
//           <p><strong className="mr-3">Sender:</strong>Laksham Poribohan Songstha</p>
//           <p><strong className="mr-3">Address:</strong> Union Office (4th Floor), Tejgaon, Dhaka</p>
//         </div>
//         <div className="space-y-2">
//           <p><strong>Receiver:</strong><span className="border-b border-dotted ml-3">{receiver}</span></p>
//           <p><strong>Address:</strong><span className="border-b border-dotted ml-3"> {address}</span></p>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-2 mb-4 border border-primary p-2">
//         <p><strong>Truck no:</strong><span className="border-b border-dotted ml-3">  {truckNo}</span></p>
//         <p><strong>D/L no:</strong> <span className="border-b border-dotted ml-3"> {dln}</span></p>
//       </div>

//       <div className="border border-primary p-5">
//         <div className="grid grid-cols-2">
//           <p><strong className="mr-3">Loading Point:</strong> {loadingPoint}</p>
//           <p><strong className="mr-3">Unloading Point:</strong> {unloadingPoint}</p>
//         </div>

//         <p className="mt-2"><strong className="mr-3">Rent:</strong> {rent}</p>
//         <p><strong className="mr-3">Loading Demurrage:</strong> {loadingDemurrage}</p>

//         <div className="mt-2">
//           <p><strong className="mr-3">Unloading Details:</strong></p>
//           <p>In Time: {inTime}</p>
//           <p>Out Time: {outTime}</p>
//           <p>Total Day: {totalDay}</p>
//         </div>

//         <p className="mt-2"><strong className="mr-3">Total Demurrage:</strong>{totalDemurrage}</p>
//         <p className="mt-2 pb-20"><strong>Others:</strong> {others}</p>
//       </div>

//       <p className="mt-4"><strong>In words:</strong> ____________________________</p>

//       <div className="flex justify-between mt-10">
//         <div><strong>Received by</strong></div>
//         <div><strong>Signature from<br />Laksham Poribohan Songstha</strong></div>
//       </div>
//     </div>
//   );
// });

// export default InvoicePrint;


import React, { forwardRef, useEffect } from "react";

const InvoicePrint = forwardRef(({ data }, ref) => {
  const {
    voucherNo,
    receiver,
    address,
    truckNo,
    dln,
    loadingPoint,
    unloadingPoint,
    rent,
    loadingDemurrage,
    inTime,
    outTime,
    totalDay,
    totalDemurrage,
    others,
  } = data;


  return (
    <div ref={ref} className="text-sm p-8 bg-white w-[810px] h-[1000px] text-black font-sans mx-auto">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-primary">লাকসাম পরিবহন সংস্থা</h2>
        <h3 className="font-semibold text-blue-900">LAKSHAM PORIBOHAN SONGSTHA</h3>
        <div className="text-md font-semibold">
          Transport Contractor & Commission Agent all over Bangladesh<br />
          <span className="font-semibold">Dhaka Office:</span> Union Office (4th Floor), Tejgaon, Dhaka-1208<br />
          <span>📞</span> 01717 314747, 01797 394658, 01615 314747<br />
          📧 lpsongstha@gmail.com
        </div>
        <button className="bg-primary px-3 py-2 rounded-full text-white my-4">Voucher</button>
      </div>

      <div className="flex justify-between mb-2 border-b border-black pb-2">
        <div>
          <span className="font-semibold">Voucher no:</span> {voucherNo}
        </div>
        <div>
          <span className="font-semibold">Date:</span> __________
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 space-y-3">
        <div className="space-y-2">
          <p><strong className="mr-3">Sender:</strong>Laksham Poribohan Songstha</p>
          <p><strong className="mr-3">Address:</strong> Union Office (4th Floor), Tejgaon, Dhaka</p>
        </div>
        <div className="space-y-2">
          <p><strong>Receiver:</strong><span className="border-b border-dotted ml-3">{receiver}</span></p>
          <p><strong>Address:</strong><span className="border-b border-dotted ml-3"> {address}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 border border-primary p-2">
        <p><strong className="mr-3">Truck no:</strong><span className="border-b border-dotted ml-3"> {truckNo}</span></p>
        <p><strong className="mr-3">D/L no:</strong> <span className="border-b border-dotted ml-3"> {dln}</span></p>
      </div>

      {/* Invoice-like layout with Description & Amount */}
      <div className="border border-primary mt-5 py-1 space-y-2">
        <div className="grid grid-cols-2 justify-between border-b border-primary">
            <p className="text-center font-semibold text-lg">Description</p>
            <p className="text-center font-semibold text-lg">Amount</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between">
          <span><strong className="mr-3">Loading Point:</strong><span className="border-b border-dotted ml-3 w-80 inline-block"> {loadingPoint}</span>
          <span></span>
          </span>
        </div>
        <div className="flex justify-between">
          <span><strong className="mr-3">Unloading Point:</strong><span className="border-b border-dotted ml-3 w-80 inline-block"> {unloadingPoint}</span>
          <span></span>
          </span>
        </div>
        <div className="flex justify-between">
          <span><strong >Rent:</strong></span>
          <span>{rent}</span>
        </div>
        <div className="flex justify-between">
          <span><strong>Loading Demurrage:</strong></span>
          <span>{loadingDemurrage}</span>
        </div>
        <div className="flex justify-between">
          <span><strong>In Time:</strong><span className="border-b border-dotted ml-3 w-80 inline-block"> {inTime}</span></span>
          <span></span>
        </div>
        <div className="flex justify-between">
          <span><strong>Out Time:</strong><span className="border-b border-dotted ml-3 w-80 inline-block"> {outTime}</span></span>
          <span></span>
        </div>
        <div className="flex gap-3">
          <span><strong>Total Day:</strong></span>
          <span className="border-b border-dotted ml-3 w-80 inline-block">{totalDay}</span>
        </div>
        <div className="flex justify-between">
          <span><strong>Total Demurrage:</strong></span>
          <span>{totalDemurrage}</span>
        </div>
        <div className="flex pb-20 gap-[30rem]">
          <span><strong>Others:</strong> {others}</span>
          <div>
            <span><strong>Total:</strong> {
  (parseFloat(rent) || 0) +
  (parseFloat(loadingDemurrage) || 0) +
  (parseFloat(totalDemurrage) || 0) +
  (parseFloat(others) || 0)
}</span>
          </div>
        </div>
        </div>
      </div>

      <p className="mt-4"><strong>In words:</strong> ____________________________</p>

      <div className="flex justify-between mt-10">
        <div><p className="text-medium ">Received by</p></div>
        <div><p className="text-medium text-center">Signature from<br />Laksham Poribohan Songstha</p></div>
      </div>
    </div>
  );
});

export default InvoicePrint;
