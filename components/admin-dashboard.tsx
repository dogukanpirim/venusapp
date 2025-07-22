
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  DollarSign, 
  Users, 
  Mail, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  X,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ClientDate } from '@/components/client-date';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number | null;
  zoneId: string;
}

interface Zone {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  features: string[];
  capacity: number;
  equipment: string | null;
  pricePerHour: number;
  specialOffers: string | null;
  isActive: boolean;
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

interface ChallengeSubmission {
  id: string;
  challengeId: string;
  challenge: {
    id: string;
    title: string;
    category: 'AUTO' | 'MANUAL';
    game: {
      name: string;
    };
  };
  player: {
    id: string;
    gamertag: string;
    displayName: string;
  };
  screenshotUrls: string[];
  description: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  reviewNotes: string | null;
  reviewedBy: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  reviewedAt: string | null;
}

interface Game {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string | null;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  gameId: string;
  game: {
    id: string;
    name: string;
    slug: string;
  };
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
  category: 'AUTO' | 'MANUAL';
  difficulty: string;
  target: string;
  targetValue: number;
  pointsReward: number;
  creditsReward: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  stats?: {
    totalSubmissions: number;
    totalRegistrations: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
  };
}

interface AdminDashboardProps {
  zones: Zone[];
  contacts: Contact[];
}

export function AdminDashboard({ zones: initialZones, contacts }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'contacts' | 'submissions' | 'challenges' | 'zones'>('products');
  const [zones, setZones] = useState(initialZones);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  
  // Challenge Submission States
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ChallengeSubmission | null>(null);
  const [submissionFilter, setSubmissionFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'>('ALL');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Challenge Management States
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [isAddingChallenge, setIsAddingChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState<{
    title: string;
    description: string;
    gameId: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
    category: 'AUTO' | 'MANUAL';
    difficulty: string;
    target: string;
    targetValue: string;
    gizmoTrackingKey: string;
    autoCompleteRule: string;
    submissionInstructions: string;
    exampleImages: string[];
    requiredProofCount: string;
    pointsReward: string;
    creditsReward: string;
    startDate: string;
    endDate: string;
    image: string;
  }>({
    title: '',
    description: '',
    gameId: '',
    type: 'DAILY',
    category: 'AUTO',
    difficulty: 'Easy',
    target: '',
    targetValue: '1',
    gizmoTrackingKey: '',
    autoCompleteRule: '',
    submissionInstructions: '',
    exampleImages: [],
    requiredProofCount: '1',
    pointsReward: '0',
    creditsReward: '0',
    startDate: '',
    endDate: '',
    image: '',
  });
  
  // Zone Management States
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneFormData, setZoneFormData] = useState({
    features: [] as string[],
    capacity: '0',
    equipment: '',
    pricePerHour: '0',
    specialOffers: '',
  });
  
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    zoneId: ''
  });

  // Load challenge submissions, challenges, and games
  useEffect(() => {
    fetchSubmissions();
    fetchChallenges();
    fetchGames();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/challenge-submissions');
      if (response.ok) {
        const result = await response.json();
        setSubmissions(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/admin/challenges');
      if (response.ok) {
        const result = await response.json();
        setChallenges(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const result = await response.json();
        setGames(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setZones(prev => prev.map(zone => ({
          ...zone,
          products: zone.products.map(p => 
            p.id === productId ? updatedProduct : p
          )
        })));
        toast({ title: 'Ürün güncellendi!' });
        setEditingProduct(null);
      }
    } catch (error) {
      toast({ title: 'Hata!', description: 'Ürün güncellenemedi', variant: 'destructive' });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setZones(prev => prev.map(zone => ({
          ...zone,
          products: zone.products.filter(p => p.id !== productId)
        })));
        toast({ title: 'Ürün silindi!' });
      }
    } catch (error) {
      toast({ title: 'Hata!', description: 'Ürün silinemedi', variant: 'destructive' });
    }
  };

  const addProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        duration: newProduct.duration ? parseInt(newProduct.duration) : null,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        setZones(prev => prev.map(zone => 
          zone.id === createdProduct.zoneId 
            ? { ...zone, products: [...zone.products, createdProduct] }
            : zone
        ));
        toast({ title: 'Ürün eklendi!' });
        setIsAddingProduct(false);
        setNewProduct({ name: '', description: '', price: '', duration: '', zoneId: '' });
      }
    } catch (error) {
      toast({ title: 'Hata!', description: 'Ürün eklenemedi', variant: 'destructive' });
    }
  };

