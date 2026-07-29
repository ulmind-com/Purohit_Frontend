export type TempleType = 'SATI_PITH' | 'POPULAR';

export interface Temple {
  id: string;
  name: string;
  location: string;
  type: TempleType;
  deity_image_url: string;
  description: string;
}

export const MOCK_TEMPLES: Temple[] = [
  {
    id: "amarnath",
    name: "Amarnath Temple",
    location: "Jammu & Kashmir",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Amarnath.jpg",
    description: "Revered as a Maha Shakti Peetha where the throat of Goddess Sati fell."
  },
  {
    id: "ambaji",
    name: "Ambaji Temple",
    location: "Gujarat",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Ambaji.jpg",
    description: "Revered as a Maha Shakti Peetha where the heart of Goddess Sati fell."
  },
  {
    id: "ambika",
    name: "Ambika Temple",
    location: "Bharatpur, Rajasthan",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Ambika.jpg",
    description: "Revered as a Maha Shakti Peetha where the left foot of Goddess Sati fell."
  },
  {
    id: "aparna",
    name: "Aparna Temple",
    location: "Bogra, Bangladesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Aparna.jpg",
    description: "Revered as a Maha Shakti Peetha where the anklet/ribs of left chest/right eye of Goddess Sati fell."
  },
  {
    id: "avanti",
    name: "Avanti Temple",
    location: "Ujjain, Madhya Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Avanti.jpg",
    description: "Revered as a Maha Shakti Peetha where the upper lips/elbow of Goddess Sati fell."
  },
  {
    id: "bahula",
    name: "Bahula Temple",
    location: "West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Bahula.jpg",
    description: "Revered as a Maha Shakti Peetha where the left arm of Goddess Sati fell."
  },
  {
    id: "bhavani",
    name: "Bhavani Temple",
    location: "Chittagong, Bangladesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Bhavani.jpg",
    description: "Revered as a Maha Shakti Peetha where the right arm of Goddess Sati fell."
  },
  {
    id: "bhramari",
    name: "Bhramari Temple",
    location: "Nashik, Maharashtra",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Bhramari.jpg",
    description: "Revered as a Maha Shakti Peetha where the chin of Goddess Sati fell."
  },
  {
    id: "bhramri",
    name: "Bhramri Temple",
    location: "Jalpaiguri, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Bhramri.jpg",
    description: "Revered as a Maha Shakti Peetha where the left leg of Goddess Sati fell."
  },
  {
    id: "biraja",
    name: "Biraja Temple",
    location: "Jajpur, Odisha",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Biraja.jpg",
    description: "Revered as a Maha Shakti Peetha where the navel of Goddess Sati fell."
  },
  {
    id: "dakshayani",
    name: "Dakshayani Temple",
    location: "Burang, Tibet",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Shakti_Dakshayani.jpg",
    description: "Revered as a Maha Shakti Peetha where the right palm of Goddess Sati fell."
  },
  {
    id: "dakshina-kali",
    name: "Dakshina Kali Temple",
    location: "Kolkata, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Dakshina_Kali.jpg",
    description: "Revered as a Maha Shakti Peetha where the right toes of Goddess Sati fell."
  },
  {
    id: "devgarbha",
    name: "Devgarbha Temple",
    location: "Birbhum, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Devgarbha.jpg",
    description: "Revered as a Maha Shakti Peetha where the bone of Goddess Sati fell."
  },
  {
    id: "gandaki-chandi",
    name: "Gandaki Chandi Temple",
    location: "Mustang, Nepal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Gandaki-Chandi-Shakti-Peeth.jpg",
    description: "Revered as a Maha Shakti Peetha where the nepal cheek of Goddess Sati fell."
  },
  {
    id: "gayatri",
    name: "Gayatri Temple",
    location: "Pushkar, Rajasthan",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Gayatri_Manibandh.jpg",
    description: "Revered as a Maha Shakti Peetha where the wrist of Goddess Sati fell."
  },
  {
    id: "hinglaj",
    name: "Hinglaj Temple",
    location: "Pakistan",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Hinglaj.jpg",
    description: "Revered as a Maha Shakti Peetha where the head of Goddess Sati fell."
  },
  {
    id: "jai-durga",
    name: "Jai Durga Temple",
    location: "Deoghar, Jharkhand",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Jai_Durga.jpg",
    description: "Revered as a Maha Shakti Peetha where the ear of Goddess Sati fell."
  },
  {
    id: "jayanti",
    name: "Jayanti Temple",
    location: "West Jaintia Hills, Meghalaya",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Jayanti.jpg",
    description: "Revered as a Maha Shakti Peetha where the left thigh of Goddess Sati fell."
  },
  {
    id: "jeshoreshwari",
    name: "Jeshoreshwari Temple",
    location: "Khulna, Bangladesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Jeshoreshwari.jpg",
    description: "Revered as a Maha Shakti Peetha where the palm of Goddess Sati fell."
  },
  {
    id: "jogulamba-devi",
    name: "Jogulamba Devi Temple",
    location: "Alampur, Gadwal district",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Sri_Parvat_Sakthi_Peeth.jpg",
    description: "Revered as a Maha Shakti Peetha where the upper jaw of Goddess Sati fell."
  },
  {
    id: "jwala-devi",
    name: "Jwala Devi Temple",
    location: "Kangra, Himachal Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Jwala_Devi.jpg",
    description: "Revered as a Maha Shakti Peetha where the tongue of Goddess Sati fell."
  },
  {
    id: "kalmadhav",
    name: "Kalmadhav Temple",
    location: "Annuppur, Madhya Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Kalmadhav.jpg",
    description: "Revered as a Maha Shakti Peetha where the left buttock of Goddess Sati fell."
  },
  {
    id: "kapalini",
    name: "Kapalini Temple",
    location: "Purba Medinipur, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Kapalini.jpg",
    description: "Revered as a Maha Shakti Peetha where the left ankle of Goddess Sati fell."
  },
  {
    id: "katyayani",
    name: "Katyayani Temple",
    location: "Mathura, Uttar Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Katyayani.jpg",
    description: "Revered as a Maha Shakti Peetha where the hair of Goddess Sati fell."
  },
  {
    id: "khamakya",
    name: "Khamakya Temple",
    location: "Guwahati, Assam",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Kamakhya.jpg",
    description: "Revered as a Maha Shakti Peetha where the yoni (genitals) of Goddess Sati fell."
  },
  {
    id: "kumari-shakti",
    name: "Kumari Shakti Temple",
    location: "Hooghly, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Kumari_Shakti.jpg",
    description: "Revered as a Maha Shakti Peetha where the right shoulder of Goddess Sati fell."
  },
  {
    id: "lalita",
    name: "Lalita Temple",
    location: "Allahabad, Uttar Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Lalita.jpg",
    description: "Revered as a Maha Shakti Peetha where the fingers of Goddess Sati fell."
  },
  {
    id: "mangla-gauri",
    name: "Mangla Gauri Temple",
    location: "Gaya, Bihar",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Magadha.jpg",
    description: "Revered as a Maha Shakti Peetha where the breast of Goddess Sati fell."
  },
  {
    id: "maha-lakshmi",
    name: "Maha Lakshmi Temple",
    location: "Bangladesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Maha_Lakshmi.jpg",
    description: "Revered as a Maha Shakti Peetha where the neck of Goddess Sati fell."
  },
  {
    id: "mahashira",
    name: "Mahashira Temple",
    location: "Kathmandu, Nepal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Mahashira.jpg",
    description: "Revered as a Maha Shakti Peetha where the hips of Goddess Sati fell."
  },
  {
    id: "mahishasuramardini",
    name: "Mahishasuramardini Temple",
    location: "Kolhapur, Maharashtra",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Mahishasuramardini.jpg",
    description: "Revered as a Maha Shakti Peetha where the third eye of Goddess Sati fell."
  },
  {
    id: "mahishmardini",
    name: "Mahishmardini Temple",
    location: "Birbhum, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Mahishmardini.jpg",
    description: "Revered as a Maha Shakti Peetha where the portion of the head between the eyebrows of Goddess Sati fell."
  },
  {
    id: "mangal-chandika",
    name: "Mangal Chandika Temple",
    location: "Purba Bardhaman, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Mangal_Chandi.jpg",
    description: "Revered as a Maha Shakti Peetha where the right wrist of Goddess Sati fell."
  },
  {
    id: "mithila",
    name: "Mithila Temple",
    location: "Nepal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Mithila_Shaktipeeth.jpg",
    description: "Revered as a Maha Shakti Peetha where the left shoulder of Goddess Sati fell."
  },
  {
    id: "nagapooshani",
    name: "Nagapooshani Temple",
    location: "Northern Province, Sri Lanka",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Nagapooshani_Amman.jpg",
    description: "Revered as a Maha Shakti Peetha where the anklets of Goddess Sati fell."
  },
  {
    id: "nandini",
    name: "Nandini Temple",
    location: "Birbhum, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Nandini.jpg",
    description: "Revered as a Maha Shakti Peetha where the necklace of Goddess Sati fell."
  },
  {
    id: "bhramaramba",
    name: "Bhramaramba Temple",
    location: "Kurnool, Andhra Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Bhramaramba.jpg",
    description: "Revered as a Maha Shakti Peetha where the right anklet of Goddess Sati fell."
  },
  {
    id: "narmada",
    name: "Narmada Temple",
    location: "Amarkantak, Madhya Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Narmada_Shondesh.jpg",
    description: "Revered as a Maha Shakti Peetha where the right buttock of Goddess Sati fell."
  },
  {
    id: "panch-sagar",
    name: "Panch Sagar Temple",
    location: "Haridwar",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Panch_Sagar_Shaktipeeth.jpg",
    description: "Revered as a Maha Shakti Peetha where the teeth (lower jaw) of Goddess Sati fell."
  },
  {
    id: "phullara",
    name: "Phullara Temple",
    location: "West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Phullara.jpg",
    description: "Revered as a Maha Shakti Peetha where the lower lip of Goddess Sati fell."
  },
  {
    id: "ramgiri",
    name: "Ramgiri Temple",
    location: "Chitrakuta",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Ramgiri-Shakti-Peeth.jpg",
    description: "Revered as a Maha Shakti Peetha where the right breast of Goddess Sati fell."
  },
  {
    id: "chamundeshwari",
    name: "Chamundeshwari Temple",
    location: "Mysore, Karnataka",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Ratnavali_Sakthipeeth.jpg",
    description: "Revered as a Maha Shakti Peetha where the hair of Goddess Sati fell."
  },
  {
    id: "sarvashail",
    name: "Sarvashail Temple",
    location: "East Godavari, Andhra Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Sarvashail_Rakini.jpg",
    description: "Revered as a Maha Shakti Peetha where the left cheek of Goddess Sati fell."
  },
  {
    id: "savitri",
    name: "Savitri Temple",
    location: "Kurukshetra, Haryana",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Savitri.jpg",
    description: "Revered as a Maha Shakti Peetha where the right ankle of Goddess Sati fell."
  },
  {
    id: "sravani",
    name: "Sravani Temple",
    location: "Kanyakumari, Tamil Nadu",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Sravani_Kanyashram.jpg",
    description: "Revered as a Maha Shakti Peetha where the back and spine of Goddess Sati fell."
  },
  {
    id: "naina-devi",
    name: "Naina Devi Temple",
    location: "Bilaspur, Himachal Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Narayani.jpg",
    description: "Revered as a Maha Shakti Peetha where the eyes of Goddess Sati fell."
  },
  {
    id: "sugandha",
    name: "Sugandha Temple",
    location: "Barishal, Bangladesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Sugandha_Shakti_Peeth.jpg",
    description: "Revered as a Maha Shakti Peetha where the nose of Goddess Sati fell."
  },
  {
    id: "tripura-sundari",
    name: "Tripura Sundari Temple",
    location: "Gomati, Tripura",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Tripura_Sundari.jpg",
    description: "Revered as a Maha Shakti Peetha where the right foot of Goddess Sati fell."
  },
  {
    id: "tripurmalini",
    name: "Tripurmalini Temple",
    location: "Jalandhar, Punjab",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Tripurmalini.jpg",
    description: "Revered as a Maha Shakti Peetha where the left breast of Goddess Sati fell."
  },
  {
    id: "vimla",
    name: "Vimla Temple",
    location: "Murshidabad, West Bengal",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Vimla.jpg",
    description: "Revered as a Maha Shakti Peetha where the crown of Goddess Sati fell."
  },
  {
    id: "vishalakshi",
    name: "Vishalakshi Temple",
    location: "Varanasi, Uttar Pradesh",
    type: "SATI_PITH",
    deity_image_url: "/51_Soti_Pith_Image/Vishalakshi.jpg",
    description: "Revered as a Maha Shakti Peetha where the earrings of Goddess Sati fell."
  }
];
