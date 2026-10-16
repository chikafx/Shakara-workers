export type Company = {
  id: string;
  name: string;
  industryId: string;
  area: "Marina" | "Victoria Island" | "Ikoyi" | "Oniru";
  shortLocation: string;
  lat: number;
  lng: number;
  officeFeature: string;
};

export const companies: Company[] = [
  { id: "firstbank", name: "First Bank", industryId: "banking", area: "Marina", shortLocation: "35 Marina", lat: 6.4545, lng: 3.3898, officeFeature: "Marina vault wall" },
  { id: "uba", name: "UBA", industryId: "banking", area: "Marina", shortLocation: "57 Marina", lat: 6.4538, lng: 3.3915, officeFeature: "Africa trade globe" },
  { id: "sterling", name: "Sterling Bank", industryId: "banking", area: "Marina", shortLocation: "20 Marina", lat: 6.4529, lng: 3.3928, officeFeature: "Digital finance ticker" },
  { id: "unionbank", name: "Union Bank", industryId: "banking", area: "Marina", shortLocation: "36 Marina", lat: 6.4533, lng: 3.3907, officeFeature: "Heritage banking arch" },
  { id: "gtbank", name: "GTBank", industryId: "banking", area: "Victoria Island", shortLocation: "Akin Adesola", lat: 6.4315, lng: 3.4225, officeFeature: "Innovation lounge" },
  { id: "zenith", name: "Zenith Bank", industryId: "banking", area: "Victoria Island", shortLocation: "Ajose Adeogun", lat: 6.4298, lng: 3.4198, officeFeature: "Executive skyline model" },
  { id: "access", name: "Access Bank", industryId: "banking", area: "Victoria Island", shortLocation: "Victoria Island", lat: 6.4305, lng: 3.424, officeFeature: "Connected finance grid" },
  { id: "stanbic", name: "Stanbic IBTC", industryId: "banking", area: "Victoria Island", shortLocation: "Walter Carrington", lat: 6.433, lng: 3.4175, officeFeature: "Investment performance wall" },
  { id: "standardchartered", name: "Standard Chartered", industryId: "banking", area: "Victoria Island", shortLocation: "Ahmadu Bello Way", lat: 6.4345, lng: 3.421, officeFeature: "Global markets globe" },
  { id: "teknowledge", name: "TeKnowledge", industryId: "tech", area: "Oniru", shortLocation: "Chief Yesufu Abiodun Oniru Rd", lat: 6.4308, lng: 3.4545, officeFeature: "Cloud server rack" },
  { id: "meta", name: "Meta", industryId: "tech", area: "Ikoyi", shortLocation: "King's Tower", lat: 6.4518, lng: 3.4345, officeFeature: "Social connections sculpture" },
  { id: "microsoft", name: "Microsoft", industryId: "tech", area: "Ikoyi", shortLocation: "Alfred Rewane", lat: 6.4525, lng: 3.4358, officeFeature: "Developer collaboration board" },
  { id: "google", name: "Google", industryId: "tech", area: "Ikoyi", shortLocation: "Heritage Place", lat: 6.4505, lng: 3.432, officeFeature: "Search data wall" },
  { id: "flutterwave", name: "Flutterwave", industryId: "tech", area: "Ikoyi", shortLocation: "King's Tower", lat: 6.4512, lng: 3.4338, officeFeature: "Payments route display" },
  { id: "amazon", name: "Amazon", industryId: "tech", area: "Victoria Island", shortLocation: "Akin Adesola", lat: 6.4328, lng: 3.4185, officeFeature: "Cloud operations stack" },
  { id: "fincra", name: "Fincra", industryId: "tech", area: "Ikoyi", shortLocation: "Ikoyi", lat: 6.4495, lng: 3.4365, officeFeature: "Fintech integration board" },
  { id: "oando", name: "Oando", industryId: "oilgas", area: "Victoria Island", shortLocation: "Ajose Adeogun", lat: 6.4302, lng: 3.4205, officeFeature: "Energy trading display" },
  { id: "seplat", name: "Seplat Energy", industryId: "oilgas", area: "Ikoyi", shortLocation: "Lord Lugard Ave", lat: 6.4535, lng: 3.431, officeFeature: "Offshore platform model" },
  { id: "conoil", name: "Conoil", industryId: "oilgas", area: "Marina", shortLocation: "Bull Plaza", lat: 6.4548, lng: 3.3885, officeFeature: "Distribution pipeline" },
  { id: "total", name: "TotalEnergies", industryId: "oilgas", area: "Victoria Island", shortLocation: "Victoria Island", lat: 6.4295, lng: 3.4235, officeFeature: "Renewables control panel" },
  { id: "aluko", name: "Aluko & Oyebode", industryId: "law", area: "Ikoyi", shortLocation: "Murtala Muhammed Drive", lat: 6.454, lng: 3.438, officeFeature: "Legal library wall" },
  { id: "olaniwun", name: "Olaniwun Ajayi", industryId: "law", area: "Ikoyi", shortLocation: "Banana Island", lat: 6.4565, lng: 3.442, officeFeature: "Arbitration suite" },
  { id: "templars", name: "Templars", industryId: "law", area: "Victoria Island", shortLocation: "The Octagon", lat: 6.431, lng: 3.4255, officeFeature: "Case strategy wall" },
  { id: "pwc", name: "PwC", industryId: "law", area: "Victoria Island", shortLocation: "Ligali Ayorinde", lat: 6.4275, lng: 3.428, officeFeature: "Advisory dashboard" },
  { id: "aelex", name: "Aelex", industryId: "law", area: "Ikoyi", shortLocation: "Kingsway Road", lat: 6.45, lng: 3.4375, officeFeature: "Deal room library" },
  { id: "silverbird", name: "Silverbird", industryId: "media", area: "Victoria Island", shortLocation: "Silverbird Galleria", lat: 6.434, lng: 3.4245, officeFeature: "Broadcast control studio" },
];