  // Challenge management functions
  const addChallenge = async () => {
    try {
      const challengeData = {
        ...newChallenge,
        targetValue: parseInt(newChallenge.targetValue),
        requiredProofCount: parseInt(newChallenge.requiredProofCount),
        pointsReward: parseInt(newChallenge.pointsReward),
        creditsReward: parseFloat(newChallenge.creditsReward),
        startDate: new Date(newChallenge.startDate).toISOString(),
        endDate: new Date(newChallenge.endDate).toISOString(),
      };

      const response = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData),
      });

      if (response.ok) {
        const result = await response.json();
        setChallenges(prev => [result.data, ...prev]);
        toast({ title: 'Challenge oluşturuldu!' });
        setIsAddingChallenge(false);
        setNewChallenge({
          title: '',
          description: '',
          gameId: '',
          type: 'DAILY',
          category: 'AUTO',
          difficulty: 'Easy',
          target: '',
          targetValue: '1',
          gizmoTrackingKey: '',
          autoCompleteRule: '',
          submissionInstructions: '',
          exampleImages: [],
          requiredProofCount: '1',
          pointsReward: '0',
          creditsReward: '0',
          startDate: '',
          endDate: '',
          image: '',
        });
      }
    } catch (error) {
      toast({ title: 'Hata!', description: 'Challenge oluşturulamadı', variant: 'destructive' });
    }
  };

  const updateChallenge = async (challengeId: string, data: Partial<Challenge>) => {
    try {
      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setChallenges(prev => prev.map(c => c.id === challengeId ? result.data : c));
        toast({ title: 'Challenge güncellendi!' });
        setEditingChallenge(null);
      }
    } catch (error) {
      toast({ title: 'Hata!', description: 'Challenge güncellenemedi', variant: 'destructive' });
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/admin/challenges/${challengeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChallenges(prev => prev.filter(c => c.id !== challengeId));
        toast({ title: 'Challenge silindi!' });
      }
    } catch (error) {
      toast({ title: 'Hata!', description: 'Challenge silinemedi', variant: 'destructive' });
    }
  };

  // Zone management functions
  const updateZone = async (zoneId: string, data: any) => {
    try {
      const response = await fetch(`/api/admin/zones/${zoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setZones(prev => prev.map(z => z.id === zoneId ? result.data : z));
        toast({ title: 'Zone güncellendi!' });
        setEditingZone(null);
      }
    } catch (error) {
      toast({ title: 'Hata!', description: 'Zone güncellenemedi', variant: 'destructive' });
    }
  };

  // Challenge submission review functions
  const reviewSubmission = async (submissionId: string, status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW', notes: string = '') => {
    try {
      setIsReviewing(true);
      const response = await fetch(`/api/admin/challenge-submissions/${submissionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNotes: notes,
          reviewedById: 'admin-user-id' // You should get this from session
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? result.data : sub
        ));
        
        toast({ 
          title: 'Başarılı!', 
          description: `Submission ${status === 'APPROVED' ? 'onaylandı' : status === 'REJECTED' ? 'reddedildi' : 'inceleme altına alındı'}` 
        });
        
        setSelectedSubmission(null);
        setReviewNotes('');
      } else {
        throw new Error('Review failed');
      }
    } catch (error) {
      toast({ 
        title: 'Hata!', 
        description: 'Submission gözden geçirilemedi', 
        variant: 'destructive' 
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredSubmissions = submissionFilter === 'ALL' 
    ? submissions 
    : submissions.filter(sub => sub.status === submissionFilter);

  const submissionStats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'PENDING').length,
    approved: submissions.filter(s => s.status === 'APPROVED').length,
    rejected: submissions.filter(s => s.status === 'REJECTED').length,
    underReview: submissions.filter(s => s.status === 'UNDER_REVIEW').length,
  };

  const totalProducts = zones.reduce((acc, zone) => acc + zone.products.length, 0);
  const avgPrice = zones.reduce((acc, zone) => 
    acc + zone.products.reduce((sum, p) => sum + p.price, 0), 0
  ) / totalProducts || 0;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="gaming-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Ürün</p>
                <p className="text-2xl font-bold text-white">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="gaming-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ortalama Fiyat</p>
                <p className="text-2xl font-bold text-white">{avgPrice.toFixed(0)}₺</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="gaming-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Zone Sayısı</p>
                <p className="text-2xl font-bold text-white">{zones.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="gaming-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Mesajlar</p>
                <p className="text-2xl font-bold text-white">{contacts.length}</p>
              </div>
              <Mail className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="gaming-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bekleyen İnceleme</p>
                <p className="text-2xl font-bold text-white">{submissionStats.pending}</p>
              </div>
              <Camera className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="gaming-card mb-8">
          <div className="flex border-b border-gray-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'products'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Ürün Yönetimi
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'challenges'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Challenge Oluştur
            </button>
            <button
              onClick={() => setActiveTab('zones')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'zones'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Zone Yönetimi
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'submissions'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-5 h-5 inline mr-2" />
              Challenge İncelemeleri
              {submissionStats.pending > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {submissionStats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-5 h-5 inline mr-2" />
              Mesajlar
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Challenge Creation */}
            <div className="gaming-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Challenge Yönetimi</h2>
                <Dialog open={isAddingChallenge} onOpenChange={setIsAddingChallenge}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Yeni Challenge
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white">Yeni Challenge Oluştur</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Challenge Başlığı"
                          value={newChallenge.title}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                        <select
                          value={newChallenge.gameId}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, gameId: e.target.value }))}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                        >
                          <option value="">Oyun Seçin</option>
                          {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <textarea
                        placeholder="Challenge Açıklaması"
                        value={newChallenge.description}
                        onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white h-24"
                      />
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <select
                          value={newChallenge.type}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, type: e.target.value as any }))}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                        >
                          <option value="DAILY">Günlük</option>
                          <option value="WEEKLY">Haftalık</option>
                          <option value="MONTHLY">Aylık</option>
                          <option value="SPECIAL">Özel</option>
                        </select>
                        
                        <select
                          value={newChallenge.category}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                        >
                          <option value="AUTO">Otomatik (Gizmo)</option>
                          <option value="MANUAL">Manuel (Screenshot)</option>
                        </select>
                        
                        <select
                          value={newChallenge.difficulty}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                        >
                          <option value="Easy">Kolay</option>
                          <option value="Medium">Orta</option>
                          <option value="Hard">Zor</option>
                          <option value="Expert">Uzman</option>
                        </select>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Hedef (örn: 5 zafer kazanın)"
                          value={newChallenge.target}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, target: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                        <Input
                          placeholder="Hedef Değeri (sayı)"
                          type="number"
                          value={newChallenge.targetValue}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, targetValue: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      
                      {newChallenge.category === 'AUTO' && (
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-500/10 rounded border border-blue-500/30">
                          <Input
                            placeholder="Gizmo Takip Anahtarı"
                            value={newChallenge.gizmoTrackingKey}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, gizmoTrackingKey: e.target.value }))}
                            className="bg-gray-800 border-gray-600"
                          />
                          <Input
                            placeholder="Otomatik Tamamlama Kuralı (JSON)"
                            value={newChallenge.autoCompleteRule}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, autoCompleteRule: e.target.value }))}
                            className="bg-gray-800 border-gray-600"
                          />
                        </div>
                      )}
                      
                      {newChallenge.category === 'MANUAL' && (
                        <div className="space-y-4 p-4 bg-orange-500/10 rounded border border-orange-500/30">
                          <textarea
                            placeholder="Screenshot Gönderim Talimatları"
                            value={newChallenge.submissionInstructions}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, submissionInstructions: e.target.value }))}
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white h-20"
                          />
                          <Input
                            placeholder="Gerekli Screenshot Sayısı"
                            type="number"
                            value={newChallenge.requiredProofCount}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, requiredProofCount: e.target.value }))}
                            className="bg-gray-800 border-gray-600"
                          />
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <Input
                          placeholder="Puan Ödülü"
                          type="number"
                          value={newChallenge.pointsReward}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, pointsReward: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                        <Input
                          placeholder="Kredi Ödülü"
                          type="number"
                          step="0.01"
                          value={newChallenge.creditsReward}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, creditsReward: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                        <Input
                          placeholder="Görsel URL (opsiyonel)"
                          value={newChallenge.image}
                          onChange={(e) => setNewChallenge(prev => ({ ...prev, image: e.target.value }))}
                          className="bg-gray-800 border-gray-600"
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Başlangıç Tarihi</label>
                          <Input
                            type="datetime-local"
                            value={newChallenge.startDate}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, startDate: e.target.value }))}
                            className="bg-gray-800 border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Bitiş Tarihi</label>
                          <Input
                            type="datetime-local"
                            value={newChallenge.endDate}
                            onChange={(e) => setNewChallenge(prev => ({ ...prev, endDate: e.target.value }))}
                            className="bg-gray-800 border-gray-600"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button onClick={addChallenge} className="flex-1 bg-green-600 hover:bg-green-700">
                          <Save className="h-4 w-4 mr-2" />
                          Challenge Oluştur
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingChallenge(false);
                            setNewChallenge({
                              title: '',
                              description: '',
                              gameId: '',
                              type: 'DAILY',
                              category: 'AUTO',
                              difficulty: 'Easy',
                              target: '',
                              targetValue: '1',
                              gizmoTrackingKey: '',
                              autoCompleteRule: '',
                              submissionInstructions: '',
                              exampleImages: [],
                              requiredProofCount: '1',
                              pointsReward: '0',
                              creditsReward: '0',
                              startDate: '',
                              endDate: '',
                              image: '',
                            });
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          İptal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Challenges List */}
              <div className="space-y-4">
                {challenges.length === 0 ? (
                  <div className="text-center py-8">
                    <Plus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz challenge oluşturulmamış</p>
                  </div>
                ) : (
                  challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              challenge.category === 'AUTO' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {challenge.category === 'AUTO' ? 'Otomatik' : 'Manuel'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              challenge.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                              challenge.status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {challenge.status === 'ACTIVE' ? 'Aktif' :
                               challenge.status === 'COMPLETED' ? 'Tamamlandı' : 'Süresi Doldu'}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 mb-3">{challenge.description}</p>
                          
                          <div className="grid md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-purple-400">Oyun:</span>
                              <p className="text-gray-300">{challenge.game.name}</p>
                            </div>
                            <div>
                              <span className="text-purple-400">Tür:</span>
                              <p className="text-gray-300">{challenge.type}</p>
                            </div>
                            <div>
                              <span className="text-purple-400">Zorluk:</span>
                              <p className="text-gray-300">{challenge.difficulty}</p>
                            </div>
                            <div>
                              <span className="text-purple-400">Ödül:</span>
                              <p className="text-gray-300">{challenge.pointsReward} puan + {challenge.creditsReward}₺</p>
                            </div>
                          </div>
                          
                          {challenge.stats && (
                            <div className="grid md:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-gray-700">
                              <div>
                                <span className="text-purple-400">Toplam Katılım:</span>
                                <p className="text-gray-300">{challenge.stats.totalRegistrations}</p>
                              </div>
                              <div>
                                <span className="text-purple-400">Gönderimler:</span>
                                <p className="text-gray-300">{challenge.stats.totalSubmissions}</p>
                              </div>
                              <div>
                                <span className="text-purple-400">Bekleyen:</span>
                                <p className="text-yellow-400">{challenge.stats.pendingSubmissions}</p>
                              </div>
                              <div>
                                <span className="text-purple-400">Onaylanan:</span>
                                <p className="text-green-400">{challenge.stats.approvedSubmissions}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingChallenge(challenge)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteChallenge(challenge.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="space-y-6">
            {/* Zone Management */}
            <div className="gaming-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Zone Yönetimi</h2>
              
              <div className="space-y-4">
                {zones.map((zone) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{zone.name}</h3>
                        <p className="text-gray-400 mb-4">{zone.description}</p>
                        
                        {editingZone?.id === zone.id ? (
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm text-gray-400 mb-2">Kapasite</label>
                                <Input
                                  type="number"
                                  value={zoneFormData.capacity}
                                  onChange={(e) => setZoneFormData(prev => ({ ...prev, capacity: e.target.value }))}
                                  className="bg-gray-800 border-gray-600"
                                  placeholder="Koltuk/PC sayısı"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-400 mb-2">Saatlik Fiyat (₺)</label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={zoneFormData.pricePerHour}
                                  onChange={(e) => setZoneFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                                  className="bg-gray-800 border-gray-600"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Özellikler (virgül ile ayırın)</label>
                              <Input
                                value={zoneFormData.features.join(', ')}
                                onChange={(e) => setZoneFormData(prev => ({ 
                                  ...prev, 
                                  features: e.target.value.split(',').map(f => f.trim()).filter(f => f) 
                                }))}
                                className="bg-gray-800 border-gray-600"
                                placeholder="Gaming PC, Mekanik Klavye, Yüksek Hz Monitör"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Ekipman Detayları (JSON)</label>
                              <textarea
                                value={zoneFormData.equipment}
                                onChange={(e) => setZoneFormData(prev => ({ ...prev, equipment: e.target.value }))}
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white h-20"
                                placeholder='{"cpu": "AMD Ryzen 7", "gpu": "RTX 4070", "ram": "32GB"}'
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Özel Teklifler (JSON)</label>
                              <textarea
                                value={zoneFormData.specialOffers}
                                onChange={(e) => setZoneFormData(prev => ({ ...prev, specialOffers: e.target.value }))}
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white h-20"
                                placeholder='{"student": "20% indirim", "weekend": "3 saat al 4 saat oyna"}'
                              />
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  updateZone(zone.id, {
                                    capacity: parseInt(zoneFormData.capacity),
                                    pricePerHour: parseFloat(zoneFormData.pricePerHour),
                                    features: zoneFormData.features,
                                    equipment: zoneFormData.equipment || null,
                                    specialOffers: zoneFormData.specialOffers || null,
                                  });
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Kaydet
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingZone(null);
                                  setZoneFormData({
                                    features: [],
                                    capacity: '0',
                                    equipment: '',
                                    pricePerHour: '0',
                                    specialOffers: '',
                                  });
                                }}
                              >
                                <X className="w-4 h-4 mr-2" />
                                İptal
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-purple-400">Kapasite:</span>
                                <p className="text-gray-300">{zone.capacity || 0} koltuk</p>
                              </div>
                              <div>
                                <span className="text-purple-400">Saatlik Fiyat:</span>
                                <p className="text-green-400 font-semibold">{zone.pricePerHour || 0}₺</p>
                              </div>
                              <div>
                                <span className="text-purple-400">Ürün Sayısı:</span>
                                <p className="text-gray-300">{zone.products.length} ürün</p>
                              </div>
                            </div>
                            
                            {zone.features && zone.features.length > 0 && (
                              <div>
                                <span className="text-purple-400 text-sm">Özellikler:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {zone.features.map((feature, index) => (
                                    <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {zone.equipment && (
                              <div>
                                <span className="text-purple-400 text-sm">Ekipman:</span>
                                <pre className="text-gray-300 text-xs mt-1 bg-gray-800 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(JSON.parse(zone.equipment), null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {editingZone?.id !== zone.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingZone(zone);
                            setZoneFormData({
                              features: zone.features || [],
                              capacity: zone.capacity?.toString() || '0',
                              equipment: zone.equipment || '',
                              pricePerHour: zone.pricePerHour?.toString() || '0',
                              specialOffers: zone.specialOffers || '',
                            });
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Düzenle
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="gaming-card p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Ürün Yönetimi</h2>
            <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ürün Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Yeni Ürün Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <select
                    value={newProduct.zoneId}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, zoneId: e.target.value }))}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    <option value="">Zone Seçin</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Ürün Adı"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                  />
                  <Input
                    placeholder="Açıklama"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                  />
                  <Input
                    placeholder="Fiyat (₺)"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                  />
                  <Input
                    placeholder="Süre (dakika - opsiyonel)"
                    type="number"
                    value={newProduct.duration}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, duration: e.target.value }))}
                    className="bg-gray-800 border-gray-600"
                  />
                  <div className="flex space-x-2">
                    <Button onClick={addProduct} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingProduct(false);
                        setNewProduct({ name: '', description: '', price: '', duration: '', zoneId: '' });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      İptal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {zones.map(zone => (
            <div key={zone.id} className="mb-8">
              <h3 className="text-xl font-bold text-purple-400 mb-4">{zone.name}</h3>
              <div className="space-y-3">
                {zone.products.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    {editingProduct?.id === product.id ? (
                      <div className="flex-1 grid grid-cols-4 gap-2 mr-4">
                        <Input
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Input
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                          className="bg-gray-700 border-gray-600"
                          placeholder="Açıklama"
                        />
                        <Input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                          className="bg-gray-700 border-gray-600"
                        />
                        <Input
                          type="number"
                          value={editingProduct.duration || ''}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, duration: e.target.value ? parseInt(e.target.value) : null } : null)}
                          className="bg-gray-700 border-gray-600"
                          placeholder="Süre"
                        />
                      </div>
                    ) : (
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{product.name}</h4>
                        <p className="text-sm text-gray-400">{product.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <span className="text-green-400 font-bold">{product.price}₺</span>
                          {product.duration && <span>{product.duration} dakika</span>}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {editingProduct?.id === product.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateProduct(product.id, editingProduct)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Challenge Submissions Review */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Submission Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="gaming-card p-4 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Bekleyen</p>
                    <p className="text-xl font-bold text-yellow-400">{submissionStats.pending}</p>
                  </div>
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div className="gaming-card p-4 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Onaylanan</p>
                    <p className="text-xl font-bold text-green-400">{submissionStats.approved}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <div className="gaming-card p-4 border border-red-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Reddedilen</p>
                    <p className="text-xl font-bold text-red-400">{submissionStats.rejected}</p>
                  </div>
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <div className="gaming-card p-4 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">İncelenen</p>
                    <p className="text-xl font-bold text-blue-400">{submissionStats.underReview}</p>
                  </div>
                  <Eye className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="gaming-card p-4">
              <div className="flex space-x-2">
                {(['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={submissionFilter === status ? 'default' : 'outline'}
                    onClick={() => setSubmissionFilter(status)}
                    className={submissionFilter === status ? 'bg-purple-600' : ''}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {status === 'ALL' ? 'Tümü' : 
                     status === 'PENDING' ? 'Bekleyen' :
                     status === 'UNDER_REVIEW' ? 'İncelenen' :
                     status === 'APPROVED' ? 'Onaylanan' : 'Reddedilen'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="gaming-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Challenge Submission İncelemeleri</h2>
              
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Henüz incelenecek submission bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {submission.challenge.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              submission.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                              submission.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                              submission.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {submission.status === 'PENDING' ? 'Bekleyen' :
                               submission.status === 'APPROVED' ? 'Onaylandı' :
                               submission.status === 'REJECTED' ? 'Reddedildi' : 'İnceleniyor'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-400 space-y-1">
                            <p><span className="text-purple-400">Oyuncu:</span> {submission.player.displayName} (@{submission.player.gamertag})</p>
                            <p><span className="text-purple-400">Oyun:</span> {submission.challenge.game.name}</p>
                            <p><span className="text-purple-400">Tarih:</span> <ClientDate date={submission.createdAt} format="date" /></p>
                            {submission.description && (
                              <p><span className="text-purple-400">Açıklama:</span> {submission.description}</p>
                            )}
                            {submission.reviewNotes && (
                              <p><span className="text-purple-400">İnceleme Notları:</span> {submission.reviewNotes}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            İncele
                          </Button>
                          
                          {submission.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => reviewSubmission(submission.id, 'APPROVED')}
                                disabled={isReviewing}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Onayla
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => reviewSubmission(submission.id, 'REJECTED')}
                                disabled={isReviewing}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reddet
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Screenshots Preview */}
                      {submission.screenshotUrls.length > 0 && (
                        <div className="border-t border-gray-700 pt-4">
                          <p className="text-sm text-gray-400 mb-2">Screenshots ({submission.screenshotUrls.length}):</p>
                          <div className="grid grid-cols-4 gap-2">
                            {submission.screenshotUrls.slice(0, 4).map((url, index) => (
                              <div key={index} className="aspect-video relative rounded overflow-hidden bg-gray-800">
                                <img
                                  src={url}
                                  alt={`Screenshot ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {submission.screenshotUrls.length > 4 && (
                              <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
                                <span className="text-gray-400 text-sm">+{submission.screenshotUrls.length - 4} daha</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Detail Modal */}
            <AnimatePresence>
              {selectedSubmission && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedSubmission(null)}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">Submission Detayları</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSubmission(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-purple-400 mb-2">Challenge Bilgileri</h4>
                          <div className="space-y-1 text-sm text-gray-300">
                            <p><span className="text-gray-400">Başlık:</span> {selectedSubmission.challenge.title}</p>
                            <p><span className="text-gray-400">Oyun:</span> {selectedSubmission.challenge.game.name}</p>
                            <p><span className="text-gray-400">Kategori:</span> {selectedSubmission.challenge.category}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-purple-400 mb-2">Oyuncu Bilgileri</h4>
                          <div className="space-y-1 text-sm text-gray-300">
                            <p><span className="text-gray-400">İsim:</span> {selectedSubmission.player.displayName}</p>
                            <p><span className="text-gray-400">Gamertag:</span> @{selectedSubmission.player.gamertag}</p>
                            <p><span className="text-gray-400">Gönderim Tarihi:</span> <ClientDate date={selectedSubmission.createdAt} format="datetime" /></p>
                          </div>
                        </div>
                      </div>
                      
                      {selectedSubmission.description && (
                        <div>
                          <h4 className="font-semibold text-purple-400 mb-2">Oyuncu Açıklaması</h4>
                          <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded">{selectedSubmission.description}</p>
                        </div>
                      )}
                      
                      {/* Full Screenshots Grid */}
                      <div>
                        <h4 className="font-semibold text-purple-400 mb-2">Screenshots ({selectedSubmission.screenshotUrls.length})</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedSubmission.screenshotUrls.map((url, index) => (
                            <div key={index} className="aspect-video relative rounded overflow-hidden bg-gray-800">
                              <img
                                src={url}
                                alt={`Screenshot ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Review Actions */}
                      {selectedSubmission.status === 'PENDING' && (
                        <div className="border-t border-gray-700 pt-4">
                          <h4 className="font-semibold text-purple-400 mb-3">İnceleme Yap</h4>
                          <div className="space-y-3">
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="İnceleme notları (opsiyonel)"
                              className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white resize-none"
                              rows={3}
                            />
                            <div className="flex space-x-3">
                              <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => reviewSubmission(selectedSubmission.id, 'APPROVED', reviewNotes)}
                                disabled={isReviewing}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Onayla
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => reviewSubmission(selectedSubmission.id, 'REJECTED', reviewNotes)}
                                disabled={isReviewing}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reddet
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => reviewSubmission(selectedSubmission.id, 'UNDER_REVIEW', reviewNotes)}
                                disabled={isReviewing}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                İnceleme Altına Al
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedSubmission.status !== 'PENDING' && selectedSubmission.reviewNotes && (
                        <div className="border-t border-gray-700 pt-4">
                          <h4 className="font-semibold text-purple-400 mb-2">İnceleme Notları</h4>
                          <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded">{selectedSubmission.reviewNotes}</p>
                          {selectedSubmission.reviewedBy && (
                            <p className="text-xs text-gray-400 mt-2">
                              {selectedSubmission.reviewedBy.name} tarafından <ClientDate date={selectedSubmission.reviewedAt!} format="datetime" /> tarihinde incelendi
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Recent Messages */}
        {activeTab === 'contacts' && (
          <div className="gaming-card p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Son Mesajlar</h2>
            <div className="space-y-4">
              {contacts.map(contact => (
                <div key={contact.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{contact.name}</h4>
                    <span className="text-sm text-gray-400">
                      <ClientDate date={contact.createdAt} format="date" />
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{contact.email}</p>
                  <p className="text-sm font-medium text-purple-400 mb-2">{contact.subject}</p>
                  <p className="text-sm text-gray-300">{contact.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
