import { useEffect, useState } from "react";

export default function InspectionForm() {

  const [formData, setFormData] = useState({

    customerName: "",
    address: "",
    consumerNumber: "",
    applicationNo: "",

    division: "",
    capacity: "",
    inspectionDate: "",

    inverterMake: "",
    inverterSerial: "",

    panelMake: "",
    panelType: "",
    totalPanels: ""

  });

  useEffect(() => {

    const storedCustomer =
      localStorage.getItem("inspectionCustomer");

    if (storedCustomer) {

      const customer = JSON.parse(storedCustomer);

      setFormData((prev) => ({
        ...prev,

        customerName: customer.name || "",
        address: customer.address || "",
        consumerNumber:
          customer.consumerNumber || "",

        applicationNo:
          customer.applicationNo || ""

      }));

    }

  }, []);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const generatePDF = async () => {

    try {

      const response = await fetch(
        "/api/pdf/generate-inspection",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const blob = await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "inspection-report.pdf";

      link.click();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Inspection Report Form
      </h1>

      <div className="grid grid-cols-2 gap-4">

        {Object.keys(formData).map((key) => (

          <input
            key={key}
            type="text"
            name={key}
            placeholder={key}
            value={formData[key]}
            onChange={handleChange}
            className="border p-3 rounded"
          />

        ))}

      </div>

      <button
        onClick={generatePDF}
        className="bg-green-600 text-white px-6 py-3 rounded mt-6"
      >
        Generate PDF
      </button>

    </div>

  );

}