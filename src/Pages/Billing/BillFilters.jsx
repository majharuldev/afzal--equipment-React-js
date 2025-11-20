export default function BillFilters({
  vehicleOptions,
  selectedCategory,
  setSelectedCategory,
  selectedCustomer,
  setSelectedCustomer,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">

      {/* Vehicle Category */}
      <div>
        <label className="font-medium">ভেহিকল ক্যাটাগরি</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border px-3 py-2 w-full rounded"
        >
          <option value="">সব ক্যাটাগরি</option>
          {vehicleOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Customer Search */}
      <div>
        <label className="font-medium">কাস্টমার</label>
        <input
          type="text"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="border px-3 py-2 w-full rounded"
          placeholder="কাস্টমার নাম"
        />
      </div>

      {/* Date */}
      <div>
        <label className="font-medium">শুরু তারিখ</label>
        <input
          type="date"
          className="border px-3 py-2 w-full rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div>
        <label className="font-medium">শেষ তারিখ</label>
        <input
          type="date"
          className="border px-3 py-2 w-full rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
    </div>
  );
}
