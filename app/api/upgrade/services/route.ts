
import { NextRequest, NextResponse } from 'next/server';

const servicePackages = [
  {
    id: 'budget_gaming',
    name: 'Budget Gaming Paketi',
    description: 'Uygun fiyatlı oyun deneyimi için ideal upgrade paketi',
    target_audience: 'Casual gamers, öğrenciler',
    price: 15500,
    installation_fee: 500,
    components: {
      cpu: 'AMD Ryzen 5 5600',
      gpu: 'NVIDIA RTX 4060',
      ram: '16GB DDR4-3200',
      storage: '500GB NVMe SSD',
      motherboard: 'MSI B450M Pro',
      psu: '650W 80+ Bronze'
    },
    performance_targets: {
      '1080p_high': '60+ FPS',
      '1080p_competitive': '120+ FPS',
      cs2: '280+ FPS',
      valorant: '300+ FPS',
      apex: '110+ FPS',
      cyberpunk: '65+ FPS'
    },
    features: [
      'Tüm popüler oyunları 1080p yüksek ayarlarda oynatır',
      'Competitive oyunlarda yüksek FPS garantisi',
      '2 yıl garanti',
      'Ücretsiz kurulum ve test',
      '6 ay teknik destek'
    ],
    installation_time: '2-3 saat',
    warranty: '2 yıl',
    support_duration: '6 ay',
    recommended_for: ['Fortnite', 'Valorant', 'CS2', 'League of Legends', 'Overwatch 2']
  },
  {
    id: 'mid_range',
    name: 'Mid-Range Performance Paketi',
    description: 'Dengeili performans ve fiyat için optimize edilmiş paket',
    target_audience: 'Enthusiast gamers, content creators',
    price: 28500,
    installation_fee: 750,
    components: {
      cpu: 'Intel Core i5-13600K',
      gpu: 'NVIDIA RTX 4070 Super',
      ram: '32GB DDR5-5600',
      storage: '1TB NVMe SSD',
      motherboard: 'ASUS Z790-A',
      psu: '750W 80+ Gold'
    },
    performance_targets: {
      '1440p_high': '80+ FPS',
      '1080p_ultra': '120+ FPS',
      cs2: '400+ FPS',
      valorant: '450+ FPS',
      apex: '150+ FPS',
      cyberpunk: '85+ FPS'
    },
    features: [
      '1440p yüksek ayarlarda mükemmel performans',
      'Ray tracing desteği',
      'Streaming ve content creation uyumlu',
      '3 yıl garanti',
      'Ücretsiz kurulum ve optimizasyon',
      '1 yıl premium teknik destek',
      'RGB aydınlatma sistemi'
    ],
    installation_time: '3-4 saat',
    warranty: '3 yıl',
    support_duration: '1 yıl',
    recommended_for: ['Cyberpunk 2077', 'Red Dead Redemption 2', 'Call of Duty', 'Battlefield', 'Apex Legends']
  },
  {
    id: 'high_end',
    name: 'High-End Enthusiast Paketi',
    description: 'En yüksek performans ve gelecek garantisi',
    target_audience: 'Professional gamers, enthusiasts',
    price: 55000,
    installation_fee: 1000,
    components: {
      cpu: 'Intel Core i9-13900K',
      gpu: 'NVIDIA RTX 4080 Super',
      ram: '64GB DDR5-6000',
      storage: '2TB NVMe SSD',
      motherboard: 'ASUS ROG Maximus Z790',
      psu: '1000W 80+ Platinum',
      cooling: 'AIO Liquid Cooling 280mm'
    },
    performance_targets: {
      '4k_high': '60+ FPS',
      '1440p_ultra': '120+ FPS',
      cs2: '500+ FPS',
      valorant: '600+ FPS',
      apex: '180+ FPS',
      cyberpunk: '110+ FPS'
    },
    features: [
      '4K gaming hazır sistem',
      'En gelişmiş ray tracing performansı',
      'Professional streaming ve editing',
      'VR ready',
      '5 yıl garanti',
      'Premium kurulum ve optimizasyon',
      '2 yıl öncelikli teknik destek',
      'RGB aydınlatma + tempered glass',
      'Overclocking servisi dahil'
    ],
    installation_time: '4-5 saat',
    warranty: '5 yıl',
    support_duration: '2 yıl',
    recommended_for: ['Cyberpunk 2077 4K', 'Flight Simulator', 'VR Games', 'Content Creation', 'Professional Esports']
  },
  {
    id: 'content_creator',
    name: 'Content Creator Paketi',
    description: 'Gaming ve content creation için optimize edilmiş',
    target_audience: 'Streamers, YouTubers, editors',
    price: 42000,
    installation_fee: 800,
    components: {
      cpu: 'AMD Ryzen 9 7900X',
      gpu: 'NVIDIA RTX 4070 Ti',
      ram: '64GB DDR5-5600',
      storage: '2TB NVMe SSD',
      motherboard: 'MSI X670E Gaming Plus',
      psu: '850W 80+ Gold',
      capture_card: 'Elgato 4K60 Pro MK.2'
    },
    performance_targets: {
      streaming_quality: '1080p60 + 1440p gameplay',
      encoding: 'Hardware H.264/H.265',
      multitasking: 'Gaming + Streaming + Recording',
      render_speed: '4K video: 2x real-time'
    },
    features: [
      'Simultane gaming ve streaming',
      '4K video editing capability',
      'Professional capture card dahil',
      'Multi-monitor destek',
      '3 yıl garanti',
      'Creator software bundle',
      '1 yıl teknik destek',
      'Streaming setup consultation'
    ],
    installation_time: '4-5 saat',
    warranty: '3 yıl',
    support_duration: '1 yıl',
    recommended_for: ['Twitch Streaming', 'YouTube Content', '4K Video Editing', 'Multi-Camera Setup']
  },
  {
    id: 'competitive_esports',
    name: 'Competitive Esports Paketi',
    description: 'Professional esports için ultra-high FPS odaklı',
    target_audience: 'Professional players, competitive gamers',
    price: 35000,
    installation_fee: 750,
    components: {
      cpu: 'Intel Core i7-13700K',
      gpu: 'NVIDIA RTX 4070',
      ram: '32GB DDR5-6000 (Low Latency)',
      storage: '1TB NVMe SSD (Ultra Fast)',
      motherboard: 'ASUS ROG Strix Z790-F',
      psu: '750W 80+ Platinum',
      cooling: 'Premium Air Cooling'
    },
    performance_targets: {
      competitive_fps: '400+ FPS stable',
      input_latency: '<1ms system latency',
      consistency: '1% low FPS >300',
      temperature: 'Under 65°C under load'
    },
    features: [
      'Ultra-high FPS garantili (400+ FPS)',
      'Minimum input lag optimizasyonu',
      'Competitive gaming monitor önerileri',
      'Professional peripherals discount',
      '3 yıl garanti',
      'Tournament-ready setup',
      '1 yıl priority support',
      'Performance monitoring tools'
    ],
    installation_time: '3-4 saat',
    warranty: '3 yıl',
    support_duration: '1 yıl',
    recommended_for: ['CS2 Pro', 'Valorant Competitive', 'Apex Legends Ranked', 'Overwatch 2 Competitive']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const packageId = searchParams.get('id');
    const category = searchParams.get('category');
    const maxPrice = searchParams.get('maxPrice');

    let filteredPackages = [...servicePackages];

    if (packageId) {
      const selectedPackage = servicePackages.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        return NextResponse.json(
          { success: false, error: 'Paket bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: selectedPackage
      });
    }

    if (category) {
      // Filter by target audience or price range
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.target_audience.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (maxPrice) {
      filteredPackages = filteredPackages.filter(pkg => 
        pkg.price <= parseInt(maxPrice)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredPackages,
      total: filteredPackages.length,
      categories: ['gaming', 'content_creation', 'competitive', 'budget', 'premium']
    });

  } catch (error) {
    console.error('Service packages error:', error);
    return NextResponse.json(
      { success: false, error: 'Servis paketleri alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { package_id, customer_info, installation_date, additional_services } = body;

    // Simulate package order/quote generation
    const selectedPackage = servicePackages.find(pkg => pkg.id === package_id);
    if (!selectedPackage) {
      return NextResponse.json(
        { success: false, error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    const quote = {
      quote_id: `QUOTE_${Date.now()}`,
      package: selectedPackage,
      customer: customer_info,
      installation_date,
      additional_services: additional_services || [],
      pricing: {
        package_price: selectedPackage.price,
        installation_fee: selectedPackage.installation_fee,
        additional_services_cost: 0,
        total: selectedPackage.price + selectedPackage.installation_fee
      },
      estimated_completion: new Date(
        new Date(installation_date).getTime() + (selectedPackage.installation_time.includes('5') ? 5 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000)
      ),
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending_approval'
    };

    return NextResponse.json({
      success: true,
      data: quote,
      message: 'Teklif başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('Package order error:', error);
    return NextResponse.json(
      { success: false, error: 'Sipariş oluşturulamadı' },
      { status: 500 }
    );
  }
}
