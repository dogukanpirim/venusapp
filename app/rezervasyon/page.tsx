
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Monitor, 
  RefreshCw, 
  Plus,
  Key,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Reservation {
  id: number;
  userId: number | null;
  note: string | null;
  duration: number;
  contactPhone: string | null;
  contactEmail: string | null;
  date: string;
  pin: string;
  status: number;
  endDate: string;
  users: any[];
  hosts: Array<{
    hostId: number;
    preferedUserId: number | null;
  }>;
}

interface ReservationResponse {
  success: boolean;
  totalEndpoints: number;
  workingEndpoints: number;
  failedEndpoints: number;
  results: Array<{
    endpoint: string;
    success: boolean;
    data?: any;
    timestamp: string;
  }>;
}

export default function ReservationPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gizmo/reservations');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ReservationResponse = await response.json();
      
      if (result.success) {
        // Find the reservations endpoint result
        const reservationResult = result.results.find(r => r.endpoint === '/api/reservations');
        
        if (reservationResult?.success && reservationResult.data?.success) {
          const reservationData = reservationResult.data.data?.result || [];
          setReservations(reservationData);
          setLastUpdate(new Date());
        } else {
          setError('Rezervasyon verisi alınamadı');
        }
      } else {
        setError('API çağrısı başarısız');
      }
    } catch (err) {
      console.error('Rezervasyon fetch hatası:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Aktif';
      case 1: return 'Tamamlandı';
      case 2: return 'İptal';
      default: return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-green-500';
      case 1: return 'bg-blue-500';
      case 2: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}dk` : `${mins}dk`;
  };

  const activeReservations = reservations.filter(r => r.status === 0);
  const totalReservations = reservations.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Rezervasyon Sistemi
            </h1>
            <p className="text-gray-400">
              Gizmo API rezervasyon verilerini görüntüle ve yönet
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}</span>
            </div>
            <Button 
              onClick={fetchReservations} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Yenile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Toplam Rezervasyon</p>
                  <p className="text-2xl font-bold text-white">{totalReservations}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Aktif Rezervasyon</p>
                  <p className="text-2xl font-bold text-white">{activeReservations.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Rezervasyon API</p>
                  <p className="text-2xl font-bold text-white">Aktif</p>
                </div>
                <Monitor className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>Hata: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reservations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="bg-black/40 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white">
                    Rezervasyon #{reservation.id}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(reservation.status)}`} />
                    <Badge 
                      variant={reservation.status === 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {getStatusText(reservation.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* PIN */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Key className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-300 font-mono text-lg">{reservation.pin}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(reservation.date)}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Süre: {formatDuration(reservation.duration)}</span>
                  </div>

                  {/* Host Info */}
                  {reservation.hosts.map((host, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-blue-400">
                      <Monitor className="h-4 w-4" />
                      <span>Host ID: {host.hostId}</span>
                    </div>
                  ))}

                  {/* Contact Info */}
                  {(reservation.contactPhone || reservation.contactEmail) && (
                    <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                      {reservation.contactPhone && (
                        <div className="text-xs text-gray-400">
                          Tel: {reservation.contactPhone}
                        </div>
                      )}
                      {reservation.contactEmail && (
                        <div className="text-xs text-gray-400">
                          Email: {reservation.contactEmail}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Note */}
                  {reservation.note && (
                    <div className="text-xs text-gray-500 italic">
                      Not: {reservation.note}
                    </div>
                  )}

                  {/* End Date */}
                  <div className="text-xs text-gray-500">
                    Bitiş: {formatDate(reservation.endDate)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {reservations.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                Rezervasyon bulunamadı
              </h3>
              <p className="text-gray-500">
                Henüz aktif rezervasyon bulunmuyor.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
