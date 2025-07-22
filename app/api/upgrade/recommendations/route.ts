
import { NextRequest, NextResponse } from 'next/server';

// Gaming recommendations database
const gameDatabase = {
  // Competitive FPS Games
  cs2: {
    name: 'Counter-Strike 2',
    category: 'competitive_fps',
    requirements: {
      minimum: {
        cpu: 'Intel Core i5-9600K / AMD Ryzen 5 2600',
        gpu: 'NVIDIA GTX 1060 / AMD RX 580',
        ram: '16GB DDR4',
        fps_target: 144
      },
      recommended: {
        cpu: 'Intel Core i7-12700K / AMD Ryzen 7 5700X',
        gpu: 'NVIDIA RTX 4060 / AMD RX 7600',
        ram: '32GB DDR4',
        fps_target: 300
      },
      competitive: {
        cpu: 'Intel Core i9-13900K / AMD Ryzen 9 7900X',
        gpu: 'NVIDIA RTX 4070 / AMD RX 7700 XT',
        ram: '32GB DDR5',
        fps_target: 500
      }
    },
    optimization_tips: [
      'CPU prioritesi yüksek - yüksek core count önemli',
      'RAM hızı kritik - DDR5-6000+ önerilen',
      'GPU VRAM: 8GB+ yeterli',
      'Low input lag için 240Hz+ monitor önerilen'
    ]
  },
  valorant: {
    name: 'Valorant',
    category: 'competitive_fps',
    requirements: {
      minimum: {
        cpu: 'Intel Core i3-9100 / AMD Ryzen 3 2200G',
        gpu: 'NVIDIA GTX 1050 Ti / AMD RX 560',
        ram: '16GB DDR4',
        fps_target: 144
      },
      recommended: {
        cpu: 'Intel Core i5-12600K / AMD Ryzen 5 5600X',
        gpu: 'NVIDIA RTX 4060 / AMD RX 7600',
        ram: '32GB DDR4',
        fps_target: 300
      },
      competitive: {
        cpu: 'Intel Core i7-13700K / AMD Ryzen 7 7700X',
        gpu: 'NVIDIA RTX 4070 / AMD RX 7700 XT',
        ram: '32GB DDR5',
        fps_target: 500
      }
    },
    optimization_tips: [
      'CPU single-core performansı kritik',
      'GPU: Mid-range yeterli, VRAM: 6GB+',
      'RAM latency önemli - low latency kitleri tercih edin',
      'Stable FPS için frame cap kullanın'
    ]
  },
  cyberpunk2077: {
    name: 'Cyberpunk 2077',
    category: 'aaa_rpg',
    requirements: {
      minimum: {
        cpu: 'Intel Core i7-12700 / AMD Ryzen 7 5700X',
        gpu: 'NVIDIA RTX 4060 Ti / AMD RX 7700 XT',
        ram: '32GB DDR4',
        fps_target: 60
      },
      recommended: {
        cpu: 'Intel Core i9-13900K / AMD Ryzen 9 7900X',
        gpu: 'NVIDIA RTX 4080 / AMD RX 7900 XTX',
        ram: '32GB DDR5',
        fps_target: 90
      },
      enthusiast: {
        cpu: 'Intel Core i9-14900K / AMD Ryzen 9 7950X',
        gpu: 'NVIDIA RTX 4090 / AMD RX 7900 XTX',
        ram: '64GB DDR5',
        fps_target: 120
      }
    },
    optimization_tips: [
      'GPU VRAM: 12GB+ kritik - textures için',
      'Ray tracing için RTX 4070+ önerilen',
      'DLSS 3.0 Frame Generation desteği önemli',
      '32GB+ RAM - asset loading için'
    ]
  },
  apex_legends: {
    name: 'Apex Legends',
    category: 'battle_royale',
    requirements: {
      minimum: {
        cpu: 'Intel Core i5-11400 / AMD Ryzen 5 3600',
        gpu: 'NVIDIA RTX 3060 / AMD RX 6600',
        ram: '16GB DDR4',
        fps_target: 144
      },
      recommended: {
        cpu: 'Intel Core i7-12700K / AMD Ryzen 7 5700X',
        gpu: 'NVIDIA RTX 4070 / AMD RX 7700 XT',
        ram: '32GB DDR4',
        fps_target: 180
      },
      competitive: {
        cpu: 'Intel Core i9-13900K / AMD Ryzen 9 7900X',
        gpu: 'NVIDIA RTX 4080 / AMD RX 7900 XTX',
        ram: '32GB DDR5',
        fps_target: 240
      }
    },
    optimization_tips: [
      'Balanced CPU+GPU gereksinimleri',
      'VRAM: 8GB+ önerilen',
      'Variable refresh rate desteği önemli',
      'Düşük latency için competitive settings'
    ]
  }
};

