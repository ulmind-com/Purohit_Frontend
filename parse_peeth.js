const data = `01	Amarnath	Jammu & Kashmir	Throat
02	Ambaji	Gujarat	Heart
03	Ambika	Bharatpur, Rajasthan	Left foot
04	Aparna	Bogra, Bangladesh	Anklet/Ribs of left chest/Right eye
05	Avanti	Ujjain, Madhya Pradesh	Upper Lips/Elbow
06	Bahula	West Bengal	Left Arm
07	Bhavani	Chittagong, Bangladesh	Right Arm
08	Bhramari	Nashik, Maharashtra	Chin
09	Bhramri	Jalpaiguri, West Bengal	Left leg
10	Biraja	Jajpur, Odisha	Navel
11	Dakshayani	Burang, Tibet	Right Palm
12	Dakshina Kali	Kolkata, West Bengal	Right Toes
13	Devgarbha	Birbhum, West Bengal	Bone
14	Gandaki Chandi	Mustang	Nepal Cheek
15	Gayatri	Pushkar, Rajasthan	Wrist
16	Hinglaj	Pakistan	Head
17	Jai Durga	Deoghar, Jharkhand	Ear
18	Jayanti	West Jaintia Hills, Meghalaya	Left Thigh
19	Jeshoreshwari	Khulna, Bangladesh	Palm
20	Jogulamba Devi	Alampur, Gadwal district	Upper Jaw
21	Jwala Devi	Kangra, Himachal Pradesh	Tongue
22	Kalmadhav	Annuppur, Madhya Pradesh	Left Buttock
23	Kapalini	Purba Medinipur, West Bengal	Left Ankle
24	Katyayani	Mathura, Uttar Pradesh	Hair
25	Khamakya	Guwahati, Assam	Yoni (Genitals)
26	Kumari Shakti	Hooghly, West Bengal	Right Shoulder
27	Lalita	Allahabad, Uttar Pradesh	Fingers
28	Mangla Gauri	Gaya, Bihar	Breast
29	Maha Lakshmi	Bangladesh	Neck
30	Mahashira	Kathmandu, Nepal	Hips
31	Mahishasuramardini	Kolhapur, Maharashtra	Third Eye
32	Mahishmardini	Birbhum, West Bengal	Portion of the head between the eyebrows
33	Mangal Chandika	Purba Bardhaman, West Bengal	Right Wrist
34	Mithila	Nepal	Left Shoulder
35	Nagapooshani	Northern Province, Sri Lanka	Anklets
36	Nandini	Birbhum, West Bengal	Necklace
37	Bhramaramba	Kurnool, Andhra Pradesh	Right Anklet
38	Narmada	Amarkantak, Madhya Pradesh	Right Buttock
39	Panch Sagar	Haridwar	Teeth (lower jaw)
40	Phullara	West Bengal	Lower Lip
41	Ramgiri	Chitrakuta	Right Breast
42	Chamundeshwari	Mysore, Karnataka	Hair
43	Sarvashail	East Godavari, Andhra Pradesh	Left cheek
44	Savitri	Kurukshetra, Haryana	Right Ankle
45	Sravani	Kanyakumari, Tamil Nadu	Back and spine
46	Naina Devi	Bilaspur, Himachal Pradesh	Eyes
47	Sugandha	Barishal, Bangladesh	Nose
48	Tripura Sundari	Gomati, Tripura	Right Foot
49	Tripurmalini	Jalandhar, Punjab	Left Breast
50	Vimla	Murshidabad, West Bengal	Crown
51	Vishalakshi	Varanasi, Uttar Pradesh	Earrings`;

const images = [
  "https://images.unsplash.com/photo-1620601242371-50e50c4ffdd1?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1633596701509-66c855a9b891?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1629853909774-8840bc2a8db4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1604114881479-79a4d8fb8706?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800"
];

const lines = data.split('\n');
const items = lines.map((line, index) => {
  const parts = line.split('\t');
  if (parts.length >= 4) {
    const name = parts[1].trim();
    let location = parts[2].trim();
    const bodyPart = parts[3].trim();
    
    // Fix for line 14: Gandaki Chandi Mustang Nepal Cheek (tab delimited wrongly in source maybe)
    if (name === "Gandaki Chandi" && location === "Mustang") {
      location = "Mustang, Nepal";
    }
    
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    return `  {
    id: "${id}",
    name: "${name} Temple",
    location: "${location}",
    type: "SATI_PITH",
    deity_image_url: "${images[index % images.length]}",
    description: "Revered as a Maha Shakti Peetha where the ${bodyPart.toLowerCase()} of Goddess Sati fell."
  }`;
  }
  return null;
}).filter(Boolean);

const output = `export type TempleType = 'SATI_PITH' | 'POPULAR';

export interface Temple {
  id: string;
  name: string;
  location: string;
  type: TempleType;
  deity_image_url: string;
  description: string;
}

export const MOCK_TEMPLES: Temple[] = [
${items.join(',\n')}
];
`;

const fs = require('fs');
fs.writeFileSync('types/darshan.ts', output);
console.log("Done");
