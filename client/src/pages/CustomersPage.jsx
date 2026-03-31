import { useEffect, useState } from "react";
import api from "../api/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/customers").then((response) => setCustomers(response.data));
  }, []);

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customers</h3>
          <p className="text-sm text-slate-500">All customer records with DISCOM and lead details.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">DISCOM</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Lead By</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id} className="border-t border-slate-200">
                <td className="px-3 py-3 font-medium">{customer.name}</td>
                <td className="px-3 py-3">{customer.mobileNumber}<br /><span className="text-xs text-slate-500">{customer.emailAddress}</span></td>
                <td className="px-3 py-3">{customer.discom}</td>
                <td className="px-3 py-3">{customer.address}</td>
                <td className="px-3 py-3">{customer.leadBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
