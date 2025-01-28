import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

const App = () => {
  // User input fields
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    amount: "",
    traceNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    notes: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Generate a structured PDF
  const generatePDF = async () => {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]); // Adjusted size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Colors
    const black = rgb(0, 0, 0);
    const gold = rgb(0.8, 0.6, 0.1);

    // Load background image (stored locally in /public folder)
    const imageUrl = '/Qmbg.jpg'; // Path to local image
    const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const img = await pdfDoc.embedJpg(imageBytes); // Use embedJpg() for JPG files

    // Draw background image (full-page size)
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: width,
      height: height,
      // opacity: 0.3, // Adjust transparency
    });

    // Section Titles
    page.drawText("RECIPIENT INFORMATION", { x: 160, y: height - 180, size: 24, font, color: black });
    page.drawText("SENDER INFORMATION", { x: 180, y: height - 430, size: 24, font, color: black });
    page.drawText("NOTES (if any)", { x: 210, y: height - 580, size: 28, font, color: black });

    // Table settings
    const startX = 50;
    const startY = height - 220;
    const rowHeight = 25;
    const col1Width = 250;
    const col2Width = 250;

    // Draw recipient fields with borders
    const labels = [
      "DESTINATION BANK NAME",
      "DESTINATION ACCOUNT NUMBER",
      "AMOUNT",
      "TRACE NUMBER",
      "RECIPIENT’S FIRST NAME",
      "RECIPIENT’S LAST NAME",
      "RECIPIENT’S EMAIL ADDRESS",
    ];

    labels.forEach((label, i) => {
      const yPos = startY - i * rowHeight;
      
      // Draw field label column
      page.drawRectangle({ x: startX, y: yPos, width: col1Width, height: rowHeight, borderColor: black, borderWidth: 1 });
      page.drawText(label, { x: startX + 10, y: yPos + 7, size: 12, font, color: black });

      // Draw answer column
      page.drawRectangle({ x: startX + col1Width, y: yPos, width: col2Width, height: rowHeight, borderColor: black, borderWidth: 1 });
      page.drawText(formData[Object.keys(formData)[i]], { x: startX + col1Width + 10, y: yPos + 7, size: 12, font, color: black });
    });

    // Sender Information (Pre-filled)
    const senderLabels = ["SENDER’S FIRST NAME", "SENDER’S LAST NAME", "SENDER’S EMAIL ADDRESS"];
    const senderValues = ["Quantum Metal Digital Solutions Inc.", "QMDSI", "info@qmdsi.com"];

    senderLabels.forEach((label, i) => {
      const yPos = height - 470 - i * rowHeight;
      
      // Draw sender label column
      page.drawRectangle({ x: startX, y: yPos, width: col1Width, height: rowHeight, borderColor: black, borderWidth: 1 });
      page.drawText(label, { x: startX + 10, y: yPos + 7, size: 12, font, color: black });

      // Draw sender value column
      page.drawRectangle({ x: startX + col1Width, y: yPos, width: col2Width, height: rowHeight, borderColor: black, borderWidth: 1 });
      page.drawText(senderValues[i], { x: startX + col1Width + 10, y: yPos + 7, size: 12, font, regularFont, color: black });
    });

    // Notes Section (Multiline)
    const notesY = height - 690;
    page.drawRectangle({ x: startX, y: notesY, width: col1Width + col2Width, height: 100, borderColor: black, borderWidth: 1 });
    page.drawText(formData.notes, { x: startX + 10, y: notesY + 80, size: 12, font: regularFont, color: black });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    // saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "filled-form.pdf");

  const recipientLastName = formData.lastName || "Unknown";
  const recipientFirstName = formData.firstName || "Unknown";
  const traceNumber = formData.traceNumber || "Unknown";
  const fileName = `${recipientLastName}," "${recipientFirstName}_${traceNumber}.pdf`;

  // Save the PDF with the generated filename
  saveAs(new Blob([pdfBytes], { type: "application/pdf" }), fileName);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">GCA Endorsement Form</h1>

        {/* Input fields */}
        {Object.keys(formData).map((key) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {key.replace(/([A-Z])/g, " $1").toUpperCase()}:
            </label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}

        {/* Generate PDF Button */}
        <button
          onClick={generatePDF}
          className="w-full bg-blue-500 text-white p-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Generate PDF
        </button>
      </div>
    </div>
  );
};

export default App;
