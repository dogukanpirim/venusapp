
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// Get cart items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: (session.user as any).id },
      include: {
        product: true
      }
    });

    const total = cartItems.reduce((sum, item) => 
      sum + (item.quantity * (item.product?.price || 0)), 0
    );

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        total: total,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    });

  } catch (error) {
    console.error('Cart get error:', error);
    return NextResponse.json(
      { success: false, error: 'Sepet bilgileri alınamadı' },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Ürün ID gerekli' },
        { status: 400 }
      );
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: (session.user as any).id,
          productId: productId
        }
      }
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: (session.user as any).id,
          productId: productId,
          quantity: quantity
        },
        include: { product: true }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Ürün sepete eklendi',
      data: cartItem
    });

  } catch (error) {
    console.error('Cart add error:', error);
    return NextResponse.json(
      { success: false, error: 'Ürün sepete eklenemedi' },
      { status: 500 }
    );
  }
}

// Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { cartItemId, quantity } = await request.json();

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: { 
          id: cartItemId,
          userId: (session.user as any).id 
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Ürün sepetten kaldırıldı'
      });
    }

    const cartItem = await prisma.cartItem.update({
      where: { 
        id: cartItemId,
        userId: (session.user as any).id 
      },
      data: { quantity },
      include: { product: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Sepet güncellendi',
      data: cartItem
    });

  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { success: false, error: 'Sepet güncellenemedi' },
      { status: 500 }
    );
  }
}

// Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: { userId: (session.user as any).id }
    });

    return NextResponse.json({
      success: true,
      message: 'Sepet temizlendi'
    });

  } catch (error) {
    console.error('Cart clear error:', error);
    return NextResponse.json(
      { success: false, error: 'Sepet temizlenemedi' },
      { status: 500 }
    );
  }
}
