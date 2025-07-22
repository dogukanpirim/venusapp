
import { NextRequest, NextResponse } from 'next/server';

// Mock current system data - In real app, this would come from Gizmo API or system monitoring
const currentSystems = [
  {
    pc_id: 'PC001',
    name: 'Gaming PC 1',
    status: 'active',
    current_specs: {
      cpu: 'Intel Core i5-12400F',
      gpu: 'NVIDIA RTX 3060',
      ram: '16GB DDR4-3200',
      storage: '500GB NVMe SSD',
      motherboard: 'MSI B660M Pro',
      psu: '650W 80+ Bronze'
    },
    performance_scores: {
      cpu_score: 75,
      gpu_score: 70,
      ram_score: 80,
      storage_score: 85,
      overall_score: 77
    },
    bottlenecks: [
      { component: 'GPU', severity: 'medium', impact: 15 },
      { component: 'CPU', severity: 'low', impact: 8 }
    ],
    gaming_performance: {
      cs2: 280,
      valorant: 320,
      apex: 110,
      cyberpunk: 55
    },
    upgrade_priority: [
      { component: 'GPU', priority: 1, expected_gain: 25 },
      { component: 'CPU', priority: 2, expected_gain: 15 },
      { component: 'RAM', priority: 3, expected_gain: 8 }
    ]
  },
  {
    pc_id: 'PC002',
    name: 'Gaming PC 2',
    status: 'active',
    current_specs: {
      cpu: 'AMD Ryzen 5 5600X',
      gpu: 'NVIDIA RTX 4060',
      ram: '32GB DDR4-3600',
      storage: '1TB NVMe SSD',
      motherboard: 'ASUS B550M',
      psu: '750W 80+ Gold'
    },
    performance_scores: {
      cpu_score: 85,
      gpu_score: 82,
      ram_score: 90,
      storage_score: 88,
      overall_score: 86
    },
    bottlenecks: [
      { component: 'CPU', severity: 'low', impact: 5 }
    ],
    gaming_performance: {
      cs2: 350,
      valorant: 400,
      apex: 130,
      cyberpunk: 70
    },
    upgrade_priority: [
      { component: 'GPU', priority: 1, expected_gain: 18 },
      { component: 'CPU', priority: 2, expected_gain: 12 }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pcId = searchParams.get('pc_id');

    if (pcId) {
      const system = currentSystems.find(pc => pc.pc_id === pcId);
      if (!system) {
        return NextResponse.json(
          { success: false, error: 'PC bulunamadı' },
          { status: 404 }
        );
      }

      // Calculate detailed analysis for specific PC
      const detailedAnalysis = {
        ...system,
        temperature_data: {
          cpu_temp: Math.floor(Math.random() * 20) + 45, // 45-65°C
          gpu_temp: Math.floor(Math.random() * 25) + 55, // 55-80°C
          status: 'normal'
        },
        power_consumption: {
          current: Math.floor(Math.random() * 100) + 250, // 250-350W
          max: 450,
          efficiency: 78
        },
        upgrade_recommendations: [
          {
            type: 'immediate',
            component: 'GPU',
            current: system.current_specs.gpu,
            recommended: 'NVIDIA RTX 4070 Super',
            performance_gain: '35%',
            cost: 25500,
            fps_improvement: {
              cs2: '+120 FPS',
              valorant: '+150 FPS',
              apex: '+55 FPS',
              cyberpunk: '+40 FPS'
            }
          },
          {
            type: 'future',
            component: 'CPU',
            current: system.current_specs.cpu,
            recommended: 'Intel Core i7-13700K',
            performance_gain: '25%',
            cost: 11500,
            fps_improvement: {
              cs2: '+80 FPS',
              valorant: '+90 FPS',
              apex: '+35 FPS',
              cyberpunk: '+25 FPS'
            }
          }
        ]
      };

      return NextResponse.json({
        success: true,
        data: detailedAnalysis
      });
    }

    // Return overview of all systems
    const overview = {
      total_systems: currentSystems.length,
      average_performance: Math.round(
        currentSystems.reduce((sum, pc) => sum + pc.performance_scores.overall_score, 0) / currentSystems.length
      ),
      systems_needing_upgrade: currentSystems.filter(pc => pc.performance_scores.overall_score < 80).length,
      top_bottlenecks: [
        { component: 'GPU', frequency: 8, impact: 'high' },
        { component: 'CPU', frequency: 5, impact: 'medium' },
        { component: 'RAM', frequency: 3, impact: 'low' }
      ],
      systems: currentSystems.map(pc => ({
        pc_id: pc.pc_id,
        name: pc.name,
        status: pc.status,
        overall_score: pc.performance_scores.overall_score,
        primary_bottleneck: pc.bottlenecks[0]?.component || 'none',
        upgrade_needed: pc.performance_scores.overall_score < 80
      }))
    };

    return NextResponse.json({
      success: true,
      data: overview
    });

  } catch (error) {
    console.error('System analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Sistem analizi yapılamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { components, target_fps, games } = body;

    // Simulate system analysis with custom components
    const analysisResult = {
      estimated_performance: {
        overall_score: Math.floor(Math.random() * 30) + 70,
        gaming_score: Math.floor(Math.random() * 25) + 75,
        productivity_score: Math.floor(Math.random() * 25) + 75
      },
      predicted_fps: {
        cs2: Math.floor(Math.random() * 200) + 250,
        valorant: Math.floor(Math.random() * 200) + 300,
        apex: Math.floor(Math.random() * 100) + 100,
        cyberpunk: Math.floor(Math.random() * 60) + 60
      },
      bottlenecks: [],
      compatibility_issues: [],
      power_requirements: Math.floor(Math.random() * 200) + 400,
      estimated_cost: Object.values(components).reduce((sum: number, component: any) => sum + (component.price || 0), 0),
      meets_target: true
    };

    return NextResponse.json({
      success: true,
      data: analysisResult
    });

  } catch (error) {
    console.error('Custom analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Özel analiz yapılamadı' },
      { status: 500 }
    );
  }
}
