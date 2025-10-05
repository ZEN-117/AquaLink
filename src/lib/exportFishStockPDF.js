import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper functions for PDF generation
const addHeader = (doc) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Add logo/icon area
  doc.setFillColor(33, 150, 243); // Primary blue color
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Add title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AquaLink Fish Stock Report', 20, 20);
  
  // Add subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Complete Fish Stock Inventory', 20, 26);
  
  // Add date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Generated on: ${currentDate}`, pageWidth - 20, 20, { align: 'right' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
};

const addFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  // Add footer line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
  
  // Add page number
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
};

export const exportFishStockPDF = async (fishStocks) => {
  try {
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Add header
    addHeader(doc);
    
    // Add some space after header
    let yPosition = 50;
    
    // Add summary section
    const totalStock = fishStocks.reduce((sum, fish) => sum + fish.stock, 0);
    const inStockCount = fishStocks.filter(fish => fish.stock > 0).length;
    const outOfStockCount = fishStocks.filter(fish => fish.stock === 0).length;
    
    // Summary box
    doc.setFillColor(240, 248, 255);
    doc.rect(20, yPosition, 170, 25, 'F');
    doc.setDrawColor(33, 150, 243);
    doc.rect(20, yPosition, 170, 25, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Stock Summary', 25, yPosition + 8);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Fish Types: ${fishStocks.length}`, 25, yPosition + 15);
    doc.text(`Total Stock: ${totalStock} units`, 25, yPosition + 20);
    doc.text(`In Stock: ${inStockCount} types`, 100, yPosition + 15);
    doc.text(`Out of Stock: ${outOfStockCount} types`, 100, yPosition + 20);
    
    yPosition += 40;
    
    // Prepare data for table
    const tableData = fishStocks.map((fish, index) => [
      index + 1,
      fish.fishCode,
      fish.title,
      fish.stock,
      fish.stock > 0 ? 'In Stock' : 'Out of Stock'
    ]);
    
    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Fish Code', 'Title', 'Stock', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { cellWidth: 15 }, // #
        1: { cellWidth: 30 }, // Fish Code
        2: { cellWidth: 60 }, // Title
        3: { cellWidth: 25 }, // Stock
        4: { cellWidth: 30 }  // Status
      },
      margin: { left: 20, right: 20 },
      didDrawPage: function(data) {
        // Add footer to each page
        addFooter(doc);
      }
    });
    
    // Add images section if there are fish with images
    const fishWithImages = fishStocks.filter(fish => fish.image);
    if (fishWithImages.length > 0) {
      const finalY = doc.lastAutoTable?.finalY || yPosition + 100;
      let currentY = finalY + 20;
      
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 30;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(33, 150, 243);
      doc.setFont('helvetica', 'bold');
      doc.text('Fish Images', 20, currentY);
      currentY += 15;
      
      // Add images in a grid layout
      const imagesPerRow = 3;
      const imageWidth = 50;
      const imageHeight = 40;
      const spacing = 10;
      
      fishWithImages.forEach((fish, index) => {
        const row = Math.floor(index / imagesPerRow);
        const col = index % imagesPerRow;
        
        const x = 20 + col * (imageWidth + spacing);
        const y = currentY + row * (imageHeight + 30);
        
        // Check if we need a new page
        if (y + imageHeight > 250) {
          doc.addPage();
          currentY = 30;
          const newRow = Math.floor(index / imagesPerRow);
          const newY = currentY + newRow * (imageHeight + 30);
          
          // Add image
          try {
            doc.addImage(fish.image, 'JPEG', x, newY, imageWidth, imageHeight);
          } catch (error) {
            // If image fails to load, add a placeholder
            doc.setFillColor(240, 240, 240);
            doc.rect(x, newY, imageWidth, imageHeight, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text('Image', x + 20, newY + 20);
          }
          
          // Add fish name below image
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          const textWidth = doc.getTextWidth(fish.title);
          const textX = x + (imageWidth - textWidth) / 2;
          doc.text(fish.title, textX, newY + imageHeight + 5);
        } else {
          // Add image
          try {
            doc.addImage(fish.image, 'JPEG', x, y, imageWidth, imageHeight);
          } catch (error) {
            // If image fails to load, add a placeholder
            doc.setFillColor(240, 240, 240);
            doc.rect(x, y, imageWidth, imageHeight, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text('Image', x + 20, y + 20);
          }
          
          // Add fish name below image
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          const textWidth = doc.getTextWidth(fish.title);
          const textX = x + (imageWidth - textWidth) / 2;
          doc.text(fish.title, textX, y + imageHeight + 5);
        }
      });
    }
    
    // Save the PDF
    const fileName = `Fish_Stock_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};
