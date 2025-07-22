
'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gizmo authentication - only authentication method
      const result = await signIn('gizmo', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: 'Giriş Hatası!',
          description: 'Gizmo kullanıcı adı veya şifre hatalı.',
          variant: 'destructive',
        });
      } else {
        const session = await getSession();
        if (session?.user) {
          // Check if user is admin and redirect appropriately
          if ((session.user as any).isAdmin) {
            router.push('/admin');
          } else {
            // Regular users go to homepage
            router.push('/');
          }
          
          toast({
            title: 'Başarılı!',
            description: 'Gizmo hesabınızla giriş yapıldı.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Erişim Hatası!',
            description: 'Giriş başarısız.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Giriş sırasında bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-green-900/20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="gaming-card p-8">
          <div className="text-center mb-8">
            <div className="relative h-16 w-48 mx-auto mb-6">
              <Image
                src="/venusespor_logo.png"
                alt="Venusespor Gaming Cafe"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Gizmo Üye Girişi</h1>
            <p className="text-gray-400">Gizmo hesabınızla giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 focus:border-purple-500"
                  placeholder="Gizmo kullanıcı adınız"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-800 border-gray-600 focus:border-purple-500"
                  placeholder="Şifrenizi girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 neon-glow"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              <span className="text-purple-400">Gizmo Hesap:</span><br/>
              Gizmo sistemindeki kullanıcı bilgilerinizle giriş yapın
            </p>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              ← Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
