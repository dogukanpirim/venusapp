
import { NextRequest, NextResponse } from 'next/server';
import { ikasClient } from '@/lib/ikas-client';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    let products: any[] = [];
    
    try {
      // Try to get products from İkas first
      const ikasProducts = await ikasClient.getProducts();
      products = ikasProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        sku: product.sku,
        stock: product.stock,
        images: product.images || [],
        brand: product.brand,
        category: product.metadata?.venusCategory,
        categoryName: product.metadata?.venusCategoryName,
        gamingScore: product.metadata?.gamingScore,
        metadata: JSON.stringify(product.metadata)
      }));
    } catch (ikasError) {
      console.log('İkas not available, using hardware inventory fallback');
      
      // Fallback to hardware inventory
      const hardwareResponse = await fetch(`${request.nextUrl.origin}/api/upgrade/hardware`);
      const hardwareResult = await hardwareResponse.json();
      
      if (hardwareResult.success) {
        const categoryNames: Record<string, string> = {
          cpu: 'İşlemci',
          gpu: 'Ekran Kartı',
          ram: 'RAM Bellek',
          storage: 'Depolama',
          motherboard: 'Anakart',
          psu: 'Güç Kaynağı',
        };

        // Convert hardware inventory to product format
        for (const [cat, items] of Object.entries(hardwareResult.data)) {
          if (Array.isArray(items)) {
            for (const item of items as any[]) {
              let description = `${categoryNames[cat] || cat.toUpperCase()} - ${item.name}\n\n`;
              if (item.brand) description += `Marka: ${item.brand}\n`;
              if (item.gaming_score) description += `Gaming Skoru: ${item.gaming_score}/100\n`;
              description += `\n✅ Venus eSports Cafe kalitesi\n✅ Profesyonel kurulum dahil\n✅ Garanti kapsamında`;

              products.push({
                id: `hardware-${item.id}`,
                name: `${item.name} - Venus eSports`,
                description,
                price: item.price,
                currency: 'TRY',
                sku: `VENUS-${cat.toUpperCase()}-${item.id}`,
                stock: item.stock || 0,
                images: item.image ? [item.image] : [],
                brand: item.brand,
                category: cat,
                categoryName: categoryNames[cat] || cat,
                gamingScore: item.gaming_score,
                status: item.stock > 0 ? 'active' : 'inactive'
              });
            }
          }
        }
      }
    }
    
    // Apply filters
    if (category) {
      products = products.filter(product => 
        product.category === category
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (minPrice) {
      products = products.filter(product => product.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      products = products.filter(product => product.price <= parseFloat(maxPrice));
    }
    
    // Only return active products with stock
    products = products.filter(product => 
      product.status === 'active' && product.stock > 0
    );

    return NextResponse.json({
      success: true,
      data: products,
      total: products.length
    });

  } catch (error) {
    console.error('E-commerce products error:', error);
    return NextResponse.json(
      { success: false, error: 'Ürünler yüklenemedi' },
      { status: 500 }
    );
  }
}
