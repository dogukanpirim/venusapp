
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

// Hardware inventory data
const hardwareInventory = {
  cpu: [
    {
      id: 'cpu_1',
      name: 'Intel Core i5-13600K',
      brand: 'Intel',
      price: 8500,
      stock: 15,
      cores: 14,
      threads: 20,
      baseClock: 3.5,
      boostClock: 5.1,
      gaming_score: 92,
      productivity_score: 88,
      power_consumption: 125,
      socket: 'LGA1700',
      benchmark_fps: { cs2: 450, valorant: 380, apex: 180, cyberpunk: 110 },
      image: 'https://down-ph.img.susercontent.com/file/ph-11134201-23020-jpz4io9271nva1'
    },
    {
      id: 'cpu_2',
      name: 'AMD Ryzen 7 7700X',
      brand: 'AMD',
      price: 9200,
      stock: 12,
      cores: 8,
      threads: 16,
      baseClock: 4.5,
      boostClock: 5.4,
      gaming_score: 95,
      productivity_score: 94,
      power_consumption: 105,
      socket: 'AM5',
      benchmark_fps: { cs2: 470, valorant: 400, apex: 185, cyberpunk: 115 },
      image: 'https://www.acecomputerworld.com.au/wp-content/uploads/2022/11/R7-7700X.jpg'
    },
    {
      id: 'cpu_3',
      name: 'Intel Core i9-13900K',
      brand: 'Intel',
      price: 14500,
      stock: 8,
      cores: 24,
      threads: 32,
      baseClock: 3.0,
      boostClock: 5.8,
      gaming_score: 98,
      productivity_score: 99,
      power_consumption: 150,
      socket: 'LGA1700',
      benchmark_fps: { cs2: 520, valorant: 450, apex: 200, cyberpunk: 130 },
      image: 'https://www.pcstudio.in/wp-content/uploads/2022/10/Intel-Core-I9-13900K-Processor-1.jpg'
    }
  ],
  gpu: [
    {
      id: 'gpu_1',
      name: 'NVIDIA RTX 4060 Ti',
      brand: 'NVIDIA',
      price: 18500,
      stock: 10,
      memory: 16,
      memory_type: 'GDDR6',
      gaming_score: 85,
      ray_tracing_score: 78,
      power_consumption: 165,
      recommended_psu: 650,
      benchmark_fps: { cs2: 300, valorant: 450, apex: 140, cyberpunk: 75 },
      image: 'https://htlmart.com/wp-content/uploads/2025/01/Htlmart-NVIDIA-GeForce-RTX-4060-Ti-Graphics-Card-16-GB-3.jpg'
    },
    {
      id: 'gpu_2',
      name: 'AMD RX 7700 XT',
      brand: 'AMD',
      price: 17800,
      stock: 14,
      memory: 12,
      memory_type: 'GDDR6',
      gaming_score: 87,
      ray_tracing_score: 65,
      power_consumption: 245,
      recommended_psu: 700,
      benchmark_fps: { cs2: 320, valorant: 480, apex: 145, cyberpunk: 80 },
      image: 'https://media.ldlc.com/r1600/ld/products/00/06/06/18/LD0006061889.jpg'
    },
    {
      id: 'gpu_3',
      name: 'NVIDIA RTX 4070 Super',
      brand: 'NVIDIA',
      price: 25500,
      stock: 7,
      memory: 12,
      memory_type: 'GDDR6X',
      gaming_score: 92,
      ray_tracing_score: 88,
      power_consumption: 220,
      recommended_psu: 750,
      benchmark_fps: { cs2: 380, valorant: 520, apex: 165, cyberpunk: 95 },
      image: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/80fb7642-dc61-44d4-8b52-4b5a5089e2f3.jpg'
    },
    {
      id: 'gpu_4',
      name: 'NVIDIA RTX 4080 Super',
      brand: 'NVIDIA',
      price: 42000,
      stock: 5,
      memory: 16,
      memory_type: 'GDDR6X',
      gaming_score: 97,
      ray_tracing_score: 95,
      power_consumption: 320,
      recommended_psu: 850,
      benchmark_fps: { cs2: 450, valorant: 600, apex: 190, cyberpunk: 120 },
      image: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/36adf8ad-7e84-409f-b988-43ffc0c0c0d8.jpg'
    }
  ],
  ram: [
    {
      id: 'ram_1',
      name: 'Corsair Vengeance LPX 16GB DDR4-3200',
      brand: 'Corsair',
      price: 2200,
      stock: 25,
      capacity: 16,
      speed: 3200,
      type: 'DDR4',
      latency: 'CL16',
      gaming_score: 80,
      modules: 2,
      image: 'https://media.ldlc.com/r1600/ld/products/00/02/82/74/LD0002827445_2_0004801235_0004801256_0004880366_0004880387_0004880453.jpg'
    },
    {
      id: 'ram_2',
      name: 'G.Skill Trident Z5 32GB DDR5-6000',
      brand: 'G.Skill',
      price: 5800,
      stock: 18,
      capacity: 32,
      speed: 6000,
      type: 'DDR5',
      latency: 'CL36',
      gaming_score: 95,
      modules: 2,
      image: 'https://down-sg.img.susercontent.com/file/sg-11134207-7qvet-lfqnp4yavij26f'
    },
    {
      id: 'ram_3',
      name: 'Kingston Fury Beast 64GB DDR5-5600',
      brand: 'Kingston',
      price: 11500,
      stock: 8,
      capacity: 64,
      speed: 5600,
      type: 'DDR5',
      latency: 'CL40',
      gaming_score: 92,
      modules: 4,
      image: 'https://media.ldlc.com/r1600/ld/products/00/06/03/60/LD0006036077_0006036081_0006036083.jpg'
    }
  ],
  storage: [
    {
      id: 'ssd_1',
      name: 'Samsung 980 PRO 1TB NVMe',
      brand: 'Samsung',
      price: 3200,
      stock: 20,
      capacity: 1000,
      type: 'NVMe M.2',
      read_speed: 7000,
      write_speed: 5000,
      gaming_score: 90,
      interface: 'PCIe 4.0',
      image: 'https://media.ldlc.com/r1600/ld/products/00/05/73/74/LD0005737471_1.jpg'
    },
    {
      id: 'ssd_2',
      name: 'WD Black SN850X 2TB NVMe',
      brand: 'Western Digital',
      price: 6800,
      stock: 15,
      capacity: 2000,
      type: 'NVMe M.2',
      read_speed: 7300,
      write_speed: 6600,
      gaming_score: 95,
      interface: 'PCIe 4.0',
      image: 'https://www.klarna.com/sac/product/504x504/3007512084/Western-Digital-Black-SN850X-NVMe-SSD-M.2-2TB.jpg?ph=true'
    }
  ],
  motherboard: [
    {
      id: 'mb_1',
      name: 'ASUS ROG Strix Z790-E',
      brand: 'ASUS',
      price: 12500,
      stock: 12,
      socket: 'LGA1700',
      chipset: 'Z790',
      ram_slots: 4,
      max_ram: 128,
      pcie_slots: 3,
      m2_slots: 4,
      wifi: true,
      gaming_score: 92,
      image: 'https://www.primeabgb.com/wp-content/uploads/2024/06/ASUS-ROG-STRIX-Z790-E-GAMING-WIFI-II-LGA-1700-ATX-Z790-Motherboard-1.jpg'
    },
    {
      id: 'mb_2',
      name: 'MSI MAG X670E Tomahawk',
      brand: 'MSI',
      price: 11800,
      stock: 10,
      socket: 'AM5',
      chipset: 'X670E',
      ram_slots: 4,
      max_ram: 128,
      pcie_slots: 3,
      m2_slots: 4,
      wifi: true,
      gaming_score: 90,
      image: 'https://files.pccasegear.com/images/1682294673-X670E-TOMAHAWK-thb.jpg'
    }
  ],
  psu: [
    {
      id: 'psu_1',
      name: 'Corsair RM850x 850W 80+ Gold',
      brand: 'Corsair',
      price: 4500,
      stock: 18,
      wattage: 850,
      efficiency: '80+ Gold',
      modular: true,
      gaming_score: 88,
      image: 'https://files.pccasegear.com/images/CP-9020200-AU-thumb.jpg'
    },
    {
      id: 'psu_2',
      name: 'EVGA SuperNOVA 1000 G6 1000W 80+ Gold',
      brand: 'EVGA',
      price: 6200,
      stock: 12,
      wattage: 1000,
      efficiency: '80+ Gold',
      modular: true,
      gaming_score: 92,
      image: 'https://cdn.abacus.ai/images/98814cd6-8644-4abc-848f-9d5f71b7d543.png'
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let data: any = {};
    
    if (category) {
      const categoryData = hardwareInventory[category as keyof typeof hardwareInventory];
      data = Array.isArray(categoryData) ? categoryData : [];
    } else {
      // Return the full categorized structure for simulator
      data = hardwareInventory;
    }

    // Apply filters and sorting only when we have an array (specific category requested)
    if (Array.isArray(data)) {
      // Apply filters
      if (brand) {
        data = data.filter((item: any) => item.brand?.toLowerCase().includes(brand.toLowerCase()));
      }
      if (minPrice) {
        data = data.filter((item: any) => item.price >= parseInt(minPrice));
      }
      if (maxPrice) {
        data = data.filter((item: any) => item.price <= parseInt(maxPrice));
      }

      // Apply sorting
      data.sort((a: any, b: any) => {
          let aVal = a[sortBy as keyof typeof a];
          let bVal = b[sortBy as keyof typeof b];
          
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
          
          if (sortOrder === 'desc') {
            return aVal < bVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
    }

    return NextResponse.json({
      success: true,
      data,
      total: Array.isArray(data) ? data.length : Object.keys(data).length,
      categories: Object.keys(hardwareInventory)
    });

  } catch (error) {
    console.error('Hardware API error:', error);
    return NextResponse.json(
      { success: false, error: 'Hardware bilgileri alınamadı' },
      { status: 500 }
    );
  }
}
