// frontend/src/services/mock-analysis.ts
import { DetectionResult, RecommendationGroup } from '../types';

const cropDiseases = [
  {
    name: 'Maize Leaf Blight',
    type: 'fungal',
    symptoms: ['Elliptical gray-green lesions', 'Dark borders on leaves', 'Lesions may join together'],
    treatments: ['Apply fungicide containing azoxystrobin', 'Remove infected leaves', 'Improve air circulation']
  },
  {
    name: 'Tomato Early Blight',
    type: 'fungal',
    symptoms: ['Dark brown spots with concentric rings', 'Yellowing of older leaves', 'Leaf drop'],
    treatments: ['Apply copper-based fungicide', 'Practice crop rotation', 'Avoid overhead watering']
  },
  {
    name: 'Cassava Mosaic Disease',
    type: 'viral',
    symptoms: ['Mosaic patterns on leaves', 'Stunted growth', 'Leaf distortion'],
    treatments: ['Use disease-free planting material', 'Control whitefly vectors', 'Remove infected plants']
  }
];

const livestockConditions = [
  {
    name: 'Foot Rot',
    type: 'bacterial',
    symptoms: ['Lameness', 'Swollen foot', 'Foul-smelling discharge'],
    treatments: ['Antibiotic treatment', 'Hoof trimming', 'Improve pen drainage']
  },
  {
    name: 'Mastitis',
    type: 'bacterial',
    symptoms: ['Swollen udder', 'Abnormal milk', 'Fever in animal'],
    treatments: ['Intramammary antibiotics', 'Anti-inflammatory drugs', 'Proper milking hygiene']
  }
];

const fisheryDiseases = [
  {
    name: 'Ichthyophthirius (White Spot)',
    type: 'parasitic',
    symptoms: ['White spots on skin and fins', 'Flashing against objects', 'Rapid breathing'],
    treatments: ['Raise water temperature', 'Add aquarium salt', 'Use malachite green treatment']
  },
  {
    name: 'Fin Rot',
    type: 'bacterial',
    symptoms: ['Frayed or disintegrating fins', 'Reddened fin bases', 'White edge on fins'],
    treatments: ['Improve water quality', 'Antibacterial medication', 'Salt baths']
  }
];

export const analyzeMockImages = async (category: 'crops' | 'livestock' | 'fishery'): Promise<DetectionResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  const statuses = ['healthy', 'infected', 'critical'] as const;
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  let disease;
  let recommendations: RecommendationGroup[] = [];

  if (randomStatus === 'healthy') {
    recommendations = [
      {
        title: '✅ Maintenance Recommendations',
        items: [
          'Continue regular monitoring schedule',
          'Maintain optimal environmental conditions',
          'Schedule monthly health checks',
          'Keep vaccination records up to date'
        ]
      }
    ];
  } else {
    // Select appropriate disease based on category
    const diseaseList = category === 'crops' ? cropDiseases :
                       category === 'livestock' ? livestockConditions :
                       fisheryDiseases;
    
    disease = diseaseList[Math.floor(Math.random() * diseaseList.length)];
    
    recommendations = [
      {
        title: '🚨 Immediate Actions',
        items: [
          'Isolate affected area/specimen',
          'Begin recommended treatment protocol',
          'Document symptoms and progression'
        ]
      },
      {
        title: '💊 Treatment Plan',
        items: disease.treatments
      },
      {
        title: '🛡️ Preventive Measures',
        items: [
          'Improve sanitation practices',
          'Monitor closely for 7-10 days',
          'Consult specialist if condition worsens'
        ]
      }
    ];
  }

  const titles = {
    healthy: category === 'crops' ? 'Crop is Healthy' :
             category === 'livestock' ? 'Animal is Healthy' :
             'Fish are Healthy',
    infected: category === 'crops' ? 'Early Disease Detected' :
              category === 'livestock' ? 'Health Issue Identified' :
              'Infection Present',
    critical: category === 'crops' ? 'Critical Disease Alert' :
              category === 'livestock' ? 'Critical Health Condition' :
              'Severe Infection Detected'
  };

  const messages = {
    healthy: category === 'crops' ? 
      'No signs of disease detected. Your crop appears to be in excellent condition with optimal growth patterns.' :
      category === 'livestock' ?
      'Animal appears healthy with normal vital signs and behavior. No abnormalities detected.' :
      'Fish show normal swimming behavior and appearance. Water parameters are within optimal range.',
    
    infected: disease ? 
      `Early stage ${disease.type} infection detected. ${disease.name} identified with ${Math.floor(Math.random() * 30) + 20}% progression.` :
      'Mild symptoms detected requiring early intervention.',
    
    critical: disease ?
      `Severe ${disease.name} infection requiring immediate attention. ${Math.floor(Math.random() * 50) + 50}% area affected.` :
      'Critical condition detected. Emergency measures recommended.'
  };

  return {
    status: randomStatus,
    title: titles[randomStatus],
    message: messages[randomStatus],
    confidence: randomStatus === 'healthy' ? 94 : randomStatus === 'infected' ? 87 : 92,
    color: randomStatus === 'healthy' ? 'green' : randomStatus === 'infected' ? 'yellow' : 'red',
    timestamp: new Date().toISOString(),
    category: category,
    diseaseType: disease?.name || 'None',
    severity: randomStatus === 'healthy' ? 0 : randomStatus === 'infected' ? 4 : 8,
    recommendations: recommendations,
    processingSteps: [
      { step: 'Image Processing', completed: true, duration: 2500 },
      { step: 'Feature Extraction', completed: true, duration: 3500 },
      { step: 'Pattern Recognition', completed: true, duration: 4500 },
      { step: 'AI Analysis', completed: true, duration: 5000 }
    ]
  };
};