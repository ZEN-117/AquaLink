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
  doc.text('AquaLink Gigs Report', 20, 20);
  
  // Add subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Complete Gigs & Products Inventory', 20, 26);
  
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

export const exportGigsPDF = async (gigs, fishStocks) => {
  try {
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Add header
    addHeader(doc);
    
    // Add some space after header
    let yPosition = 50;
    
    // Add summary section
    const totalGigs = gigs.length;
    const inStockGigs = gigs.filter(gig => {
      const matched = fishStocks.find(f => f.fishCode === gig.fishCode);
      const stock = matched ? matched.stock : 0;
      return stock > 0;
    }).length;
    const outOfStockGigs = totalGigs - inStockGigs;
    const totalValue = gigs.reduce((sum, gig) => {
      const matched = fishStocks.find(f => f.fishCode === gig.fishCode);
      const stock = matched ? matched.stock : 0;
      return sum + (gig.price * stock);
    }, 0);
    const averagePrice = gigs.length > 0 ? gigs.reduce((sum, gig) => sum + gig.price, 0) / gigs.length : 0;
    
    // Summary box
    doc.setFillColor(240, 248, 255);
    doc.rect(20, yPosition, 170, 35, 'F');
    doc.setDrawColor(33, 150, 243);
    doc.rect(20, yPosition, 170, 35, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Gigs Summary', 25, yPosition + 8);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Gigs: ${totalGigs}`, 25, yPosition + 15);
    doc.text(`In Stock: ${inStockGigs} gigs`, 25, yPosition + 20);
    doc.text(`Out of Stock: ${outOfStockGigs} gigs`, 25, yPosition + 25);
    doc.text(`Average Price: Rs. ${averagePrice.toFixed(2)}`, 100, yPosition + 15);
    doc.text(`Total Value: Rs. ${totalValue.toFixed(2)}`, 100, yPosition + 20);
    doc.text(`Success Rate: ${totalGigs > 0 ? ((inStockGigs / totalGigs) * 100).toFixed(1) : 0}%`, 100, yPosition + 25);
    
    yPosition += 50;
    
    // Prepare data for table
    const tableData = gigs.map((gig, index) => {
      const matched = fishStocks.find(f => f.fishCode === gig.fishCode);
      const currentStock = matched ? matched.stock : 0;
      const status = currentStock > 0 ? 'In Stock' : 'Out of Stock';
      const stockValue = gig.price * currentStock;
      
      return [
        index + 1,
        gig.productCode,
        gig.title,
        `Rs. ${gig.price.toFixed(2)}`,
        currentStock,
        status,
        `Rs. ${stockValue.toFixed(2)}`
      ];
    });
    
    // Add table
    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Product Code', 'Gig Title', 'Price', 'Stock', 'Status', 'Stock Value']],
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
        0: { cellWidth: 12 }, // #
        1: { cellWidth: 25 }, // Product Code
        2: { cellWidth: 50 }, // Gig Title
        3: { cellWidth: 20 }, // Price
        4: { cellWidth: 15 }, // Stock
        5: { cellWidth: 20 }, // Status
        6: { cellWidth: 25 }  // Stock Value
      },
      margin: { left: 20, right: 20 },
      didDrawPage: function(data) {
        // Add footer to each page
        addFooter(doc);
      }
    });
    
    // Add images section if there are gigs with images
    const gigsWithImages = gigs.filter(gig => gig.image);
    if (gigsWithImages.length > 0) {
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
      doc.text('Gig Images', 20, currentY);
      currentY += 15;
      
      // Add images in a grid layout
      const imagesPerRow = 3;
      const imageWidth = 50;
      const imageHeight = 40;
      const spacing = 10;
      
      gigsWithImages.forEach((gig, index) => {
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
            doc.addImage(gig.image, 'JPEG', x, newY, imageWidth, imageHeight);
          } catch (error) {
            // If image fails to load, add a placeholder
            doc.setFillColor(240, 240, 240);
            doc.rect(x, newY, imageWidth, imageHeight, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text('Image', x + 20, newY + 20);
          }
          
          // Add gig details below image
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          const textWidth = doc.getTextWidth(gig.title);
          const textX = x + (imageWidth - textWidth) / 2;
          doc.text(gig.title, textX, newY + imageHeight + 5);
          
          // Add price below title
          doc.setFontSize(7);
          doc.setTextColor(33, 150, 243);
          const priceText = `Rs. ${gig.price.toFixed(2)}`;
          const priceWidth = doc.getTextWidth(priceText);
          const priceX = x + (imageWidth - priceWidth) / 2;
          doc.text(priceText, priceX, newY + imageHeight + 12);
        } else {
          // Add image
          try {
            doc.addImage(gig.image, 'JPEG', x, y, imageWidth, imageHeight);
          } catch (error) {
            // If image fails to load, add a placeholder
            doc.setFillColor(240, 240, 240);
            doc.rect(x, y, imageWidth, imageHeight, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text('Image', x + 20, y + 20);
          }
          
          // Add gig details below image
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          const textWidth = doc.getTextWidth(gig.title);
          const textX = x + (imageWidth - textWidth) / 2;
          doc.text(gig.title, textX, y + imageHeight + 5);
          
          // Add price below title
          doc.setFontSize(7);
          doc.setTextColor(33, 150, 243);
          const priceText = `Rs. ${gig.price.toFixed(2)}`;
          const priceWidth = doc.getTextWidth(priceText);
          const priceX = x + (imageWidth - priceWidth) / 2;
          doc.text(priceText, priceX, y + imageHeight + 12);
        }
      });
    }
    
    // Add performance insights section
    const finalY = doc.lastAutoTable?.finalY || yPosition + 100;
    let currentY = finalY + 20;
    
    // Check if we need a new page
    if (currentY > 200) {
      doc.addPage();
      currentY = 30;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Insights', 20, currentY);
    currentY += 15;
    
    // Performance box
    doc.setFillColor(248, 250, 252);
    doc.rect(20, currentY, 170, 40, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, currentY, 170, 40, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const topPerformer = gigs.reduce((top, gig) => {
      const matched = fishStocks.find(f => f.fishCode === gig.fishCode);
      const stock = matched ? matched.stock : 0;
      const value = gig.price * stock;
      return value > top.value ? { title: gig.title, value } : top;
    }, { title: 'N/A', value: 0 });
    
    const lowStockGigs = gigs.filter(gig => {
      const matched = fishStocks.find(f => f.fishCode === gig.fishCode);
      const stock = matched ? matched.stock : 0;
      return stock > 0 && stock <= 5;
    }).length;
    
    doc.text(`Top Performer: ${topPerformer.title} (Rs. ${topPerformer.value.toFixed(2)})`, 25, currentY + 10);
    doc.text(`Low Stock Gigs: ${lowStockGigs} gigs need restocking`, 25, currentY + 18);
    doc.text(`Inventory Health: ${totalGigs > 0 ? ((inStockGigs / totalGigs) * 100).toFixed(1) : 0}%`, 25, currentY + 26);
    doc.text(`Recommendation: ${outOfStockGigs > 0 ? 'Restock out-of-stock items' : 'All gigs are well stocked'}`, 25, currentY + 34);
    
    // Save the PDF
    const fileName = `Gigs_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};
