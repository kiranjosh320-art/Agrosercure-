/**
 * Curated Test Plant & Leaf Specimens for Instant AI Diagnosis Verification
 * Includes Coffee leaves (Healthy & Diseased), Pepper leaves (Healthy & Diseased),
 * other crop leaves, and invalid non-leaf images to verify strict botanical validation.
 */

export interface SampleSpecimen {
  id: string;
  key: string;
  titleEn: string;
  titleKn: string;
  plantName: string;
  conditionName: string;
  scientificName: string;
  category: 'Leaf Fungal' | 'Leaf Blight' | 'Berry Disease' | 'Pest Damage' | 'Physiological' | 'Healthy' | 'Invalid Non-Coffee';
  severity: 'Low' | 'Medium' | 'High' | 'Healthy' | 'Mild' | 'Moderate' | 'Severe';
  descriptionEn: string;
  descriptionKn: string;
  imageUrl: string;
  symptoms: string[];
  recommendedActions: {
    immediate: string[];
    culturalAndOrganic: string[];
    chemicalTreatment: string[];
    preventative: string[];
  };
  isValidLeaf: boolean;
  isValidCoffeeLeaf: boolean;
  expectedResult?: 'Healthy' | 'Possible Disease Detected' | 'INVALID IMAGE';
}

