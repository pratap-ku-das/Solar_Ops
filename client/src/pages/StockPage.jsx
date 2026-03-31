import { useEffect, useState } from "react";
import api from "../api/api";

const initialItem = {
  itemName: "",
  category: "Solar Panels",
  availableQuantity: 0,
  unit: "pcs",
  stockIn: 0,
  stockOut: 0
};

export default function StockPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialItem);
  const [movementQty, setMovementQty] = useState({});

  const fetchStock = async () => {
    const { data } = await api.get("/stock");
    setItems(data);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const createItem = async (event) => {
    event.preventDefault();
    await api.post("/stock", form);
    setForm(initialItem);
    fetchStock();
  };

  const updateMovement = async (itemId, type) => {
    const quantity = Number(movementQty[itemId] || 0);
    if (!quantity) return;
    await api.put(`/stock/${itemId}/movement`, { quantity, type });
    setMovementQty((prev) => ({ ...prev, [itemId]: "" }));
    fetchStock();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={createItem} className="card grid gap-3 md:grid-cols-5">
        <input className="input" placeholder="Item name" value={form.itemName} onChange={(e) => setForm((prev) => ({ ...prev, itemName: e.target.value }))} required />
        <select className="input" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
          <option>Solar Panels</option>
          <option>Inverters</option>
          <option>Structure Materials</option>
        </select>
        <input className="input" type="number" placeholder="Available Qty" value={form.availableQuantity} onChange={(e) => setForm((prev) => ({ ...prev, availableQuantity: e.target.value, stockIn: e.target.value }))} required />
        <input className="input" placeholder="Unit" value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} />
        <button className="btn-primary" type="submit">Add Stock Item</button>
      </form>

      <div className="card overflow-x-auto">
        <h3 className="mb-4 text-lg font-semibold">Inventory</h3>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Available</th>
              <th className="px-3 py-2">In / Out</th>
              <th className="px-3 py-2">Movement</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-slate-200">
                <td className="px-3 py-3 font-medium">{item.itemName}</td>
                <td className="px-3 py-3">{item.category}</td>
                <td className="px-3 py-3">{item.availableQuantity} {item.unit}</td>
                <td className="px-3 py-3 text-xs text-slate-500">IN: {item.stockIn} • OUT: {item.stockOut}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <input className="input max-w-24" type="number" value={movementQty[item._id] || ""} onChange={(e) => setMovementQty((prev) => ({ ...prev, [item._id]: e.target.value }))} placeholder="Qty" />
                    <button className="btn-secondary" onClick={() => updateMovement(item._id, "in")}>Stock In</button>
                    <button className="btn-secondary" onClick={() => updateMovement(item._id, "out")}>Stock Out</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
