import { jsPDF } from 'jspdf';
import { cities } from '../data/cities';

export const generateTicketPDF = (bookingData: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const { flight, passengers, contactInfo, totalPrice, refId, pnr, bookingDate } = bookingData;

  // Convert city names to English
  const getEnglishCityName = (cityName: string): string => {
    // Try to find city by Persian name
    const city = cities.find(c => c.nameFa === cityName || c.name === cityName || c.code === cityName);
    return city ? city.name.toUpperCase() : cityName.toUpperCase();
  };
  
  const originEn = getEnglishCityName(flight.origin);
  const destinationEn = getEnglishCityName(flight.destination);

  // Colors
  const primaryColor = [30, 58, 138]; // blue-900
  const lightBlue = [219, 234, 254];
  const white = [255, 255, 255];
  const gray = [100, 100, 100];
  
  // Header - Logo Area
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Logo text - Only English
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('NASIM AIR', 105, 17, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('NASIM AIRLINE', 105, 26, { align: 'center' });
  doc.setFontSize(10);
  doc.text('E-TICKET / BOARDING PASS', 105, 32, { align: 'center' });

  // Booking Reference
  let yPos = 45;
  doc.setFontSize(9);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.setFont('helvetica', 'bold');
  
  doc.text(`PNR: ${pnr}`, 15, yPos);
  doc.text(`Booking: ${new Date(bookingDate).toLocaleDateString('en-US')}`, 15, yPos + 5);
  doc.text(`Transaction: ${refId}`, 195, yPos, { align: 'right' });
  
  // Flight Information Box
  yPos += 12;
  doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
  doc.rect(15, yPos, 180, 42, 'F');
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, 180, 42, 'S');
  
  yPos += 7;
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('FLIGHT INFORMATION', 105, yPos, { align: 'center' });
  
  // From - To - Large display (English names)
  yPos += 9;
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text(originEn, 42, yPos, { align: 'center' });
  doc.setFontSize(18);
  doc.text('-->', 105, yPos, { align: 'center' });
  doc.setFontSize(22);
  doc.text(destinationEn, 168, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Departure: ${flight.departureTime}`, 42, yPos, { align: 'center' });
  doc.text(`Arrival: ${flight.arrivalTime}`, 168, yPos, { align: 'center' });
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setTextColor(gray[0], gray[1], gray[2]);
  doc.text(`Flight: ${flight.flightNumber}`, 42, yPos, { align: 'center' });
  doc.text(`${flight.date}`, 105, yPos, { align: 'center' });
  doc.text(`Class: Economy`, 168, yPos, { align: 'center' });

  // Passenger Information - More spacing from flight box
  yPos += 18;
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('PASSENGER INFORMATION', 15, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  passengers.forEach((passenger: any, index: number) => {
    const passengerType = passenger.type === 'adult' ? 'Adult' : passenger.type === 'child' ? 'Child' : 'Infant';
    const gender = passenger.gender === 'male' ? 'Mr.' : 'Ms.';
    
    // Background box for each passenger
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPos, 180, 11, 'F');
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos, 180, 11, 'S');
    
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const fullName = `${index + 1}. ${gender} ${passenger.firstName.toUpperCase()} ${passenger.lastName.toUpperCase()}`;
    doc.text(fullName, 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`[${passengerType}]`, 115, yPos);
    doc.text(`ID: ${passenger.nationalId || passenger.passportNumber || 'N/A'}`, 145, yPos);
    yPos += 6;
  });

  // Contact Information - More spacing
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACT INFORMATION', 15, yPos);
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mobile Phone: +98 ${contactInfo.phone}`, 15, yPos);
  yPos += 5;
  doc.text(`Email Address: ${contactInfo.email}`, 15, yPos);

  // Payment Information - More spacing
  yPos += 12;
  doc.setFontSize(12);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', 15, yPos);
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Transaction Ref: ${refId}`, 15, yPos);
  yPos += 5;
  doc.text(`Total Amount: ${totalPrice.toLocaleString('en-US')} IRR`, 15, yPos);
  yPos += 5;
  doc.setTextColor(0, 150, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS: CONFIRMED & PAID', 15, yPos);
  doc.setFillColor(0, 200, 0);
  doc.circle(75, yPos - 1.5, 1.5, 'F');

  // Barcode area
  yPos += 12;
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, 180, 20, 'F');
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.rect(15, yPos, 180, 20, 'S');
  
  // Barcode simulation
  yPos += 4;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  for (let i = 0; i < 50; i++) {
    const x = 25 + (i * 3.2);
    const height = (i % 3 === 0) ? 10 : (i % 2 === 0) ? 8 : 6;
    doc.line(x, yPos, x, yPos + height);
  }
  
  yPos += 13;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('courier', 'bold');
  doc.text(pnr, 105, yPos, { align: 'center' });

  // Important Instructions
  yPos += 10;
  doc.setFillColor(255, 250, 230);
  doc.rect(15, yPos, 180, 22, 'F');
  doc.setDrawColor(200, 180, 100);
  doc.setLineWidth(0.5);
  doc.rect(15, yPos, 180, 22, 'S');
  
  yPos += 5;
  doc.setFontSize(9);
  doc.setTextColor(150, 100, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT NOTICES:', 20, yPos);
  
  yPos += 5;
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text('* Arrive at airport 2 hours before departure', 20, yPos);
  yPos += 4;
  doc.text('* Valid ID/Passport required for boarding', 20, yPos);
  yPos += 4;
  doc.text('* Baggage: 20kg checked + 7kg cabin', 20, yPos);

  // Footer
  const footerY = 277;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, footerY, 210, 20, 'F');
  
  doc.setTextColor(white[0], white[1], white[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NASIM AIR - Your Wings to Success', 105, footerY + 6, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Support: +98 21 1234 5678 | www.nasimair.com', 105, footerY + 11, { align: 'center' });
  doc.text('Tehran, Iran | License No: IR-NA-2024', 105, footerY + 15, { align: 'center' });

  // Save PDF
  const fileName = `Nasim-Air-Ticket-${pnr}-${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

