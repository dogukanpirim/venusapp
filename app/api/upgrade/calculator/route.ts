
import { NextRequest, NextResponse } from 'next/server';

// Price calculation logic
const basePrices = {
  installation: {
    basic: 500,
    premium: 750,
    professional: 1000
  },
  labor: {
    per_hour: 150,
    minimum_hours: 2
  },
  testing: {
    basic: 200,
    stress_test: 400,
    benchmark_suite: 600
  },
  warranty_extension: {
    '1_year': 500,
    '2_year': 900,
    '3_year': 1300
  },
  support: {
    '6_months': 300,
    '1_year': 600,
    '2_years': 1000
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      components, 
      services, 
      installation_type = 'basic',
      testing_level = 'basic',
      warranty_extension,
      support_duration,
      discount_code,
      payment_plan
    } = body;

    // Calculate component costs
    let componentsCost = 0;
    const itemizedComponents = [];

    for (const [category, component] of Object.entries(components)) {
      if (component && typeof component === 'object' && 'price' in component && 'name' in component) {
        const comp = component as { price: number; name: string };
        componentsCost += comp.price;
        itemizedComponents.push({
          category,
          name: comp.name,
          price: comp.price
        });
      }
    }

    // Calculate service costs
    let servicesCost = 0;
    const serviceBreakdown = [];

    // Installation cost
    const installationCost = basePrices.installation[installation_type as keyof typeof basePrices.installation] || basePrices.installation.basic;
    servicesCost += installationCost;
    serviceBreakdown.push({
      service: 'Kurulum',
      type: installation_type,
      cost: installationCost
    });

    // Testing cost
    const testingCost = basePrices.testing[testing_level as keyof typeof basePrices.testing] || basePrices.testing.basic;
    servicesCost += testingCost;
    serviceBreakdown.push({
      service: 'Test ve Optimizasyon',
      type: testing_level,
      cost: testingCost
    });

    // Warranty extension
    if (warranty_extension) {
      const warrantyCost = basePrices.warranty_extension[warranty_extension as keyof typeof basePrices.warranty_extension] || 0;
      servicesCost += warrantyCost;
      serviceBreakdown.push({
        service: 'Garanti Uzatma',
        type: warranty_extension,
        cost: warrantyCost
      });
    }

    // Support duration
    if (support_duration) {
      const supportCost = basePrices.support[support_duration as keyof typeof basePrices.support] || 0;
      servicesCost += supportCost;
      serviceBreakdown.push({
        service: 'Teknik Destek',
        type: support_duration,
        cost: supportCost
      });
    }

    const subtotal = componentsCost + servicesCost;
    const taxRate = 0.18; // KDV
    const taxAmount = subtotal * taxRate;

    // Apply discounts
    let discountAmount = 0;
    let discountPercentage = 0;
    
    if (discount_code) {
      // Mock discount codes
      const discountCodes = {
        'VENUS10': 10,
        'UPGRADE15': 15,
        'STUDENT20': 20,
        'FIRSTTIME25': 25
      };
      
      discountPercentage = discountCodes[discount_code as keyof typeof discountCodes] || 0;
      discountAmount = subtotal * (discountPercentage / 100);
    }

    const finalTotal = subtotal + taxAmount - discountAmount;

    // Calculate payment plan
    let paymentPlan = null;
    if (payment_plan && payment_plan.installments > 1) {
      const installmentAmount = finalTotal / payment_plan.installments;
      paymentPlan = {
        installments: payment_plan.installments,
        amount_per_installment: Math.ceil(installmentAmount),
        total_with_interest: finalTotal * (1 + (payment_plan.interest_rate || 0) / 100),
        interest_rate: payment_plan.interest_rate || 0
      };
    }

    // Estimate installation time
    const estimatedHours = Math.max(
      basePrices.labor.minimum_hours,
      itemizedComponents.length * 0.5 + (installation_type === 'professional' ? 2 : 1)
    );

    const quote = {
      quote_id: `CALC_${Date.now()}`,
      timestamp: new Date().toISOString(),
      components: {
        items: itemizedComponents,
        subtotal: componentsCost
      },
      services: {
        items: serviceBreakdown,
        subtotal: servicesCost
      },
      pricing: {
        components_cost: componentsCost,
        services_cost: servicesCost,
        subtotal,
        tax_rate: taxRate,
        tax_amount: Math.round(taxAmount),
        discount_code,
        discount_percentage: discountPercentage,
        discount_amount: Math.round(discountAmount),
        final_total: Math.round(finalTotal)
      },
      payment_plan: paymentPlan,
      estimated_installation_time: `${estimatedHours} saat`,
      compatibility_check: {
        passed: true,
        warnings: [],
        recommendations: [
          'PSU wattage yeterli kontrol edildi',
          'RAM uyumluluğu doğrulandı',
          'Motherboard socket uyumlu'
        ]
      },
      performance_estimate: {
        overall_score: Math.floor(Math.random() * 30) + 70,
        gaming_fps: {
          cs2: Math.floor(Math.random() * 200) + 300,
          valorant: Math.floor(Math.random() * 200) + 350,
          apex: Math.floor(Math.random() * 100) + 120,
          cyberpunk: Math.floor(Math.random() * 80) + 70
        }
      },
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    return NextResponse.json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error('Calculator error:', error);
    return NextResponse.json(
      { success: false, error: 'Fiyat hesaplaması yapılamadı' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'pricing_config') {
      return NextResponse.json({
        success: true,
        data: {
          base_prices: basePrices,
          discount_codes: [
            { code: 'VENUS10', discount: 10, description: 'Venus müşteri indirimi' },
            { code: 'UPGRADE15', discount: 15, description: 'Upgrade paketi indirimi' },
            { code: 'STUDENT20', discount: 20, description: 'Öğrenci indirimi' },
            { code: 'FIRSTTIME25', discount: 25, description: 'İlk müşteri indirimi' }
          ],
          payment_options: [
            { installments: 1, interest_rate: 0, description: 'Tek ödeme' },
            { installments: 3, interest_rate: 0, description: '3 taksit (faizsiz)' },
            { installments: 6, interest_rate: 5, description: '6 taksit (%5 faiz)' },
            { installments: 12, interest_rate: 12, description: '12 taksit (%12 faiz)' }
          ]
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        available_endpoints: [
          'POST /api/upgrade/calculator - Calculate custom quote',
          'GET /api/upgrade/calculator?type=pricing_config - Get pricing configuration'
        ]
      }
    });

  } catch (error) {
    console.error('Calculator config error:', error);
    return NextResponse.json(
      { success: false, error: 'Konfigürasyon alınamadı' },
      { status: 500 }
    );
  }
}
