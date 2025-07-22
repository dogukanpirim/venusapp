
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CreditCard, Search, Star, Lock, Unlock, Heart, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Card {
  id: string;
  name: string;
  description: string;
  image?: string;
  rarity: string;
  category: string;
  unlockLevel: number;
  unlockCost: number;
  flavor?: string;
  power: number;
  owned: boolean;
  quantity: number;
  canUnlock: boolean;
}

interface UserCard {
  id: string;
  card: Card;
  quantity: number;
  unlockedAt: string;
  isFavorite: boolean;
}

interface CardCollectionProps {
  cards: {
    availableCards: Card[];
    collection: UserCard[];
    stats: {
      totalCards: number;
      ownedCards: number;
      completionPercentage: number;
      favoriteCount: number;
      rarityBreakdown: {
        common: number;
        rare: number;
        epic: number;
        legendary: number;
      };
    };
    userLevel: number;
  };
  onCardUpdate: () => void;
}

export function CardCollection({ cards, onCardUpdate }: CardCollectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const unlockCard = async (cardId: string) => {
    setUnlocking(cardId);
    try {
      // Simulate unlocking card with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the card to get its name
      const card = cards.availableCards.find(c => c.id === cardId);
      
      if (card) {
        toast.success(`🎉 ${card.name} kartını açtınız!`);
        onCardUpdate();
      }
    } catch (error) {
      console.error('Error unlocking card:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setUnlocking(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'epic': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'common': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getCardEmoji = (category: string, flavor?: string) => {
    if (category === 'food') {
      if (flavor === 'spicy') return '🌶️';
      if (flavor === 'mild') return '🍜';
      if (flavor === 'extra_hot') return '🔥';
      return '🍝';
    }
    if (category === 'gaming') return '🎮';
    if (category === 'meme') return '😂';
    if (category === 'special') return '✨';
    return '🎴';
  };

  const filteredCards = cards.availableCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCard = (card: Card, isInCollection = false) => (
    <motion.div
      key={card.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group relative"
    >
      <Card className={`transition-all duration-300 hover:shadow-lg ${getRarityColor(card.rarity)} ${
        card.owned ? 'ring-2 ring-primary/20' : ''
      }`}>
        <CardContent className="p-4">
          {/* Card Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="text-3xl">
              {getCardEmoji(card.category, card.flavor)}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={getRarityColor(card.rarity)}>
                {card.rarity}
              </Badge>
              {card.owned && (
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <Package className="h-3 w-3" />
                  {card.quantity}x
                </div>
              )}
            </div>
          </div>

          {/* Card Info */}
          <div className="space-y-2 mb-3">
            <h3 className="font-medium text-sm">{card.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {card.description}
            </p>
            
            {/* Card Stats */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{card.power}</span>
                </div>
                {card.flavor && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {card.flavor}
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground">
                Lv.{card.unlockLevel}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            {card.owned ? (
              <Badge variant="secondary" className="text-xs">
                <Package className="h-3 w-3 mr-1" />
                Sahipsin
              </Badge>
            ) : card.canUnlock ? (
              <Button
                size="sm"
                onClick={() => unlockCard(card.id)}
                disabled={unlocking === card.id}
                className="h-6 px-2 text-xs"
              >
                {unlocking === card.id ? (
                  <div className="animate-spin h-3 w-3 border border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <Unlock className="h-3 w-3 mr-1" />
                    Aç
                  </>
                )}
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Lv.{card.unlockLevel}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{cards.stats.completionPercentage}%</div>
            <div className="text-sm text-muted-foreground">Tamamlanma</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{cards.stats.ownedCards}</div>
            <div className="text-sm text-muted-foreground">Toplam Kart</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{cards.stats.favoriteCount}</div>
            <div className="text-sm text-muted-foreground">Favori</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{cards.stats.rarityBreakdown.legendary}</div>
            <div className="text-sm text-muted-foreground">Legendary</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kart ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tüm Kartlar</TabsTrigger>
          <TabsTrigger value="collection">Koleksiyonum</TabsTrigger>
          <TabsTrigger value="stats">İstatistikler</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Mevcut Kartlar</h3>
            <div className="text-sm text-muted-foreground">
              {filteredCards.length} kart gösteriliyor
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCards.map(card => renderCard(card))}
          </div>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Package className="h-5 w-5" />
              Kartlarım
            </h3>
            <div className="text-sm text-muted-foreground">
              {cards.collection.length} kart
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.collection.map(userCard => renderCard(userCard.card, true))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <h3 className="text-lg font-medium">Koleksiyon İstatistikleri</h3>
          
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Nadir Kart Dağılımı</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(cards.stats.rarityBreakdown).map(([rarity, count]) => (
                  <div key={rarity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getRarityColor(rarity)}>
                        {rarity}
                      </Badge>
                    </div>
                    <span className="font-medium">{count} kart</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
