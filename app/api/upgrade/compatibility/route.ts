
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// Hardware inventory data (same as in hardware route)
const hardwareInventory = {
  cpu: [
    {
      id: 'cpu_1',
      name: 'Intel Core i5-13600K',
      brand: 'Intel',
      price: 8500,
      socket: 'LGA1700',
      power_consumption: 125
    },
    {
      id: 'cpu_2',
      name: 'AMD Ryzen 7 7700X',
      brand: 'AMD',
      price: 9200,
      socket: 'AM5',
      power_consumption: 105
    },
    {
      id: 'cpu_3',
      name: 'Intel Core i9-13900K',
      brand: 'Intel',
      price: 14500,
      socket: 'LGA1700',
      power_consumption: 150
    }
  ],
  gpu: [
    {
      id: 'gpu_1',
      name: 'NVIDIA RTX 4060 Ti',
      brand: 'NVIDIA',
      price: 18500,
      power_consumption: 165,
      recommended_psu: 650
    },
    {
      id: 'gpu_2',
      name: 'AMD RX 7700 XT',
      brand: 'AMD',
      price: 17800,
      power_consumption: 245,
      recommended_psu: 700
    },
    {
      id: 'gpu_3',
      name: 'NVIDIA RTX 4070 Super',
      brand: 'NVIDIA',
      price: 25500,
      power_consumption: 220,
      recommended_psu: 750
    },
    {
      id: 'gpu_4',
      name: 'NVIDIA RTX 4080 Super',
      brand: 'NVIDIA',
      price: 42000,
      power_consumption: 320,
      recommended_psu: 850
    }
  ],
  ram: [
    {
      id: 'ram_1',
      name: 'Corsair Vengeance LPX 16GB DDR4-3200',
      brand: 'Corsair',
      price: 2200,
      type: 'DDR4'
    },
    {
      id: 'ram_2',
      name: 'G.Skill Trident Z5 32GB DDR5-6000',
      brand: 'G.Skill',
      price: 5800,
      type: 'DDR5'
    },
    {
      id: 'ram_3',
      name: 'Kingston Fury Beast 64GB DDR5-5600',
      brand: 'Kingston',
      price: 11500,
      type: 'DDR5'
    }
  ],
  storage: [
    {
      id: 'ssd_1',
      name: 'Samsung 980 PRO 1TB NVMe',
      brand: 'Samsung',
      price: 3200,
      type: 'NVMe M.2'
    },
    {
      id: 'ssd_2',
      name: 'WD Black SN850X 2TB NVMe',
      brand: 'Western Digital',
      price: 6800,
      type: 'NVMe M.2'
    }
  ],
  motherboard: [
    {
      id: 'mb_1',
      name: 'ASUS ROG Strix Z790-E',
      brand: 'ASUS',
      price: 12500,
      socket: 'LGA1700'
    },
    {
      id: 'mb_2',
      name: 'MSI MAG X670E Tomahawk',
      brand: 'MSI',
      price: 11800,
      socket: 'AM5'
    }
  ],
  psu: [
    {
      id: 'psu_1',
      name: 'Corsair RM850x 850W 80+ Gold',
      brand: 'Corsair',
      price: 4500,
      wattage: 850
    },
    {
      id: 'psu_2',
      name: 'EVGA SuperNOVA 1000 G6 1000W 80+ Gold',
      brand: 'EVGA',
      price: 6200,
      wattage: 1000
    }
  ]
};

// Helper function to find component by ID
function findComponentById(componentId: string): any {
  for (const [category, components] of Object.entries(hardwareInventory)) {
    const found = components.find((comp: any) => comp.id === componentId);
    if (found) {
      return { ...found, category };
    }
  }
  return null;
}

// Socket compatibility matrix
const socketCompatibility = {
  'LGA1700': ['LGA1700'],
  'AM4': ['AM4'],
  'AM5': ['AM5'],
  'LGA1200': ['LGA1200'],
  'LGA1151': ['LGA1151']
};

// RAM type compatibility
const ramCompatibility = {
  'DDR4': ['DDR4'],
  'DDR5': ['DDR5']
};

