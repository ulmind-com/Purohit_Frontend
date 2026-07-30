export interface ChalisaVerse {
  id: number;
  type: "doha" | "chaupai";
  title: string;
  lines: string[];
}

export const HANUMAN_CHALISA_VERSES: ChalisaVerse[] = [
  // Page 1: Opening Doha
  {
    id: 1,
    type: "doha",
    title: "Doha",
    lines: [
      "Shri Guru Charan Saroj Raj, Nija Manu Mukura Sudhari |",
      "Baranau Raghuvar Bimal Jasu, Jo Dayaku Phala Chari ||",
      "Budheeheen Tanu Jannike, Sumiro Pavan Kumara |",
      "Bal Buddhi Vidya Dehoo Mohee, Harahu Kalesh Vikaar ||"
    ]
  },
  // Page 2
  {
    id: 2,
    type: "chaupai",
    title: "Chaupai",
    lines: [
      "Jai Hanuman Gyan Gun Sagar |",
      "Jai Kapis Tihun Lok Ujagar ||",
      "Ram Doot Atulit Bal Dhama |",
      "Anjani Putra Pavan Sut Nama ||"
    ]
  },
  // Page 3
  {
    id: 3,
    type: "chaupai",
    title: "Chaupai",
    lines: [
      "Mahaveer Vikram Bajrangi |",
      "Kumati Nivaar Sumati Ke Sangi ||",
      "Kanchan Varan Viraaj Subesa |",
      "Kanan Kundal Kunchit Kesa ||"
    ]
  },
  // Page 4
  { id: 4, type: "chaupai", title: "Chaupai", lines: ["Haath Vajra Aur Dhwaja Viraje |", "Kaandhe Moonj Janeu Saaje ||", "Sankar Suvan Kesari Nandan |", "Tej Prataap Maha Jag Vandan ||"] },
  // Page 5
  { id: 5, type: "chaupai", title: "Chaupai", lines: ["Vidyavaan Guni Ati Chatur |", "Ram Kaj Karibe Ko Aatur ||", "Prabhu Charitra Sunibe Ko Rasiya |", "Ram Lakhan Sita Man Basiya ||"] },
  // Page 6
  { id: 6, type: "chaupai", title: "Chaupai", lines: ["Sukshma Roop Dhari Siyahi Dikhawa |", "Vikat Roop Dhari Lanka Jalawa ||", "Bheem Roop Dhari Asur Sanhare |", "Ramachandra Ke Kaaj Sanvare ||"] },
  // Page 7
  { id: 7, type: "chaupai", title: "Chaupai", lines: ["Laaye Sanjeevan Lakhan Jiyaye |", "Shri Raghuveer Harashi Ur Laye ||", "Raghupati Kinhi Bahut Badai |", "Tum Mam Priye Bharatahi Sam Bhai ||"] },
  // Page 8
  { id: 8, type: "chaupai", title: "Chaupai", lines: ["Sahas Badan Tumharo Jas Gaave |", "As Kahi Shripati Kanth Lagaave ||", "Sankadhik Brahmaadi Muneesa |", "Narad Sarad Sahit Aheesa ||"] },
  // Page 9
  { id: 9, type: "chaupai", title: "Chaupai", lines: ["Jam Kuber Digpaal Jahan Te |", "Kavi Kovid Kahi Sake Kahan Te ||", "Tum Upkar Sugreevahin Keenha |", "Ram Milaaye Rajpad Deenha ||"] },
  // Page 10
  { id: 10, type: "chaupai", title: "Chaupai", lines: ["Tumharo Mantra Vibheeshan Maana |", "Lankeshwar Bhaye Sab Jag Jana ||", "Yug Sahasra Yojan Par Bhanu |", "Leelyo Taahi Madhur Phal Janu ||"] },
  // Page 11
  { id: 11, type: "chaupai", title: "Chaupai", lines: ["Prabhu Mudrika Meli Mukh Maahi |", "Jaladhi Langhi Gaye Achraj Naahi ||", "Durgam Kaaj Jagat Ke Jete |", "Sugam Anugraha Tumhre Tete ||"] },
  // Page 12
  { id: 12, type: "chaupai", title: "Chaupai", lines: ["Ram Duaare Tum Rakhvare |", "Hoat Na Aagya Binu Paisare ||", "Sab Sukh Lahai Tumhari Sarna |", "Tum Rakshak Kaahu Ko Darnaa ||"] },
  // Page 13
  { id: 13, type: "chaupai", title: "Chaupai", lines: ["Aapan Tej Samharo Aapai |", "Teeno Lok Haank Te Kaanpe ||", "Bhoot Pisaach Nikat Nahi Aave |", "Mahaveer Jab Naam Sunave ||"] },
  // Page 14
  { id: 14, type: "chaupai", title: "Chaupai", lines: ["Naase Rog Harai Sab Peera |", "Japat Nirantar Hanumat Beera ||", "Sankat Te Hanuman Chudaave |", "Man Kram Vachan Dhyan Jo Lave ||"] },
  // Page 15
  { id: 15, type: "chaupai", title: "Chaupai", lines: ["Sab Par Ram Tapasvi Raja |", "Tin Ke Kaaj Sakal Tum Saaja ||", "Aur Manorath Jo Koi Laave |", "Soi Amit Jeevan Phal Paave ||"] },
  // Page 16
  { id: 16, type: "chaupai", title: "Chaupai", lines: ["Chaaro Yug Partaap Tumhara |", "Hai Parsiddha Jagat Ujiyara ||", "Saadhu Sant Ke Tum Rakhvare |", "Asur Nikandan Ram Dulare ||"] },
  // Page 17
  { id: 17, type: "chaupai", title: "Chaupai", lines: ["Ashta Siddhi Nav Nidhi Ke Daata |", "As Var Deen Janki Maata ||", "Ram Rasayan Tumhare Paasa |", "Sada Raho Raghupati Ke Daasa ||"] },
  // Page 18
  { id: 18, type: "chaupai", title: "Chaupai", lines: ["Tumhare Bhajan Ram Ko Paave |", "Janam Janam Ke Dukh Bisraave ||", "Ant Kaal Raghuvar Pur Jai |", "Jahan Janam Hari Bhakt Kahai ||"] },
  // Page 19
  { id: 19, type: "chaupai", title: "Chaupai", lines: ["Aur Devta Chitt Na Dharai |", "Hanumant Sei Sarv Sukh Karai ||", "Sankat Kate Mite Sab Peera |", "Jo Sumirai Hanumat Balbeera ||"] },
  // Page 20
  { id: 20, type: "chaupai", title: "Chaupai", lines: ["Jai Jai Jai Hanuman Gosai |", "Kripa Karahu Guru Dev Ki Nai ||", "Jo Sat Baar Paath Kar Koi |", "Chhutahi Bandi Maha Sukh Hoi ||"] },
  // Page 21
  { id: 21, type: "chaupai", title: "Chaupai", lines: ["Jo Yeh Padhe Hanuman Chalisa |", "Hoye Siddhi Sakhi Gaureesa ||", "Tulsidas Sada Hari Chera |", "Keejai Nath Hriday Mah Dera ||"] },
  // Page 22: Closing Doha 1
  { id: 22, type: "doha", title: "Doha", lines: ["Pavan Tanay Sankat Haran, Mangal Murti Roop |", "Ram Lakhan Sita Sahit, Hriday Basahu Sur Bhoop ||"] },
  // Page 23: Closing
  { id: 23, type: "doha", title: "Doha", lines: ["\"Siyavar Ramchandra Ki Jai\"", "\"Pavan Sut Hanuman Ki Jai\"", "\"Bol Siya Pati Ram Chandra Ki Jai\""] }
];

export const MILESTONES = [3, 7, 11, 21, 40, 51, 75, 100, 108, 365];
