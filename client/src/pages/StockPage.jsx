import { Bell, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const initialItem = {
  itemName: "",
  category: "Solar Panels",
  availableQuantity: 0,
  unit: "pcs",
  stockIn: 0,
  stockOut: 0
};

export default function StockPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(initialItem);
  const [movementQty, setMovementQty] = useState({});

  const fetchStock = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/stock");
      setItems(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load stock data.");
    } finally {
      setLoading(false);
    }
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

  const inrFormatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 }),
    []
  );

  const unitCostByCategory = {
    "solar panels": 16500,
    inverters: 62000,
    batteries: 78000,
    "dc cables": 2200,
    accessories: 1200
  };

  const classifyBucket = (item) => {
    const category = String(item?.category || "").toLowerCase();
    const name = String(item?.itemName || "").toLowerCase();
    if (category.includes("panel") || name.includes("panel")) return "Solar Panels";
    if (category.includes("inverter") || name.includes("inverter")) return "Inverters";
    if (category.includes("battery") || name.includes("battery")) return "Batteries";
    if (category.includes("cable") || name.includes("cable")) return "DC Cables";
    return "Accessories";
  };

  const getAlertLevel = (availableQty) => {
    if (availableQty <= 5) return { label: "Critical", tone: "bg-red-100 text-red-700" };
    if (availableQty <= 20) return { label: "Low Stock", tone: "bg-orange-100 text-orange-700" };
    return { label: "Healthy", tone: "bg-emerald-100 text-emerald-700" };
  };

  const normalizedRows = useMemo(() => {
    return items.map((item) => {
      const bucket = classifyBucket(item);
      const categoryKey = bucket.toLowerCase();
      const unitCost = unitCostByCategory[categoryKey] || 1500;
      const availableQty = Number(item.availableQuantity || 0);
      const reservedQty = Number(item.stockOut || 0);
      const estimatedValue = availableQty * unitCost;
      const sku = `SOL-${String(item._id || "").slice(-6).toUpperCase() || "000000"}`;
      return {
        ...item,
        bucket,
        sku,
        availableQty,
        reservedQty,
        unitCost,
        estimatedValue,
        alert: getAlertLevel(availableQty)
      };
    });
  }, [items]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return normalizedRows;
    return normalizedRows.filter((row) => row.itemName.toLowerCase().includes(normalized) || row.sku.toLowerCase().includes(normalized));
  }, [normalizedRows, query]);

  const categoryCards = useMemo(() => {
    const buckets = {
      "Solar Panels": { label: "Solar Panels", qty: 0, unit: "Units" },
      Inverters: { label: "Inverters", qty: 0, unit: "Units" },
      Batteries: { label: "Batteries", qty: 0, unit: "Units" },
      "DC Cables": { label: "DC Cables", qty: 0, unit: "Rolls" },
      Accessories: { label: "Accessories", qty: 0, unit: "Units" }
    };

    normalizedRows.forEach((row) => {
      buckets[row.bucket].qty += row.availableQty;
    });

    return Object.values(buckets);
  }, [normalizedRows]);

  const lowStockRows = useMemo(() => {
    return [...normalizedRows]
      .filter((row) => row.alert.label !== "Healthy")
      .sort((a, b) => a.availableQty - b.availableQty)
      .slice(0, 4);
  }, [normalizedRows]);

  const totalInventoryValue = normalizedRows.reduce((sum, row) => sum + row.estimatedValue, 0);
  const lowStockCount = normalizedRows.filter((row) => row.alert.label !== "Healthy").length;
  const allocatedValue = normalizedRows.reduce((sum, row) => sum + Number(row.stockOut || 0) * row.unitCost, 0);
  const pendingOrders = normalizedRows.filter((row) => row.availableQty <= 20).length;
  const totalAvailable = normalizedRows.reduce((sum, row) => sum + row.availableQty, 0);
  const totalCapacity = normalizedRows.reduce((sum, row) => sum + Number(row.stockIn || 0), 0) || 1;
  const capacityPct = Math.min(100, Math.round((totalAvailable / totalCapacity) * 100));

  const recentPurchaseOrders = useMemo(() => {
    return [...normalizedRows]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 4);
  }, [normalizedRows]);

  const recentActivity = useMemo(() => {
    return [...normalizedRows]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [normalizedRows]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-xl font-bold text-slate-900">Stock Management</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input min-w-64 pl-9"
                placeholder="Search item or SKU"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700" type="button" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              <UserRound size={16} />
              {user?.name || "Admin"}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Inventory Value</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{inrFormatter.format(totalInventoryValue)}</p>
          <p className="mt-1 text-xs text-slate-500">Based on live quantity and category rates</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Low Stock Alerts</p>
          <p className="mt-2 text-2xl font-bold text-orange-600">{lowStockCount} Items</p>
          <p className="mt-1 text-xs text-slate-500">Action required for reorder planning</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Materials Allocated</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">{inrFormatter.format(allocatedValue)}</p>
          <p className="mt-1 text-xs text-slate-500">Calculated from stock-out transactions</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Orders</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{pendingOrders}</p>
          <p className="mt-1 text-xs text-slate-500">Items below reorder threshold</p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Warehouse Capacity</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{capacityPct}%</p>
          <div className="mt-2 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${capacityPct}%` }} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="card">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Inventory Categories</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categoryCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{card.qty}</p>
                <p className="text-xs text-slate-500">{card.unit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Low Stock Alerts</h4>
          <div className="mt-4 space-y-3">
            {lowStockRows.length ? (
              lowStockRows.map((row) => (
                <div key={row._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{row.itemName}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.alert.tone}`}>{row.alert.label}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No low stock items right now.</p>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Stock Table</h4>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2">Item Name</th>
                <th className="px-3 py-2">SKU</th>
                <th className="px-3 py-2">Available Qty</th>
                <th className="px-3 py-2">Reserved Qty</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Movement</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row._id} className="border-t border-slate-200">
                  <td className="px-3 py-3 font-medium text-slate-900">{row.itemName}</td>
                  <td className="px-3 py-3 text-slate-600">{row.sku}</td>
                  <td className="px-3 py-3">{row.availableQty} {row.unit}</td>
                  <td className="px-3 py-3">{row.reservedQty} {row.unit}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.alert.tone}`}>{row.alert.label}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="input max-w-20"
                        type="number"
                        value={movementQty[row._id] || ""}
                        onChange={(e) => setMovementQty((prev) => ({ ...prev, [row._id]: e.target.value }))}
                        placeholder="Qty"
                      />
                      <button className="btn-secondary" onClick={() => updateMovement(row._id, "in")}>In</button>
                      <button className="btn-secondary" onClick={() => updateMovement(row._id, "out")}>Out</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent Purchase Orders</h4>
          <div className="mt-3 space-y-2">
            {recentPurchaseOrders.map((row) => (
              <div key={row._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{row.itemName}</p>
                <p className="mt-1 text-xs text-slate-500">Stock In: {Number(row.stockIn || 0)} {row.unit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Warehouse Summary</h4>
          <div className="mt-3 space-y-2 text-sm">
            <p className="flex items-center justify-between"><span className="text-slate-500">Total Items</span><span className="font-semibold text-blue-700">{normalizedRows.length}</span></p>
            <p className="flex items-center justify-between"><span className="text-slate-500">Healthy</span><span className="font-semibold text-emerald-700">{normalizedRows.filter((row) => row.alert.label === "Healthy").length}</span></p>
            <p className="flex items-center justify-between"><span className="text-slate-500">Low Stock</span><span className="font-semibold text-orange-700">{normalizedRows.filter((row) => row.alert.label === "Low Stock").length}</span></p>
            <p className="flex items-center justify-between"><span className="text-slate-500">Critical</span><span className="font-semibold text-red-700">{normalizedRows.filter((row) => row.alert.label === "Critical").length}</span></p>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Activity Feed</h4>
          <div className="mt-3 space-y-2">
            {recentActivity.map((row) => (
              <div key={row._id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <p className="font-semibold text-slate-800">{row.itemName}</p>
                <p className="text-xs text-slate-500">Available: {row.availableQty} {row.unit} • Out: {row.reservedQty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Add Stock Item</h4>
        <form onSubmit={createItem} className="mt-3 grid gap-3 md:grid-cols-5">
          <input className="input" placeholder="Item name" value={form.itemName} onChange={(e) => setForm((prev) => ({ ...prev, itemName: e.target.value }))} required />
          <select className="input" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}>
            <option>Solar Panels</option>
            <option>Inverters</option>
            <option>Batteries</option>
            <option>DC Cables</option>
            <option>Accessories</option>
          </select>
          <input className="input" type="number" placeholder="Available Qty" value={form.availableQuantity} onChange={(e) => setForm((prev) => ({ ...prev, availableQuantity: e.target.value, stockIn: e.target.value }))} required />
          <input className="input" placeholder="Unit" value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} />
          <button className="btn-primary" type="submit">Add Stock Item</button>
        </form>
      </section>

      {loading ? <p className="text-sm text-slate-500">Loading live stock data...</p> : null}
      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3 md:hidden">
        {filteredRows.map((row) => (
          <div key={row._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{row.itemName}</p>
                <p className="mt-1 text-xs text-slate-500">{row.sku}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.alert.tone}`}>{row.alert.label}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Available: {row.availableQty} {row.unit} • Reserved: {row.reservedQty} {row.unit}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input className="input max-w-20" type="number" value={movementQty[row._id] || ""} onChange={(e) => setMovementQty((prev) => ({ ...prev, [row._id]: e.target.value }))} placeholder="Qty" />
              <button type="button" className="btn-secondary" onClick={() => updateMovement(row._id, "in")}>In</button>
              <button type="button" className="btn-secondary" onClick={() => updateMovement(row._id, "out")}>Out</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
