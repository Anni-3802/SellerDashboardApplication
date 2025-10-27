import React from "react";
import { useState, useEffect } from "react";

export default function App() {
  const [sellers, setSellers] = useState([]);
  const [selected, setSelected] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    fetch("/api/seller/list")
      .then(res => res.json())
      .then(setSellers)
      .catch(() => setErr("Failed to fetch sellers"));
  }, []);

  const fetchSummary = async (id) => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/seller/${id}/summary`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-xl w-full bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Seller Dashboard</h1>

        <select
          className="w-full border p-2 rounded mb-4"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            fetchSummary(e.target.value);
          }}
        >
          <option value="">Select a Seller</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {loading && <p className="text-blue-500">Loading...</p>}
        {err && <p className="text-red-600">{err}</p>}

        {data && (
          <div className="space-y-4">
            <div className="p-3 border rounded">
              <p className="text-gray-600">Total Sales This Week</p>
              <p className="text-xl font-semibold">{data.totalSalesThisWeek}</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-gray-600">Total Revenue This Week</p>
              <p className="text-xl font-semibold">₹ {data.totalRevenueThisWeek}</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-gray-600">Return Rate</p>
              <p className="text-xl font-semibold">{data.returnRate}%</p>
            </div>
            <div className="p-3 border rounded">
              <p className="text-gray-600 font-medium">Alerts</p>
              {data.alerts.length > 0 ? (
                <ul className="list-disc list-inside text-red-600">
                  {data.alerts.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              ) : (
                <p className="text-green-600">No alerts 🎉</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
