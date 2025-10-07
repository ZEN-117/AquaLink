import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportUsersPDF = async (users = []) => {
  try {
    const doc = new jsPDF("p", "mm", "a4");

    const title = "User Management Report";
    const generatedOn = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text(title, 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedOn}`, 20, 28);

    const tableRows = (users || []).map((u, index) => [
      index + 1,
      `${(u.firstName || "").trim()} ${(u.lastName || "").trim()}`.trim(),
      u.email || "",
      u.role || "",
      u.isBlocked ? "Inactive" : "Active",
      u.isEmailVerified ? "Yes" : "No",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Name", "Email", "Role", "Status", "Email Verified"]],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [248, 249, 250] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 45 },
        2: { cellWidth: 55 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
      },
      margin: { left: 15, right: 15 },
    });

    const fileName = `User_Management_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error("Error generating Users PDF:", error);
    return { success: false, error: error.message };
  }
};

export default exportUsersPDF;