export const SAMPLE_SPECIMENS: SampleSpecimen[] = [
  {
    id: 'specimen_healthy_coffee',
    key: 'healthy',
    titleEn: 'Healthy Arabica Coffee Leaf',
    titleKn: 'ಆರೋಗ್ಯಕರ ಅರೇಬಿಕಾ ಕಾಫಿ ಎಲೆ',
    plantName: 'Coffee Arabica',
    conditionName: 'Healthy Coffee Leaf',
    scientificName: 'Coffea arabica L.',
    category: 'Healthy',
    severity: 'Low',
    descriptionEn: 'Vibrant glossy dark emerald green leaf with intact waxy cuticle, pronounced pinnate venation, and zero signs of chlorosis or sporulation.',
    descriptionKn: 'ಹೊಳಪಿನ ದಟ್ಟ ಹಸಿರು ಎಲೆ, ಯಾವುದೇ ರೋಗಲಕ್ಷಣಗಳಿಲ್ಲದ ಉತ್ತಮ ಬೆಳವಣಿಗೆ.',
    imageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'No fungal pustules or necrotic lesions observed',
      'Uniform dark emerald green coloration indicating high chlorophyll content',
      'Robust epidermal turgidity and healthy leaf margins',
    ],
    recommendedActions: {
      immediate: ['Maintain regular cultural practices and soil health monitoring'],
      culturalAndOrganic: [
        'Apply scheduled organic vermicompost and bio-fertilizers',
        'Keep canopy shade between 30% and 40%',
      ],
      chemicalTreatment: ['No chemical intervention required'],
      preventative: [
        'Continue routine seasonal scouting every 15 days',
        'Monitor weather station for humidity spikes',
      ],
    },
    isValidLeaf: true,
    isValidCoffeeLeaf: true,
    expectedResult: 'Healthy',
  },
  {
    id: 'specimen_rust_coffee',
    key: 'rust',
    titleEn: 'Diseased Coffee Leaf (Leaf Rust)',
    titleKn: 'ಕಾಫಿ ಎಲೆ ತುಕ್ಕು ರೋಗ (ಹಳದಿ ಪುಡಿ)',
    plantName: 'Coffee Arabica',
    conditionName: 'Coffee Leaf Rust (Hemileia vastatrix)',
    scientificName: 'Hemileia vastatrix Berkeley & Broome',
    category: 'Leaf Fungal',
    severity: 'Medium',
    descriptionEn: 'Classic circular powdery orange-yellow urediniospore pustules on the abaxial (underside) leaf surface causing chlorosis.',
    descriptionKn: 'ಎಲೆಯ ಕೆಳಭಾಗದಲ್ಲಿ ಕಿತ್ತಳೆ-ಹಳದಿ ಬಣ್ಣದ ಪುಡಿಯಂತಹ ಬೀಜಕಗಳ ದದ್ದುಗಳು.',
    imageUrl:
      'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Powdery orange-yellow spore masses on lower leaf epidermis',
      'Chlorotic translucent spots visible on corresponding upper leaf surface',
      'Beginning of premature defoliation on lower branches',
    ],
    recommendedActions: {
      immediate: [
        'Strip and destroy severely sporulating leaves from infected branches',
        'Cease overhead sprinkler irrigation to prevent spore splash',
      ],
      culturalAndOrganic: [
        'Prune shade trees (Silver Oak, Dadap) to achieve 35% filtered sunlight canopy',
        'Apply bio-fungicides with Trichoderma viride or Bacillus subtilis at 5g/L',
      ],
      chemicalTreatment: [
        'Foliar spray with Copper Oxychloride 50 WP @ 2.5 g/L of water with wetting sticker',
        'If infection exceeds 10% leaf canopy, apply Hexaconazole 5% EC @ 2 ml/L',
      ],
      preventative: [
        'Plant rust-tolerant cultivars (Selection 795, Chandragiri, Cauvery)',
        'Ensure balanced soil potassium nutrition to strengthen epidermal cell walls',
      ],
    },
    isValidLeaf: true,
    isValidCoffeeLeaf: true,
    expectedResult: 'Possible Disease Detected',
  },
  {
    id: 'specimen_pepper_diseased',
    key: 'pepper_diseased',
    titleEn: 'Diseased Pepper Leaf (Quick Wilt / Rot)',
    titleKn: 'ಕಾಳುಮೆಣಸು ಎಲೆ ಕೊಳೆ ರೋಗ (ಫೈಟೊಫ್ತೊರಾ)',
    plantName: 'Black Pepper (Piper nigrum)',
    conditionName: 'Phytophthora Foot Rot / Quick Wilt',
    scientificName: 'Phytophthora capsici',
    category: 'Leaf Fungal',
    severity: 'High',
    descriptionEn: 'Dark water-soaked necrotic lesions with fimbriate expanding margins on black pepper leaf, characteristic of Phytophthora monsoon infection.',
    descriptionKn: 'ಕಾಳುಮೆಣಸಿನ ಎಲೆಯಲ್ಲಿ ಕಪ್ಪು ಬಣ್ಣದ ಕೊಳೆತ ನೀರಿನಂಶದ ಕಲೆಗಳು.',
    imageUrl:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Dark brown to black water-soaked lesions with fimbriate margins',
      'Rapid foliar yellowing and flaccid wilting of pepper vine foliage',
      'Necrosis spreading down petiole into the vine standard node',
    ],
    recommendedActions: {
      immediate: [
        'Drench soil basin around vine base with 1% Bordeaux mixture or Copper Oxychloride 50 WP @ 2 g/L (3-5 L/vine)',
        'Remove and incinerate blighted hanging pepper vine runners',
      ],
      culturalAndOrganic: [
        'Ensure clear drainage contours to stop standing water around pepper vine standards',
        'Incorporate Trichoderma-enriched farmyard manure (5 kg/vine) before monsoons',
      ],
      chemicalTreatment: [
        'Foliar spray with Potassium Phosphonate (Akomin) @ 3 ml/L or Metalaxyl-Mancozeb @ 2 g/L',
        'Repeat drenching 30 days after initial application during heavy rains',
      ],
      preventative: [
        'Plant certified Phytophthora-tolerant varieties such as IISR Thevam and Shakthi',
        'Prune excessive shade over pepper vines to reduce leaf wetness duration',
      ],
    },
    isValidLeaf: true,
    isValidCoffeeLeaf: true,
    expectedResult: 'Possible Disease Detected',
  },
  {
    id: 'specimen_pepper_healthy',
    key: 'pepper_healthy',
    titleEn: 'Healthy Pepper Leaf',
    titleKn: 'ಆರೋಗ್ಯಕರ ಕಾಳುಮೆಣಸಿನ ಎಲೆ',
    plantName: 'Black Pepper (Piper nigrum)',
    conditionName: 'Healthy Pepper Leaf',
    scientificName: 'Piper nigrum L.',
    category: 'Healthy',
    severity: 'Low',
    descriptionEn: 'Glossy ovate-cordate black pepper leaf with intact leathery cuticle, distinct arching veins, and strong turgor pressure.',
    descriptionKn: 'ಹೊಳಪಿನ ಕಡು ಹಸಿರು ಆರೋಗ್ಯಕರ ಕಾಳುಮೆಣಸಿನ ಎಲೆ.',
    imageUrl:
      'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Intact glossy waxy cuticle with uniform emerald green color',
      'Zero necrotic spots, marginal water-soaking, or viral mottling',
      'Healthy prominent primary veins and robust petiole attachment',
    ],
    recommendedActions: {
      immediate: ['Maintain scheduled root basin mulching and micro-irrigation'],
      culturalAndOrganic: [
        'Apply scheduled neem cake (1 kg/vine) and vermicompost for root protection',
        'Maintain 40% filtered sunlight on live support trees (Silver Oak / Erythrina)',
      ],
      chemicalTreatment: ['No chemical intervention required'],
      preventative: [
        'Apply pre-monsoon preventive 1% Bordeaux mixture spray as routine prophylaxis',
        'Conduct monthly inspection for poll beetle and scale pests',
      ],
    },
    isValidLeaf: true,
    isValidCoffeeLeaf: true,
    expectedResult: 'Healthy',
  },
  {
    id: 'specimen_tomato_blight',
    key: 'tomato_blight',
    titleEn: 'Other Crop: Tomato Leaf (Early Blight)',
    titleKn: 'ಇತರ ಬೆಳೆ: ಟೊಮ್ಯಾಟೊ ಎಲೆ ಕಮರುವಿಕೆ ರೋಗ',
    plantName: 'Tomato (Solanum lycopersicum)',
    conditionName: 'Early Blight (Alternaria solani)',
    scientificName: 'Alternaria solani',
    category: 'Leaf Fungal',
    severity: 'Medium',
    descriptionEn: 'Concentric dark brown target-like rings surrounded by a chlorotic yellow halo on tomato foliar tissue.',
    descriptionKn: 'ಟೊಮ್ಯಾಟೊ ಎಲೆಯಲ್ಲಿ ಕಂದು ಬಣ್ಣದ ವೃತ್ತಾಕಾರದ ಕಲೆಗಳು.',
    imageUrl:
      'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Concentric dark brown target-like circular lesions on older leaflets',
      'Yellow chlorotic halos surrounding necrotic tissue',
      'Premature leaf senescence and defoliation from bottom upward',
    ],
    recommendedActions: {
      immediate: ['Prune lowest infected leaves near soil level', 'Avoid overhead sprinkler irrigation'],
      culturalAndOrganic: [
        'Apply thick straw mulch to prevent soil-splash of fungal spores onto lower leaves',
        'Spray bio-fungicide Bacillus subtilis or Trichoderma harzianum',
      ],
      chemicalTreatment: [
        'Foliar spray with Mancozeb 75 WP @ 2.5 g/L or Chlorothalonil 75 WP @ 2 g/L',
        'Azoxystrobin 23 SC @ 1 ml/L for systemic cure',
      ],
      preventative: [
        'Practice 3-year crop rotation avoiding solanaceous crops (potato, brinjal)',
        'Ensure wide 60cm plant spacing for good canopy aeration',
      ],
    },
    isValidLeaf: true,
    isValidCoffeeLeaf: true,
    expectedResult: 'Possible Disease Detected',
  },
  {
    id: 'specimen_cercospora_03',
    key: 'cercospora',
    titleEn: 'Cercospora Leaf Spot',
    titleKn: 'ಸೆರ್ಕೊಸ್ಪೊರಾ ಎಲೆ ಚುಕ್ಕೆ ರೋಗ',
    plantName: 'Coffee Arabica',
    conditionName: 'Cercospora Leaf Spot',
    scientificName: 'Cercospora coffeicola',
    category: 'Leaf Fungal',
    severity: 'Medium',
    descriptionEn: 'Circular necrotic brown lesions with ash-grey centers and distinct bright yellow chlorotic halos.',
    descriptionKn: 'ಬೂದು ಕೇಂದ್ರ ಮತ್ತು ಹಳದಿ ಬಣ್ಣದ ವೃತ್ತ ಹೊಂದಿರುವ ಕಂದು ಬಣ್ಣದ ದುಂಡಗಿನ ಕಲೆಗಳು.',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Circular necrotic lesions 2-6mm with characteristic greyish center',
      'Distinct bright yellow chlorotic halo surrounding necrotic tissue',
      'Premature drop of infected younger nursery and estate foliage',
    ],
    recommendedActions: {
      immediate: ['Avoid overhead wetting in nursery stages', 'Collect fallen infected foliage'],
      culturalAndOrganic: [
        'Improve plantation shade cover; Cercospora is aggravated by excessive sunlight exposure',
        'Apply organic compost and balanced N-P-K fertilizer to correct host stress',
      ],
      chemicalTreatment: [
        'Spray Bordeaux Mixture 0.5% or Copper Hydroxide 53.8% DF @ 2 g/L',
        'Mancozeb 75 WP @ 2.5 g/L during active flush stages',
      ],
      preventative: [
        'Ensure adequate nitrogen and potassium levels in soil',
        'Maintain protective shade in early plantation years',
      ],
    },
    isValidLeaf: true,
    isValidCoffeeLeaf: true,
    expectedResult: 'Possible Disease Detected',
  },
  {
    id: 'specimen_brown_eye_04',
    key: 'brown_eye',
    titleEn: 'Brown Eye Spot',
    titleKn: 'ಕಂದು ಕಣ್ಣು ಚುಕ್ಕೆ ರೋಗ',
    plantName: 'Coffee Arabica',
    conditionName: 'Brown Eye Spot',
    scientificName: 'Cercospora coffeicola',
    category: 'Leaf Fungal',
    severity: 'Medium',
    descriptionEn: 'Concentric reddish-brown eye spots on older foliage with sunken margins, commonly seen on unshaded Arabica blocks.',
    descriptionKn: 'ನೆರಳು ಇಲ್ಲದ ಕಾಫಿ ಗಿಡಗಳಲ್ಲಿ ಕಂದು ಕಣ್ಣಿನಂತಹ ಕಲೆಗಳು.',
    imageUrl:
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Concentric reddish-brown target-like circles on leaf blade',
      'Thinning canopy due to accelerated leaf drop',
      'Microscopic conidia present within the central eye zone',
    ],
    recommendedActions: {
      immediate: ['Provide temporary overhead shade netting if exposed to harsh sun'],
      culturalAndOrganic: [
        'Regulate shade canopy to maintain 35-40% cover',
        'Mulch basin with organic litter to retain root moisture',
      ],
      chemicalTreatment: [
        'Spray Copper Oxychloride 50 WP @ 2.5 g/L',
        'Apply Carbendazim 50 WP @ 1 g/L if disease is widespread',
      ],
      preventative: ['Maintain soil organic carbon > 2.5% through regular green manuring'],
    },
    isValidLeaf: true,
    isValidCoffeeLeaf: true,
    expectedResult: 'Possible Disease Detected',
  },
  {
    id: 'specimen_leaf_blight_05',
    key: 'leaf_blight',
    titleEn: 'Leaf Blight (Phoma / Rhizoctonia)',
    titleKn: 'ಎಲೆ ಕಮರುವಿಕೆ ರೋಗ (ಬ್ಲೈಟ್)',
    plantName: 'Coffee Arabica',
    conditionName: 'Leaf Blight',
    scientificName: 'Phoma costarricensis / Rhizoctonia spp.',
    category: 'Leaf Blight',
    severity: 'High',
    descriptionEn: 'Large irregular dark water-soaked necrotic patches expanding along the leaf margins and tips causing rapid necrosis.',
    descriptionKn: 'ಎಲೆಯ ಅಂಚುಗಳಲ್ಲಿ ಹರಡುವ ಕಪ್ಪು ನೀರಿನಂಶದ ದೊಡ್ಡ ಕಲೆಗಳು ಮತ್ತು ಎಲೆ ಒಣಗುವಿಕೆ.',
    imageUrl:
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    symptoms: [
      'Rapidly spreading dark brown to black water-soaked lesions from leaf tip',
      'Marginal necrosis with brittle scorched appearance',
      'Premature blighted branch dieback during continuous monsoonal wetness',
    ],
    recommendedActions: {
      immediate: ['Prune blighted twigs and burn removed vegetation immediately'],
      culturalAndOrganic: [
        'Drain waterlogged zones and improve airflow through bush centers',
        'Avoid high chemical nitrogen applications during prolonged mist periods',
      ],
      chemicalTreatment: [
        'Spray Chlorothalonil 75 WP @ 2.0 g/L or Copper Hydroxide @ 2.5 g/L',
        'Systemic Difenoconazole 25 EC @ 0.5 ml/L for advancing blight lesions',
      ],
      preventative: ['Establish effective windbreaks on exposed high-elevation ridges'],
    },
    isValidLeaf: true,
    isValidCoffeeLeaf: true,
    expectedResult: 'Possible Disease Detected',
  },

  // Test Specimens to verify the Image Validation Gate (Negative Test Cases - Non-Plant/Leaf Objects)
  {
    id: 'specimen_invalid_car',
    key: 'invalid_car',
    titleEn: 'Test Unrelated: Motor Vehicle',
    titleKn: 'ಪರೀಕ್ಷೆ: ಅಮಾನ್ಯ ವಾಹನದ ಚಿತ್ರ',
    plantName: 'Non-Botanical',
    conditionName: 'Motor Vehicle (Non-Plant Object)',
    scientificName: 'Automobile / Industrial Object',
    category: 'Invalid Non-Coffee',
    severity: 'Low',
    descriptionEn: 'Vehicle image used to verify that the AI strictly rejects urban machinery and objects.',
    descriptionKn: 'ವಾಹನದ ಚಿತ್ರ - ಎಐ ತಿರಸ್ಕರಿಸಬೇಕು.',
    imageUrl:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
    symptoms: ['Mechanical vehicle components', 'No botanical leaf structure'],
    recommendedActions: {
      immediate: ['Please upload a valid plant or leaf image'],
      culturalAndOrganic: [],
      chemicalTreatment: [],
      preventative: [],
    },
    isValidLeaf: false,
    isValidCoffeeLeaf: false,
    expectedResult: 'INVALID IMAGE',
  },
  {
    id: 'specimen_invalid_person',
    key: 'invalid_person',
    titleEn: 'Test Unrelated: Human Face / Portrait',
    titleKn: 'ಪರೀಕ್ಷೆ: ಅಮಾನ್ಯ ವ್ಯಕ್ತಿಯ ಭಾವಚಿತ್ರ',
    plantName: 'Non-Botanical',
    conditionName: 'Human Face (Non-Plant Object)',
    scientificName: 'Homo sapiens (Non-Botanical)',
    category: 'Invalid Non-Coffee',
    severity: 'Low',
    descriptionEn: 'Unrelated human portrait image used to test that the AI strictly rejects non-leaf subjects.',
    descriptionKn: 'ವ್ಯಕ್ತಿಯ ಚಿತ್ರ - ಎಐ ತಿರಸ್ಕರಿಸಬೇಕು.',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    symptoms: ['No plant foliage present', 'Human subject detected'],
    recommendedActions: {
      immediate: ['Please upload a valid plant or leaf image'],
      culturalAndOrganic: [],
      chemicalTreatment: [],
      preventative: [],
    },
    isValidLeaf: false,
    isValidCoffeeLeaf: false,
    expectedResult: 'INVALID IMAGE',
  },
  {
    id: 'specimen_invalid_flower',
    key: 'invalid_flower',
    titleEn: 'Test Unrelated: Garden Rose Flower',
    titleKn: 'ಪರೀಕ್ಷೆ: ಅಮಾನ್ಯ ಹೂವಿನ ಚಿತ್ರ',
    plantName: 'Non-Leaf Botanical',
    conditionName: 'Flower Petal (Without Leaf Foliage)',
    scientificName: 'Rosa spp.',
    category: 'Invalid Non-Coffee',
    severity: 'Low',
    descriptionEn: 'Flower bloom without agricultural leaf foliage, to test strict botanical requirement of plant leaves.',
    descriptionKn: 'ಹೂವಿನ ದಳಗಳ ಚಿತ್ರ - ಎಲೆ ರೋಗ ಪರೀಕ್ಷೆಗೆ ಎಲೆಯ ಚಿತ್ರ ಬೇಕು.',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    symptoms: ['Floral petals without leaf blade foliage', 'No foliar blade present'],
    recommendedActions: {
      immediate: ['Please upload a valid plant or leaf image'],
      culturalAndOrganic: [],
      chemicalTreatment: [],
      preventative: [],
    },
    isValidLeaf: false,
    isValidCoffeeLeaf: false,
    expectedResult: 'INVALID IMAGE',
  },
];
