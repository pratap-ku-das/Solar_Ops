import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import PipelineSteps from "../components/PipelineSteps";

function CustomersPage() {

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {

    api.get("/customers")
      .then((response) => setCustomers(response.data));

  }, []);

  const handleCustomerClick = async (customer) => {

    setSelectedCustomer(customer);
    setDetailsOpen(true);
    setLoadingDetails(true);
    setEditMode(false);
    setEditData(null);

    try {

      const res =
        await api.get(`/customers/${customer._id}/details`);

      setCustomerDetails(res.data);

    } catch (err) {

      setCustomerDetails({
        error: "Failed to load details"
      });

    }

    setLoadingDetails(false);

  };

  const handleEdit = () => {

    setEditMode(true);

    setEditData({
      ...customerDetails.customer
    });

  };

  const handleEditChange = (e) => {

    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value
    }));

  };

  const handleEditCancel = () => {

    setEditMode(false);
    setEditData(null);

  };

  const handleEditSave = async () => {

    try {

      const res =
        await api.put(`/customers/${editData._id}`, editData);

      setCustomerDetails((prev) => ({
        ...prev,
        customer: res.data
      }));

      setCustomers((prev) =>
        prev.map((c) =>
          c._id === res.data._id ? res.data : c
        )
      );

      setEditMode(false);
      setEditData(null);

    } catch (err) {

      alert("Failed to update customer");

    }

  };

  // INSPECTION REPORT BUTTON FUNCTION

  const openInspectionForm = (customer) => {

    localStorage.setItem(
      "inspectionCustomer",
      JSON.stringify(customer)
    );

  };

  return (

    <div className="card">

      <div className="mb-4 flex items-center justify-between">

        <h3 className="text-lg font-semibold">
          Customers
        </h3>

        <p className="text-sm text-slate-500">
          All customer records with DISCOM and lead details.
        </p>

      </div>

      <div className="space-y-3 md:hidden">
        {customers.map((customer) => (
          <button
            key={customer._id}
            type="button"
            onClick={() => handleCustomerClick(customer)}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{customer.name}</p>
                <p className="mt-1 text-sm text-slate-600">{customer.mobileNumber}</p>
                <p className="text-xs text-slate-500">{customer.emailAddress}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{customer.discom}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{customer.address || "No address provided"}</p>
            <p className="mt-1 text-xs text-slate-500">Lead By: {customer.leadBy || "-"}</p>
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">

        <table className="min-w-full text-left text-sm">

          <thead className="bg-slate-50 text-slate-600">

            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Mobile / Email</th>
              <th className="px-3 py-3">DISCOM</th>
              <th className="px-3 py-3">Address</th>
              <th className="px-3 py-3">Lead By</th>
            </tr>

          </thead>

          <tbody>

            {customers.map((customer) => (

              <tr
                key={customer._id}
                className="border-t border-slate-200"
                onClick={() => handleCustomerClick(customer)}
                style={{ cursor: "pointer" }}
              >

                <td className="px-3 py-3 font-medium">
                  {customer.name}
                </td>

                <td className="px-3 py-3">
                  {customer.mobileNumber}
                  <br />
                  <span className="text-xs text-slate-500">
                    {customer.emailAddress}
                  </span>
                </td>

                <td className="px-3 py-3">
                  {customer.discom}
                </td>

                <td className="px-3 py-3">
                  {customer.address}
                </td>

                <td className="px-3 py-3">
                  {customer.leadBy}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* CUSTOMER DETAILS MODAL */}

      {detailsOpen && (

        <div className="fixed inset-0 z-50 flex flex-col bg-black bg-opacity-60">

          <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">

            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 mx-auto my-8">

              <button
                className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setDetailsOpen(false);
                  setCustomerDetails(null);
                  setEditMode(false);
                  setEditData(null);
                }}
              >
                &times;
              </button>

              {loadingDetails ? (

                <div>Loading...</div>

              ) : customerDetails ? (

                customerDetails.error ? (

                  <div className="text-red-500">
                    {customerDetails.error}
                  </div>

                ) : (

                  <>

                    {/* PIPELINE */}

                    {customerDetails.projects &&
                      customerDetails.projects.length > 0 && (

                      <PipelineSteps
                        stages={[
                          "Proposal",
                          "Document Collection",
                          "Login Required",
                          "Login Complete",
                          "Problemeting File",
                          "Document Generation",
                          "Digital Approval Pending",
                          "Digital Approval Complete",
                          "Need to Bank submit",
                          "Submitted In bank",
                          "Waiting for Disbursement",
                          "Loan Disbursement Complete",
                          "Installation Pending",
                          "Demand Note Generation",
                          "Demand Note Payment Complete",
                          "Inspection Process",
                          "Inspection Complete",
                          "Document upload in MNRE Portal",
                          "Inspection Pending/ Complete",
                          "Subsidy apply Pending",
                          "Subsidy Redeemed",
                          "Subsidy Disbursed"
                        ]}
                        currentStage={
                          customerDetails.projects[0].status
                        }
                      />

                    )}

                    <div className="mt-6">

                      <h4 className="text-lg font-semibold mb-2">
                        Customer Details
                      </h4>

                      {editMode ? (

                        <div className="space-y-2">

                          <div>
                            <label className="block text-sm font-medium">
                              Name
                            </label>

                            <input
                              className="input input-bordered w-full"
                              name="name"
                              value={editData.name}
                              onChange={handleEditChange}
                            />
                          </div>

                          <div className="flex gap-2 mt-4">

                            <button
                              className="btn btn-primary"
                              onClick={handleEditSave}
                            >
                              Save
                            </button>

                            <button
                              className="btn btn-secondary"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        <div>

                          <div className="mb-2">

                            <strong>Name:</strong>
                            {customerDetails.customer?.name}

                            <br />

                            <strong>Contact:</strong>
                            {customerDetails.customer?.mobileNumber}

                            <br />

                            <strong>Email:</strong>
                            {customerDetails.customer?.emailAddress}

                            <br />

                            <strong>DISCOM:</strong>
                            {customerDetails.customer?.discom}

                            <br />

                            <strong>Address:</strong>
                            {customerDetails.customer?.address}

                            <br />

                            <strong>Lead By:</strong>
                            {customerDetails.customer?.leadBy}

                            <br />

                            <strong>Consumer Number:</strong>
                            {customerDetails.customer?.consumerNumber}

                          </div>

                          <button
                            className="btn btn-primary mb-4"
                            onClick={handleEdit}
                          >
                            Edit
                          </button>

                          {/* GENERATE PDF BUTTON */}

                          <div className="flex gap-3 mb-4">

                            <Link
                              to="/inspection-form"
                              onClick={() =>
                                openInspectionForm(
                                  customerDetails.customer
                                )
                              }
                            >

                              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">

                                Generate Inspection Report

                              </button>

                            </Link>

                          </div>

                          {/* DOCUMENTS */}

                          <div className="mb-2">

                            <strong>Documents:</strong>

                            {customerDetails.documents &&
                            customerDetails.documents.length > 0 ? (

                              <ul className="list-disc ml-5">

                                {customerDetails.documents.map((doc) => (

                                  <li key={doc._id}>

                                    {doc.type}:{" "}

                                    <a
                                      href={doc.path}
                                      className="text-blue-600 underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >

                                      {doc.fileName}

                                    </a>

                                  </li>

                                ))}

                              </ul>

                            ) : (

                              <div>No documents found.</div>

                            )}

                          </div>

                          {/* PROJECTS */}

                          <div>

                            <strong>
                              Projects / Work Process:
                            </strong>

                            {customerDetails.projects &&
                            customerDetails.projects.length > 0 ? (

                              <ul className="list-disc ml-5">

                                {customerDetails.projects.map((proj) => (

                                  <li key={proj._id}>

                                    {proj.name} - {proj.status}

                                  </li>

                                ))}

                              </ul>

                            ) : (

                              <div>No projects found.</div>

                            )}

                          </div>

                        </div>

                      )}

                    </div>

                  </>

                )

              ) : null}

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default CustomersPage;