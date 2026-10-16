export type Industry = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  lat: number;
  lng: number;
  description: string;
};

export const industries: Industry[] = [
  {
    id: "banking",
    name: "Banking & Finance",
    shortName: "Banking",
    color: "#1e40af",
    lat: 6.4541,
    lng: 3.3895,
    description: "Marina, Broad Street, CMS area",
  },
  {
    id: "tech",
    name: "Tech & Startups",
    shortName: "Tech",
    color: "#7c3aed",
    lat: 6.4485,
    lng: 3.4305,
    description: "Ikoyi, around King's Tower and Heritage Place",
  },
  {
    id: "oilgas",
    name: "Oil & Gas",
    shortName: "Oil & Gas",
    color: "#b45309",
    lat: 6.4281,
    lng: 3.4219,
    description: "Victoria Island, Adeola Odeku and Akin Adesola",
  },
  {
    id: "law",
    name: "Law & Consulting",
    shortName: "Law",
    color: "#374151",
    lat: 6.4528,
    lng: 3.435,
    description: "Ikoyi, Kingsway and Awolowo Road",
  },
  {
    id: "media",
    name: "Media & Advertising",
    shortName: "Media",
    color: "#be185d",
    lat: 6.4312,
    lng: 3.4245,
    description: "Victoria Island",
  },
  {
    id: "government",
    name: "Government",
    shortName: "Govt",
    color: "#065f46",
    lat: 6.4498,
    lng: 3.3965,
    description: "Lagos Island, around Tafawa Balewa Square",
  },
  {
    id: "coworking",
    name: "Co-working & Freelancers",
    shortName: "Co-work",
    color: "#0f766e",
    lat: 6.435,
    lng: 3.428,
    description: "Victoria Island and Oniru",
  },
];
