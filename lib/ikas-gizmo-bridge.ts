
import { ikasClient, IkasCustomer, IkasProduct, IkasOrder } from './ikas-client';
import { prisma } from './db';

export interface GizmoIkasMapping {
  gizmoUserId: string;
  ikasCustomerId: string;
  email: string;
  syncedAt: Date;
}

export class IkasGizmoBridge {
  // User/Customer Synchronization
  async syncGizmoUserToIkas(gizmoUserId: string, userEmail: string, userName?: string): Promise<IkasCustomer> {
    try {
      // Check if customer already exists in İkas
      let ikasCustomer = await ikasClient.findCustomerByEmail(userEmail);
      
      if (!ikasCustomer) {
        // Create new customer in İkas
        const nameParts = userName?.split(' ') || ['', ''];
        ikasCustomer = await ikasClient.createCustomer({
          email: userEmail,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          gizmoUserId: gizmoUserId,
        });
      }

      // Update local database with mapping
      await this.updateUserIkasMapping(gizmoUserId, ikasCustomer.id, userEmail);

      return ikasCustomer;
    } catch (error) {
      console.error('Error syncing Gizmo user to İkas:', error);
      throw new Error('Kullanıcı İkas sistemine aktarılamadı');
    }
  }

  async updateUserIkasMapping(gizmoUserId: string, ikasCustomerId: string, email: string): Promise<void> {
    await prisma.user.update({
      where: { id: gizmoUserId },
      data: { 
        email: email,
        // Add İkas customer ID to user metadata if needed
      },
    });
  }

