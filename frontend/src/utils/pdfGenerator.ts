import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateTicketPDF = (bookingData: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const { flight, passengers, contactInfo, totalPrice, refId, pnr, bookingDate } = bookingData;

  // Colors
  const primaryColor = '#1e3a8a'; // blue-900
  const lightBlue = '#dbeafe';
  
  // Header - Logo Area
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, 0, 210, 40, 'F');
  
  // Logo text (since we can't easily embed images)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text('NASIM AIR', 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('هواپیمایی نسیم', 105, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text('E-Ticket / Boarding Pass', 105, 33, { align: 'center' });

  // Booking Reference
  doc.setFontSize(10);
  doc.setTextColor(100);
  let yPos = 50;
  
  doc.text(`PNR: ${pnr}`, 15, yPos);
  doc.text(`Booking Date: ${new Date(bookingDate).toLocaleDateString('fa-IR')}`, 140, yPos);
  
  // Flight Information Box
  yPos += 10;
  doc.setFillColor(219, 234, 254); // light blue
  doc.rect(15, yPos, 180, 50, 'F');
  doc.setDrawColor(30, 58, 138);
  doc.rect(15, yPos, 180, 50, 'S');
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('FLIGHT INFORMATION', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setTextColor(0);
  
  // From - To
  doc.setFontSize(16);
  doc.text(flight.origin, 30, yPos, { align: 'center' });
  doc.text('→', 105, yPos, { align: 'center' });
  doc.text(flight.destination, 180, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Departure: ${flight.departureTime}`, 30, yPos, { align: 'center' });
  doc.text(`Arrival: ${flight.arrivalTime}`, 180, yPos, { align: 'center' });
  
  yPos += 8;
  doc.text(`Flight: ${flight.flightNumber}`, 30, yPos, { align: 'center' });
  doc.text(`Date: ${flight.date}`, 105, yPos, { align: 'center' });
  doc.text(`Class: ${flight.class}`, 180, yPos, { align: 'center' });

  // Passenger Information
  yPos += 20;
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('PASSENGER INFORMATION', 15, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  passengers.forEach((passenger: any, index: number) => {
    const passengerType = passenger.type === 'adult' ? 'Adult' : passenger.type === 'child' ? 'Child' : 'Infant';
    const gender = passenger.gender === 'male' ? 'Mr.' : 'Ms.';
    
    doc.setFillColor(249, 250, 251);
    doc.rect(15, yPos, 180, 12, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(15, yPos, 180, 12, 'S');
    
    yPos += 8;
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${gender} ${passenger.firstName} ${passenger.lastName}`, 20, yPos);
    doc.text(`${passengerType}`, 120, yPos);
    doc.text(`ID: ${passenger.nationalId || passenger.passportNumber || 'N/A'}`, 150, yPos);
    yPos += 6;
  });

  // Contact Information
  yPos += 8;
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('CONTACT INFORMATION', 15, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Mobile: +98${contactInfo.phone}`, 15, yPos);
  yPos += 6;
  doc.text(`Email: ${contactInfo.email}`, 15, yPos);

  // Payment Information
  yPos += 12;
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('PAYMENT DETAILS', 15, yPos);
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Transaction Ref: ${refId}`, 15, yPos);
  yPos += 6;
  doc.text(`Amount Paid: ${totalPrice.toLocaleString('en-US')} Toman`, 15, yPos);
  yPos += 6;
  doc.text(`Payment Status: PAID`, 15, yPos);
  doc.setTextColor(0, 128, 0);
  doc.text('✓', 60, yPos);

  // Barcode area (simulated with lines)
  yPos += 15;
  doc.setDrawColor(0);
  for (let i = 0; i < 50; i++) {
    const x = 15 + (i * 3.5);
    const height = Math.random() > 0.5 ? 15 : 10;
    doc.setLineWidth(1);
    doc.line(x, yPos, x, yPos + height);
  }
  
  yPos += 20;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(pnr, 105, yPos, { align: 'center' });

  // Footer
  yPos = 280;
  doc.setFillColor(30, 58, 138);
  doc.rect(0, yPos, 210, 17, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('NASIM AIR - Premium Travel Experience', 105, yPos + 6, { align: 'center' });
  doc.text('24/7 Support: +98 21 1234 5678 | www.nasimair.com', 105, yPos + 12, { align: 'center' });

  // Important Notice
  doc.setFontSize(8);
  doc.setTextColor(100);
  yPos = 270;
  doc.text('* Please arrive at the airport at least 2 hours before departure', 15, yPos);
  doc.text('* Valid ID/Passport required for boarding', 15, yPos + 4);

  // Save PDF
  const fileName = `Nasim-Air-Ticket-${pnr}-${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