// Trade-in values (percentage of original retail price)
const tradeInValues = {
  cpu: {
    'Intel Core i5-12400F': { value: 3500, age_factor: 0.7 },
    'Intel Core i7-12700K': { value: 5500, age_factor: 0.7 },
    'AMD Ryzen 5 5600X': { value: 4200, age_factor: 0.75 },
    'AMD Ryzen 7 5700X': { value: 5800, age_factor: 0.75 },
    'Intel Core i5-10400F': { value: 2200, age_factor: 0.6 },
    'AMD Ryzen 5 3600': { value: 2800, age_factor: 0.65 }
  },
  gpu: {
    'NVIDIA RTX 3060': { value: 9500, age_factor: 0.6 },
    'NVIDIA RTX 3070': { value: 14500, age_factor: 0.65 },
    'NVIDIA RTX 4060': { value: 13500, age_factor: 0.8 },
    'AMD RX 6600': { value: 7500, age_factor: 0.6 },
    'AMD RX 6700 XT': { value: 11500, age_factor: 0.65 },
    'NVIDIA GTX 1660 Super': { value: 4500, age_factor: 0.5 }
  },
  ram: {
    '16GB DDR4-3200': { value: 1500, age_factor: 0.7 },
    '32GB DDR4-3200': { value: 3200, age_factor: 0.7 },
    '16GB DDR5-5600': { value: 3500, age_factor: 0.85 },
    '32GB DDR5-5600': { value: 7000, age_factor: 0.85 },
    '8GB DDR4-2666': { value: 800, age_factor: 0.6 }
  },
  motherboard: {
    'MSI B660M Pro': { value: 2200, age_factor: 0.6 },
    'ASUS B550M': { value: 1800, age_factor: 0.65 },
    'MSI Z690': { value: 4500, age_factor: 0.7 },
    'ASUS X570': { value: 3200, age_factor: 0.65 }
  },
  storage: {
    '500GB NVMe SSD': { value: 1200, age_factor: 0.7 },
    '1TB NVMe SSD': { value: 2200, age_factor: 0.75 },
    '2TB HDD': { value: 800, age_factor: 0.5 },
    '1TB HDD': { value: 500, age_factor: 0.5 }
  },
  psu: {
    '650W 80+ Bronze': { value: 1500, age_factor: 0.6 },
    '750W 80+ Gold': { value: 2800, age_factor: 0.7 },
    '850W 80+ Gold': { value: 3500, age_factor: 0.75 }
  }
};

interface CurrentSystem {
  cpu: string;
  gpu: string;
  ram: string;
  motherboard: string;
  storage: string;
  psu: string;
}

interface UpgradeComponent {
  id: string;
  name: string;
  price: number;
  socket?: string;
  type?: string;
  power_consumption?: number;
  recommended_psu?: number;
}

function checkCpuMotherboardCompatibility(currentCpuObj: any, currentMotherboardObj: any, newCpu: UpgradeComponent) {
  const currentSocket = currentCpuObj?.socket || 'Unknown';
  const newSocket = newCpu.socket || 'Unknown';

  const compatible = socketCompatibility[currentSocket as keyof typeof socketCompatibility]?.includes(newSocket) || false;
  
  return {
    compatible,
    currentSocket,
    newSocket,
    requiresMotherboardChange: !compatible,
    warnings: [] as string[]
  };
}

function checkRamCompatibility(currentRamObj: any, newRam: UpgradeComponent) {
  const currentType = currentRamObj?.type || 'DDR4';
  const newType = newRam.type || (newRam.name.includes('DDR5') ? 'DDR5' : 'DDR4');
  
  const compatible = ramCompatibility[currentType as keyof typeof ramCompatibility]?.includes(newType) || false;
  
  return {
    compatible,
    currentType,
    newType,
    requiresMotherboardChange: !compatible && currentType !== newType,
    warnings: [] as string[]
  };
}