  // Product Synchronization
  async syncHardwareToIkas(): Promise<{ success: number; failed: number; results: any[] }> {
    const results = {
      success: 0,
      failed: 0,
      results: [] as any[]
    };

    try {
      // Get hardware inventory from our system
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/upgrade/hardware`);
      const { data: hardwareInventory } = await response.json();

      // Sync each category
      for (const [category, items] of Object.entries(hardwareInventory)) {
        if (Array.isArray(items)) {
          for (const item of items as any[]) {
            try {
              const ikasProduct = await this.convertHardwareToIkasProduct(item, category);
              
              // Check if product already exists
              const existingProducts = await ikasClient.getProducts();
              const existingProduct = existingProducts.find(p => p.sku === ikasProduct.sku);

              let result;
              if (existingProduct) {
                // Update existing product
                result = await ikasClient.updateProduct(existingProduct.id, {
                  name: ikasProduct.name,
                  description: ikasProduct.description,
                  price: ikasProduct.price,
                  stock: ikasProduct.stock,
                  status: ikasProduct.status,
                });
                results.results.push({ action: 'updated', product: result });
              } else {
                // Create new product
                result = await ikasClient.createProduct(ikasProduct);
                results.results.push({ action: 'created', product: result });
              }

              results.success++;
            } catch (error) {
              console.error(`Error syncing product ${item.name}:`, error);
              results.failed++;
              results.results.push({ 
                action: 'failed', 
                product: item.name, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              });
            }
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error syncing hardware to İkas:', error);
      throw new Error('Hardware ürünleri İkas\'a aktarılamadı');
    }
  }

  private async convertHardwareToIkasProduct(hardwareItem: any, category: string): Promise<Omit<IkasProduct, 'id'>> {
    const categoryNames: Record<string, string> = {
      cpu: 'İşlemci (CPU)',
      gpu: 'Ekran Kartı (GPU)', 
      ram: 'RAM Bellek',
      storage: 'Depolama (SSD/HDD)',
      motherboard: 'Anakart',
      psu: 'Güç Kaynağı (PSU)'
    };

    // Generate detailed description
    let description = `${categoryNames[category] || category.toUpperCase()} - ${hardwareItem.name}\n\n`;
    
    if (hardwareItem.brand) description += `Marka: ${hardwareItem.brand}\n`;
    if (hardwareItem.gaming_score) description += `Gaming Skoru: ${hardwareItem.gaming_score}/100\n`;
    
    // Add category-specific details
    switch (category) {
      case 'cpu':
        if (hardwareItem.cores) description += `Çekirdek Sayısı: ${hardwareItem.cores}\n`;
        if (hardwareItem.threads) description += `Thread Sayısı: ${hardwareItem.threads}\n`;
        if (hardwareItem.boostClock) description += `Boost Hızı: ${hardwareItem.boostClock} GHz\n`;
        break;
      case 'gpu':
        if (hardwareItem.memory) description += `VRAM: ${hardwareItem.memory} GB\n`;
        if (hardwareItem.memory_type) description += `Bellek Tipi: ${hardwareItem.memory_type}\n`;
        break;
      case 'ram':
        if (hardwareItem.capacity) description += `Kapasite: ${hardwareItem.capacity} GB\n`;
        if (hardwareItem.speed) description += `Hız: ${hardwareItem.speed} MHz\n`;
        if (hardwareItem.type) description += `Tip: ${hardwareItem.type}\n`;
        break;
      case 'storage':
        if (hardwareItem.capacity) description += `Kapasite: ${hardwareItem.capacity} GB\n`;
        if (hardwareItem.type) description += `Tip: ${hardwareItem.type}\n`;
        if (hardwareItem.read_speed) description += `Okuma Hızı: ${hardwareItem.read_speed} MB/s\n`;
        break;
    }

    description += `\n✅ Venus eSports Cafe kalitesi\n✅ Profesyonel kurulum dahil\n✅ Garanti kapsamında`;

    return {
      name: `${hardwareItem.name} - Venus eSports`,
      description,
      price: hardwareItem.price,
      currency: 'TRY',
      sku: `VENUS-${category.toUpperCase()}-${hardwareItem.id}`,
      stock: hardwareItem.stock || 0,
      images: hardwareItem.image ? [hardwareItem.image] : [],
      brand: hardwareItem.brand,
      status: hardwareItem.stock > 0 ? 'active' : 'inactive',
      metadata: {
        venusCategory: category,
        venusId: hardwareItem.id,
        gamingScore: hardwareItem.gaming_score,
        originalData: hardwareItem
      }
    };
  }

  // Order Processing
  async processIkasOrder(ikasOrder: IkasOrder): Promise<void> {
    try {
      // Find corresponding Gizmo user
      const ikasCustomer = await ikasClient.getCustomer(ikasOrder.customerId || '');
      
      if (ikasCustomer?.gizmoUserId) {
        // Process order in Gizmo system if needed
        await this.processOrderInGizmo(ikasOrder, ikasCustomer.gizmoUserId);
      }

      // Update inventory in our system
      for (const item of ikasOrder.items) {
        await this.updateLocalInventory(item.sku, item.quantity);
      }

      // Log order for tracking
      console.log(`İkas order processed: ${ikasOrder.id} for customer: ${ikasOrder.customerEmail}`);
    } catch (error) {
      console.error('Error processing İkas order:', error);
      throw new Error('Sipariş işlenemedi');
    }
  }

  private async processOrderInGizmo(ikasOrder: IkasOrder, gizmoUserId: string): Promise<void> {
    // This would integrate with Gizmo's order/billing system
    // For now, we'll just log the order
    console.log(`Processing order ${ikasOrder.id} for Gizmo user ${gizmoUserId}`);
    
    // In a real implementation, you would:
    // 1. Create corresponding order in Gizmo
    // 2. Update user credits/balance if applicable
    // 3. Schedule installation services
    // 4. Update user's hardware profile
  }

  private async updateLocalInventory(sku: string, quantitySold: number): Promise<void> {
    // Parse SKU to get category and product ID
    const skuParts = sku.split('-');
    if (skuParts.length >= 3 && skuParts[0] === 'VENUS') {
      const category = skuParts[1].toLowerCase();
      const productId = skuParts[2];
      
      // In a real implementation, you would update the database
      // For now, we'll just log the inventory change
      console.log(`Inventory updated: ${category}/${productId} - Sold: ${quantitySold}`);
    }
  }

  // Webhook Processing
  async handleIkasWebhook(webhookData: any): Promise<void> {
    try {
      const { event, data } = webhookData;

      switch (event) {
        case 'order.created':
        case 'order.updated':
          await this.processIkasOrder(data);
          break;
        
        case 'order.cancelled':
          await this.handleOrderCancellation(data);
          break;
        
        case 'customer.created':
          await this.handleCustomerCreation(data);
          break;
        
        default:
          console.log(`Unhandled İkas webhook event: ${event}`);
      }
    } catch (error) {
      console.error('Error handling İkas webhook:', error);
      throw error;
    }
  }

  private async handleOrderCancellation(orderData: IkasOrder): Promise<void> {
    // Restore inventory
    for (const item of orderData.items) {
      await this.restoreInventory(item.sku, item.quantity);
    }
    console.log(`Order cancelled and inventory restored: ${orderData.id}`);
  }

  private async handleCustomerCreation(customerData: IkasCustomer): Promise<void> {
    // Optionally sync new İkas customers to Gizmo
    console.log(`New İkas customer created: ${customerData.email}`);
  }

  private async restoreInventory(sku: string, quantityToRestore: number): Promise<void> {
    // Implementation to restore inventory when orders are cancelled
    console.log(`Inventory restored: ${sku} + ${quantityToRestore}`);
  }
}

export const ikasGizmoBridge = new IkasGizmoBridge();
