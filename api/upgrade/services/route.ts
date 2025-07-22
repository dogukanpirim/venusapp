
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

    const selectedPackage = servicePackages.find(pkg => pkg.id === package_id);
    if (!selectedPackage) {
      return NextResponse.json(
        { success: false, error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    const quote = {
      quote_id: `QUOTE_${Date.now()}`,
      service_package: selectedPackage,
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
        new Date(installation_date).getTime() + 4 * 60 * 60 * 1000
      ),
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