function calculateTradeInValue(componentObj: any, componentType: keyof typeof tradeInValues) {
  const componentName = componentObj?.name || '';
  const tradeInData = tradeInValues[componentType];
  const componentData = tradeInData[componentName as keyof typeof tradeInData] as { value: number; age_factor: number } | undefined;
  
  if (componentData && typeof componentData === 'object' && 'value' in componentData && 'age_factor' in componentData) {
    return Math.round(componentData.value * componentData.age_factor);
  }
  
  // Fallback: Use 40% of current component price as trade-in value
  if (componentObj?.price) {
    return Math.round(componentObj.price * 0.4);
  }
  
  // Default fallback trade-in value (30% of estimated value)
  const estimatedValues = {
    cpu: 2500,
    gpu: 6000,
    ram: 1200,
    motherboard: 1500,
    storage: 800,
    psu: 1200
  };
  
  return Math.round(estimatedValues[componentType] * 0.3);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentSystem, upgradeComponents } = body;

    // Resolve current system component IDs to objects
    const currentSystemObjects: any = {};
    
    // Add safety check for currentSystem
    if (!currentSystem || typeof currentSystem !== 'object') {
      throw new Error('Current system data is invalid');
    }
    
    for (const [componentType, componentId] of Object.entries(currentSystem ?? {})) {
      if (componentId && typeof componentId === 'string') {
        const componentObj = findComponentById(componentId);
        currentSystemObjects[componentType] = componentObj;
      }
    }

    const compatibilityResults = [];
    const tradeInValues = [];
    let totalTradeInValue = 0;

    // Add safety check for upgradeComponents
    if (!upgradeComponents || typeof upgradeComponents !== 'object') {
      throw new Error('Upgrade components data is invalid');
    }

    // Check each component upgrade
    for (const [componentType, upgradeComponent] of Object.entries(upgradeComponents ?? {})) {
      if (!upgradeComponent || typeof upgradeComponent !== 'object') continue;

      const upgrade = upgradeComponent as UpgradeComponent;
      const currentComponentObj = currentSystemObjects[componentType];
      
      let compatibility = { compatible: true, warnings: [] as string[], requiresMotherboardChange: false };
      
      // CPU compatibility check
      if (componentType === 'cpu') {
        const cpuCompat = checkCpuMotherboardCompatibility(
          currentSystemObjects.cpu, 
          currentSystemObjects.motherboard, 
          upgrade
        );
        
        compatibility = {
          compatible: cpuCompat.compatible,
          warnings: [] as string[],
          requiresMotherboardChange: cpuCompat.requiresMotherboardChange
        };
        
        if (!cpuCompat.compatible) {
          compatibility.warnings.push(
            `${cpuCompat.currentSocket} → ${cpuCompat.newSocket} socket değişimi gerekiyor. Anakart da değiştirilmeli.`
          );
        }
      }
      
      // RAM compatibility check
      if (componentType === 'ram') {
        const ramCompat = checkRamCompatibility(currentSystemObjects.ram, upgrade);
        
        compatibility = {
          compatible: ramCompat.compatible,
          warnings: [] as string[],
          requiresMotherboardChange: ramCompat.requiresMotherboardChange
        };
        
        if (!ramCompat.compatible) {
          compatibility.warnings.push(
            `${ramCompat.currentType} → ${ramCompat.newType} değişimi için anakart kontrolü gerekiyor.`
          );
        }
      }

      // Calculate trade-in value
      const validComponentType = componentType as 'cpu' | 'gpu' | 'ram' | 'motherboard' | 'storage' | 'psu';
      const tradeInValue = calculateTradeInValue(currentComponentObj, validComponentType);
      totalTradeInValue += tradeInValue;
      
      tradeInValues.push({
        component: componentType,
        currentItem: currentComponentObj?.name || 'Unknown',
        tradeInValue,
        newItem: upgrade.name,
        newPrice: upgrade.price,
        netCost: upgrade.price - tradeInValue
      });

      compatibilityResults.push({
        component: componentType,
        compatible: compatibility.compatible,
        warnings: compatibility.warnings,
        requiresMotherboardChange: compatibility.requiresMotherboardChange
      });
    }

    // Check overall system compatibility
    const overallWarnings = [];
    const requiresMotherboardChange = compatibilityResults.some(r => r.requiresMotherboardChange);
    
    if (requiresMotherboardChange) {
      overallWarnings.push(
        'Bu upgrade için anakart değişimi gerekiyor. Anakart değişiminde Windows yeniden aktivasyon gerekebilir.'
      );
    }

    // Calculate power requirements
    const safeUpgradeComponents = upgradeComponents && typeof upgradeComponents === 'object' ? upgradeComponents : {};
    const totalPowerConsumption = Object.values(safeUpgradeComponents).reduce((total: number, component) => {
      if (!component || typeof component !== 'object') return total;
      const comp = component as UpgradeComponent;
      return total + (comp?.power_consumption || 0);
    }, 0);

    const currentPsuObj = currentSystemObjects.psu;
    const currentPsuWattage = currentPsuObj?.wattage || parseInt(currentPsuObj?.name?.match(/(\d+)W/)?.[1] || '650');
    const powerSufficient = currentPsuWattage >= totalPowerConsumption * 1.2; // 20% headroom

    if (!powerSufficient) {
      overallWarnings.push(
        `Mevcut PSU (${currentPsuWattage}W) yeterli olmayabilir. En az ${Math.ceil(totalPowerConsumption * 1.2)}W PSU önerilir.`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        compatibility: compatibilityResults,
        tradeInValues,
        summary: {
          totalTradeInValue,
          totalUpgradeCost: Object.values(safeUpgradeComponents).reduce((total: number, comp) => {
            if (!comp || typeof comp !== 'object') return total;
            const component = comp as UpgradeComponent;
            return total + (component?.price || 0);
          }, 0),
          netCost: Object.values(safeUpgradeComponents).reduce((total: number, comp) => {
            if (!comp || typeof comp !== 'object') return total;
            const component = comp as UpgradeComponent;
            return total + (component?.price || 0);
          }, 0) - totalTradeInValue,
          requiresMotherboardChange,
          powerSufficient,
          warnings: overallWarnings
        }
      }
    });

  } catch (error) {
    console.error('Compatibility check error:', error);
    return NextResponse.json(
      { success: false, error: 'Uyumluluk kontrolü yapılamadı' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        supportedSockets: Object.keys(socketCompatibility),
        tradeInCategories: Object.keys(tradeInValues),
        compatibilityMatrix: socketCompatibility
      }
    });
  } catch (error) {
    console.error('Compatibility config error:', error);
    return NextResponse.json(
      { success: false, error: 'Uyumluluk konfigürasyonu alınamadı' },
      { status: 500 }
    );
  }
}