const useCase2Recommendations = {
  streaming: {
    name: 'Streaming & Content Creation',
    primary_focus: 'Multi-core CPU performance',
    recommended_specs: {
      cpu: 'AMD Ryzen 9 7900X / Intel Core i9-13900K',
      gpu: 'NVIDIA RTX 4070 Ti / AMD RX 7800 XT',
      ram: '64GB DDR5',
      storage: '2TB NVMe SSD',
      additional: 'Capture card, multiple monitors'
    },
    budget_ranges: {
      budget: { min: 25000, max: 35000 },
      mid_range: { min: 35000, max: 50000 },
      high_end: { min: 50000, max: 80000 }
    },
    optimization_tips: [
      'CPU encode > GPU encode (quality)',
      'NVENC support için NVIDIA GPU tercih edin',
      'Hızlı storage - large video files için',
      'Dual-PC setup advanced streamers için'
    ]
  },
  vr_gaming: {
    name: 'VR Gaming',
    primary_focus: 'Stable high FPS + low latency',
    recommended_specs: {
      cpu: 'Intel Core i7-13700K / AMD Ryzen 7 7700X',
      gpu: 'NVIDIA RTX 4080 / AMD RX 7900 XTX',
      ram: '32GB DDR5',
      storage: '1TB NVMe SSD',
      additional: 'VR headset, room-scale setup'
    },
    budget_ranges: {
      entry: { min: 40000, max: 55000 },
      premium: { min: 55000, max: 75000 },
      enthusiast: { min: 75000, max: 100000 }
    },
    optimization_tips: [
      'GPU VRAM: 12GB+ önerilen',
      'Stable 90/120 FPS kritik - motion sickness',
      'USB bandwidth yeterli olmalı',
      'Room temperature monitoring önemli'
    ]
  },
  workstation: {
    name: 'Professional Workstation',
    primary_focus: 'Productivity + rendering',
    recommended_specs: {
      cpu: 'AMD Threadripper / Intel Xeon',
      gpu: 'NVIDIA RTX 4080 / Quadro series',
      ram: '128GB DDR5 ECC',
      storage: '4TB NVMe RAID',
      additional: 'Professional monitors, UPS'
    },
    budget_ranges: {
      basic: { min: 50000, max: 75000 },
      professional: { min: 75000, max: 125000 },
      enterprise: { min: 125000, max: 200000 }
    },
    optimization_tips: [
      'ECC memory reliability için',
      'Professional GPU drivers',
      'Multiple display support',
      'Network attached storage'
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    const useCase = searchParams.get('use_case');
    const budget = searchParams.get('budget');
    const target_fps = searchParams.get('target_fps');
    const target_resolution = searchParams.get('target_resolution') || '1080p';

    if (game) {
      const gameData = gameDatabase[game as keyof typeof gameDatabase];
      if (!gameData) {
        return NextResponse.json(
          { success: false, error: 'Oyun bulunamadı' },
          { status: 404 }
        );
      }

      // Determine recommendation level based on target FPS
      let recommendationLevel = 'minimum';
      if (target_fps) {
        const fps = parseInt(target_fps);
        if (fps >= 300) recommendationLevel = 'competitive';
        else if (fps >= 144) recommendationLevel = 'recommended';
      }

      const recommendations = {
        game: gameData,
        recommended_level: recommendationLevel,
        target_resolution,
        specific_builds: generateGameBuilds(gameData, recommendationLevel, budget ?? undefined),
        performance_estimate: estimateGamePerformance(game, recommendationLevel),
        peripherals: getPeripheralRecommendations(gameData.category)
      };

      return NextResponse.json({
        success: true,
        data: recommendations
      });
    }

    if (useCase) {
      const useCaseData = useCase2Recommendations[useCase as keyof typeof useCase2Recommendations];
      if (!useCaseData) {
        return NextResponse.json(
          { success: false, error: 'Kullanım durumu bulunamadı' },
          { status: 404 }
        );
      }

      const recommendations = {
        use_case: useCaseData,
        builds: generateUseCaseBuilds(useCaseData, budget ?? undefined),
        workflow_optimization: getWorkflowOptimization(useCase)
      };

      return NextResponse.json({
        success: true,
        data: recommendations
      });
    }

    // Return general recommendations overview
    const overview = {
      popular_games: Object.keys(gameDatabase),
      use_cases: Object.keys(useCase2Recommendations),
      trending_builds: [
        {
          name: 'Competitive FPS Build',
          price_range: '25000-35000 TL',
          target: '300+ FPS CS2/Valorant',
          popularity: 95
        },
        {
          name: 'AAA Gaming Build',
          price_range: '40000-55000 TL',
          target: '4K 60+ FPS',
          popularity: 88
        },
        {
          name: 'Content Creator Build',
          price_range: '50000-70000 TL',
          target: 'Streaming + Gaming',
          popularity: 78
        }
      ],
      seasonal_recommendations: [
        'Intel 13th gen excellent price/performance',
        'DDR5 prices normalized - upgrade recommended',
        'RTX 4070 Ti sweet spot for 1440p gaming',
        'AM5 platform future-proof choice'
      ]
    };

    return NextResponse.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { success: false, error: 'Öneriler alınamadı' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateGameBuilds(gameData: any, level: string, budget?: string) {
  const builds = [];
  const requirements = gameData.requirements[level];
  
  // Budget build
  if (!budget || budget === 'budget') {
    builds.push({
      name: 'Budget Gaming Build',
      price_range: '20000-30000 TL',
      specs: requirements,
      expected_fps: requirements.fps_target,
      components: [
        'CPU: ' + requirements.cpu.split('/')[0].trim(),
        'GPU: ' + requirements.gpu.split('/')[0].trim(),
        'RAM: ' + requirements.ram,
        'Storage: 500GB NVMe SSD',
        'PSU: 650W 80+ Bronze'
      ]
    });
  }

  return builds;
}

function generateUseCaseBuilds(useCaseData: any, budget?: string) {
  return Object.entries(useCaseData.budget_ranges).map(([range, prices]: [string, any]) => ({
    name: `${useCaseData.name} - ${range}`,
    price_range: `${prices.min}-${prices.max} TL`,
    specs: useCaseData.recommended_specs,
    optimization_focus: useCaseData.primary_focus
  }));
}

function estimateGamePerformance(game: string, level: string) {
  const basePerformance = {
    cs2: { minimum: 180, recommended: 300, competitive: 450 },
    valorant: { minimum: 200, recommended: 350, competitive: 500 },
    cyberpunk2077: { minimum: 45, recommended: 75, competitive: 110 },
    apex_legends: { minimum: 120, recommended: 160, competitive: 220 }
  };

  const performance = basePerformance[game as keyof typeof basePerformance];
  return performance ? performance[level as keyof typeof performance] : 60;
}

function getPeripheralRecommendations(category: string) {
  const peripherals = {
    competitive_fps: [
      'Monitor: 240Hz+ low latency (ASUS VG259QM, BenQ ZOWIE XL2546K)',
      'Mouse: High DPI gaming mouse (Logitech G Pro X, Razer DeathAdder V3)',
      'Keyboard: Mechanical gaming keyboard (SteelSeries Apex Pro)',
      'Headset: Competitive audio (HyperX Cloud II, SteelSeries Arctis 7)'
    ],
    aaa_rpg: [
      'Monitor: 4K IPS or 1440p 144Hz (LG 27GP950, ASUS PG279QM)',
      'Audio: High-quality headphones (Audio-Technica ATH-M50x)',
      'Controller: Xbox Wireless Controller',
      'Lighting: RGB setup for immersion'
    ],
    battle_royale: [
      'Monitor: 1440p 165Hz (Dell S2721DGF)',
      'Mouse: Lightweight gaming mouse (Glorious Model O)',
      'Keyboard: TKL mechanical (Ducky One 2 Mini)',
      'Headset: Spatial audio (SteelSeries Arctis Pro)'
    ]
  };

  return peripherals[category as keyof typeof peripherals] || peripherals.competitive_fps;
}

function getWorkflowOptimization(useCase: string) {
  const optimizations = {
    streaming: [
      'OBS Studio optimization settings',
      'Dedicated streaming PC setup',
      'Network bandwidth requirements',
      'Audio setup (XLR mic, audio interface)'
    ],
    vr_gaming: [
      'Room setup requirements',
      'Cable management solutions',
      'VR headset comparison',
      'Motion sickness prevention'
    ],
    workstation: [
      'Professional software optimization',
      'Backup and redundancy strategies',
      'Color calibration setup',
      'Ergonomic workspace design'
    ]
  };

  return optimizations[useCase as keyof typeof optimizations] || [];
}
