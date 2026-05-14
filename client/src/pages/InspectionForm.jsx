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

    consumerCategory: "",
    connectionType: "",
    contractDemand: "",
    arrear: "",
    developerName: "",
    installationDate: "",

    transformerCapacity: "",
    transformerLocation: "",
    totalConnectedCapacity: "",
    transformerAdequate: "",

    plantCapacity: "",
    plantSite: "",
    interconnectionType: "",
    singleLineApproval: "",

    inverterMake: "",
    inverterSerial: "",
    inverterCapacity: "",
    inverterVoltage: "",
    antiIslanding: "",

    panelMake: "",
    panelSerial: "",
    panelType: "",
    panelCapacity: "",
    totalPanels: "",
    totalArrayCapacity: "",

    dcEarthing: "",
    acEarthing: "",

    acdcdb: "",
    manualSwitch: "",
    lightning: "",
    spd: "",
    relaySwitch: "",

    backFeeding: "",
    eicApproval: "",
    safetyCertificate: "",
    actualSLD: "",
    testReport: "",

    totalMeters: "",
    meterMake: "",
    meterSerial: "",
    meterPhase: "",
    meterCapacity: "",
    meterConstant: "",

    remarks: "",

    gridSatisfactory: "",
    switchProvision: "",
    operationMaintenance: ""

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

    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-2">
        Inspection Report Form
      </h1>

      <p className="text-slate-600 mb-6">
        Fill in all the details below to generate a comprehensive inspection report for the solar installation.
      </p>

      <form className="space-y-8">
        
        {/* CUSTOMER DETAILS */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} />
            <FormField label="Address" name="address" value={formData.address} onChange={handleChange} />
            <FormField label="Consumer Number" name="consumerNumber" value={formData.consumerNumber} onChange={handleChange} />
            <FormField label="Application Number" name="applicationNo" value={formData.applicationNo} onChange={handleChange} />
            <FormField label="Division" name="division" value={formData.division} onChange={handleChange} />
            <FormField label="Capacity (kW)" name="capacity" value={formData.capacity} onChange={handleChange} />
            <FormField label="Inspection Date" name="inspectionDate" type="date" value={formData.inspectionDate} onChange={handleChange} />
            <FormField label="Installation Date" name="installationDate" type="date" value={formData.installationDate} onChange={handleChange} />
          </div>
        </section>

        {/* CONSUMER/GRID DETAILS */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Grid & Consumer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Consumer Category" name="consumerCategory" value={formData.consumerCategory} onChange={handleChange} />
            <FormField label="Connection Type" name="connectionType" value={formData.connectionType} onChange={handleChange} />
            <FormField label="Contract Demand (kVA)" name="contractDemand" value={formData.contractDemand} onChange={handleChange} />
            <FormField label="Arrear (Rs)" name="arrear" value={formData.arrear} onChange={handleChange} />
            <FormField label="Developer Name" name="developerName" value={formData.developerName} onChange={handleChange} />
          </div>
        </section>

        {/* TRANSFORMER DETAILS */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Transformer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Transformer Capacity (kVA)" name="transformerCapacity" value={formData.transformerCapacity} onChange={handleChange} />
            <FormField label="Transformer Location" name="transformerLocation" value={formData.transformerLocation} onChange={handleChange} />
            <FormField label="Total Connected Capacity (kW)" name="totalConnectedCapacity" value={formData.totalConnectedCapacity} onChange={handleChange} />
            <FormField label="Transformer Adequate?" name="transformerAdequate" value={formData.transformerAdequate} onChange={handleChange} />
          </div>
        </section>

        {/* PLANT/INTERCONNECTION DETAILS */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Plant & Interconnection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Plant Capacity (kW)" name="plantCapacity" value={formData.plantCapacity} onChange={handleChange} />
            <FormField label="Plant Site" name="plantSite" value={formData.plantSite} onChange={handleChange} />
            <FormField label="Interconnection Type" name="interconnectionType" value={formData.interconnectionType} onChange={handleChange} />
            <FormField label="Single Line Approval?" name="singleLineApproval" value={formData.singleLineApproval} onChange={handleChange} />
          </div>
        </section>

        {/* INVERTER DETAILS */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Inverter Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Inverter Make" name="inverterMake" value={formData.inverterMake} onChange={handleChange} />
            <FormField label="Inverter Serial Number" name="inverterSerial" value={formData.inverterSerial} onChange={handleChange} />
            <FormField label="Inverter Capacity (kW)" name="inverterCapacity" value={formData.inverterCapacity} onChange={handleChange} />
            <FormField label="Inverter Voltage" name="inverterVoltage" value={formData.inverterVoltage} onChange={handleChange} />
            <FormField label="Anti-Islanding?" name="antiIslanding" value={formData.antiIslanding} onChange={handleChange} />
          </div>
        </section>

        {/* PANEL DETAILS */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Solar Panel Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Panel Make" name="panelMake" value={formData.panelMake} onChange={handleChange} />
            <FormField label="Panel Serial Number" name="panelSerial" value={formData.panelSerial} onChange={handleChange} />
            <FormField label="Panel Type" name="panelType" value={formData.panelType} onChange={handleChange} />
            <FormField label="Panel Capacity (W)" name="panelCapacity" value={formData.panelCapacity} onChange={handleChange} />
            <FormField label="Total Panels" name="totalPanels" value={formData.totalPanels} onChange={handleChange} />
            <FormField label="Total Array Capacity (kW)" name="totalArrayCapacity" value={formData.totalArrayCapacity} onChange={handleChange} />
          </div>
        </section>

        {/* EARTHING & SAFETY */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Earthing & Safety</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="DC Earthing" name="dcEarthing" value={formData.dcEarthing} onChange={handleChange} />
            <FormField label="AC Earthing" name="acEarthing" value={formData.acEarthing} onChange={handleChange} />
            <FormField label="AC/DC DB" name="acdcdb" value={formData.acdcdb} onChange={handleChange} />
            <FormField label="Manual Switch?" name="manualSwitch" value={formData.manualSwitch} onChange={handleChange} />
            <FormField label="Lightning Protection?" name="lightning" value={formData.lightning} onChange={handleChange} />
            <FormField label="SPD Installation?" name="spd" value={formData.spd} onChange={handleChange} />
            <FormField label="Relay Switch?" name="relaySwitch" value={formData.relaySwitch} onChange={handleChange} />
          </div>
        </section>

        {/* CERTIFICATIONS & APPROVALS */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Certifications & Approvals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Back Feeding?" name="backFeeding" value={formData.backFeeding} onChange={handleChange} />
            <FormField label="EIC Approval?" name="eicApproval" value={formData.eicApproval} onChange={handleChange} />
            <FormField label="Safety Certificate?" name="safetyCertificate" value={formData.safetyCertificate} onChange={handleChange} />
            <FormField label="Actual SLD Available?" name="actualSLD" value={formData.actualSLD} onChange={handleChange} />
            <FormField label="Test Report?" name="testReport" value={formData.testReport} onChange={handleChange} />
          </div>
        </section>

        {/* METER DETAILS */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Meter Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Total Meters" name="totalMeters" value={formData.totalMeters} onChange={handleChange} />
            <FormField label="Meter Make" name="meterMake" value={formData.meterMake} onChange={handleChange} />
            <FormField label="Meter Serial Number" name="meterSerial" value={formData.meterSerial} onChange={handleChange} />
            <FormField label="Meter Phase" name="meterPhase" value={formData.meterPhase} onChange={handleChange} />
            <FormField label="Meter Capacity (A)" name="meterCapacity" value={formData.meterCapacity} onChange={handleChange} />
            <FormField label="Meter Constant" name="meterConstant" value={formData.meterConstant} onChange={handleChange} />
          </div>
        </section>

        {/* FINAL ASSESSMENT */}
        <section className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Final Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Grid Satisfactory?" name="gridSatisfactory" value={formData.gridSatisfactory} onChange={handleChange} />
            <FormField label="Switch Provision?" name="switchProvision" value={formData.switchProvision} onChange={handleChange} />
            <FormField label="Operation & Maintenance?" name="operationMaintenance" value={formData.operationMaintenance} onChange={handleChange} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded p-3 focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
              rows="4"
              placeholder="Any additional remarks or observations..."
            />
          </div>
        </section>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={generatePDF}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Generate PDF Report
          </button>
        </div>

      </form>

    </div>

  );

}

function FormField({ label, name, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={label}
        value={value}
        onChange={onChange}
        className="w-full border border-slate-300 rounded p-3 focus:border-brand-500 focus:ring-1 focus:ring-brand-200"
      />
    </div>
  );
}