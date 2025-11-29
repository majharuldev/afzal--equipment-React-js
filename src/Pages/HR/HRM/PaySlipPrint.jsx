// Helper: convert number to words (English, supports up to millions)
const numberToWords = (num) => {
  if (num === null || num === undefined) return ""
  if (num === 0) return "zero"
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ]
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
  const g = ["", "thousand", "million", "billion"]

  const makeGroup = (n) => {
    let str = ""
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + " hundred"
      n = n % 100
      if (n) str += " "
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)]
      if (n % 10) str += " " + a[n % 10]
    } else if (n > 0) {
      str += a[n]
    }
    return str
  }

  let i = 0
  const words = []
  while (num > 0) {
    const chunk = num % 1000
    if (chunk) {
      let chunkWords = makeGroup(chunk)
      if (g[i]) chunkWords += " " + g[i]
      words.unshift(chunkWords.trim())
    }
    num = Math.floor(num / 1000)
    i++
  }
  return words.join(" ")
}
import React, { forwardRef } from "react";
const PaySlipPrint = forwardRef(({ data }, ref) => {
console.log(data, "data")
  return (
    <div ref={ref} className="max-w-4xl mx-auto bg-white p-8 font-sans text-sm">
      {/* Header Section */}
      <div className="border-2 border-gray-700">
        {/* Company Header */}
        <div className="flex items-center justify-between p-4">
          <div className="">
            {/* Logo */}
            {/* <img src={logo} alt="" /> */}
            {/* <div className="text-xs text-secondary">
              <div className="font-bold">আফজাল কনস্ট্রাকশন</div>
            </div> */}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary mb-2">আফজাল কনস্ট্রাকশন</h1>
            <div className="text-xs text-gray-700">
              <div>হাউস-১/গা, ব্লক-সি, রোড-১  </div>
              <div>মিরপুর-২, ঢাকা-১২১৬, বাংলাদেশ</div>
            </div>
          </div>
          <div className="w-16"></div> {/* Spacer for balance */}
        </div>

        {/* Pay Slip Title */}
        <div className="text-center py-3 px-28">
          <h2 className="text-xl font-bold italic border-b-2 border-gray-700">বেতন স্লিপ</h2>
        </div>

        {/* table info */}
        <div className="border border-gray-700 mx-10">
          {/* Employee Information */}
          <div className="border-b border-black">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="border-r border-black p-2 font-semibold bg-gray-100 w-32">কর্মী আইডি</td>
                  <td className="border-r border-black p-2 w-40">{data.empId}</td>
                  <td className="border-r border-black p-2 font-semibold bg-gray-100 w-32">কর্মীর নাম</td>
                  <td className="p-2">{data.name}</td>
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold bg-gray-100">পদবী</td>
                  <td className="border-r border-black p-2">{data.designation}</td>
                  <td className="border-r border-black p-2 font-semibold bg-gray-100">মাস/বছর</td>
                  <td className="p-2">{data.monthYear}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Earnings and Deductions */}
          <div className="border-y border-black">
            <table className="w-full">
              <tbody>
                <tr>
                  <td colSpan={2} className="border-r border-black p-2 text-center font-bold bg-gray-100 w-1/4">আয়</td>
                  {/* <td className="border-r border-black p-2 text-center font-bold bg-gray-100 w-1/4"></td> */}
                  <td colSpan={2} className=" p-2 text-center font-bold bg-gray-100 w-1/4">কর্তন</td>
                  {/* <td className="p-2 text-center font-bold bg-gray-100 w-1/4"></td> */}
                </tr>
                <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">মূল বেতন</td>
                  <td className="border-r border-black p-2 text-right">{data?.salary}</td>
                  <td className="border-r border-black p-2 font-semibold">অগ্রিম</td>
                  <td className="p-2 text-right">{data?.advance}</td>
                </tr>
                {/* <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">House Rent</td>
                  <td className="border-r border-black p-2 text-right">{data?.rent}</td>
                  <td className="border-r border-black p-2 font-semibold rounded-full border  mx-2 text-center">
                    Loan
                  </td>
                  <td className="p-2 text-right">{data?.monthly_deduction}</td>
                </tr> */}
                {/* <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Medical</td>
                  <td className="border-r border-black p-2 text-right">{data?.medical}</td>
                  <td className="border-r border-black p-2 font-semibold rounded-full border mx-2 text-center">
                    Tax
                  </td>
                  <td className="p-2 text-right">{data?.tax}</td>
                </tr> */}
                {/* <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Convance</td>
                  <td className="border-r border-black p-2 text-right">{data?.conv}</td>
                  <td className="border-r border-black p-2"></td>
                  <td className="p-2"></td>
                </tr> */}
                {/* <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Allowance</td>
                  <td className="border-r border-black p-2 text-right">{data?.allowance}</td>
                  <td className="border-r border-black p-2"></td>
                  <td className="p-2"></td>
                </tr> */}
                {/* <tr className="border-t border-black">
                  <td className="border-r border-black p-2 font-semibold">Bonus</td>
                  <td className="border-r border-black p-2 text-right">{data?.bonus}</td>
                  <td className="border-r border-black p-2"></td>
                  <td className="p-2"></td>
                </tr> */}
                <tr className="border-t border-r border-black bg-gray-100">
                  <td className="border-r border-black p-2 font-bold">মোট সংযোজন</td>
                  <td className="border-r border-black p-2 text-right font-bold"> {data?.total}</td>
                  <td className="border-r border-black p-2 font-bold">মোট কর্তন</td>
                  <td className=" border-black p-2 text-right font-bold">{data?.deductionTotal}.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net Salary */}
          <div className="border-l border-black">
            <table className="w-full">
              <tbody>
                <tr className="border-t border-black">
                  <td className=" p-2 font-bold bg-gray-100 w-1/4">নেট বেতন</td>
                  <td className="p-2 text-center font-bold text-lg"> {data.netPay} </td>
                  <td className="p-2"></td>
                </tr>
                <tr className="border-t border-black">
                  <td className=" p-2 font-bold bg-gray-100">কথায় বেতন:</td>
                  <td className="p-2 font-semibold">{numberToWords(data.netPay).toUpperCase()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Payment Method and Signatures */}
          <div className="p-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="mb-2 font-semibold">বেতন পরিশোধ মাধ্যম:</div>
                <div className="flex gap-8">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" defaultChecked />
                    <span>নগদ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>চেক</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                <div className="mb-2">কর্মীর স্বাক্ষর</div>
                <div className="border-b border-black w-64 h-8"></div>
              </div>
              <div>
                <div className="mb-2">অনুমোদিত</div>
                <div className="border-b border-black w-64 h-8"></div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
})

export default PaySlipPrint;