
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Mail, Phone, User, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only validate REQUIRED fields according to Gizmo API
    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gereklidir';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    } else if (formData.username.length > 30) {
      newErrors.username = 'Kullanıcı adı en fazla 30 karakter olmalıdır';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    } else if (formData.password.length > 45) {
      newErrors.password = 'Şifre en fazla 45 karakter olmalıdır';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre onayı gereklidir';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    // Optional fields - only validate if provided
    if (formData.firstName.trim() && formData.firstName.length > 45) {
      newErrors.firstName = 'Ad en fazla 45 karakter olmalıdır';
    }

    if (formData.lastName.trim() && formData.lastName.length > 45) {
      newErrors.lastName = 'Soyad en fazla 45 karakter olmalıdır';
    }

    if (formData.email.trim()) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi giriniz';
      } else if (formData.email.length > 254) {
        newErrors.email = 'E-posta adresi en fazla 254 karakter olmalıdır';
      }
    }

    if (formData.phone.trim()) {
      if (!/^\d{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Geçerli bir telefon numarası giriniz (10-11 haneli)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/gizmo/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword, // Add confirmPassword field
          email: formData.email,
          phone: formData.phone
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Üyelik başarıyla oluşturuldu!');
        router.push('/auth/signin?message=registration-success');
      } else {
        // Handle both HTTP errors and API success=false responses
        const errorMessage = data.message || 'Üye kayıt işlemi başarısız oldu';
        toast.error(errorMessage);
        
        // Log detailed error info for debugging
        console.error('Registration failed:', {
          status: response.status,
          message: data.message,
          success: data.success,
          details: data.details
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Link>
        </div>

        <Card className="border-purple-500/20 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-purple-300 flex items-center justify-center">
              <UserPlus className="h-6 w-6 mr-2" />
              Gizmo Üye Kayıt
            </CardTitle>
            <CardDescription className="text-slate-300">
              Venusespor Cafe Gizmo sistemine kayıt olun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-300">
                    Ad
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Adınız (isteğe bağlı)"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 ${
                        errors.firstName ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-400 text-sm">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-300">
                    Soyad
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Soyadınız (isteğe bağlı)"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 ${
                        errors.lastName ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-400 text-sm">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Kullanıcı Adı *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Kullanıcı adınız"
                    value={formData.username}
                    onChange={handleChange}
                    className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 ${
                      errors.username ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-sm">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  E-posta
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="E-posta adresiniz (isteğe bağlı)"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">
                  Telefon
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Telefon numaranız (isteğe bağlı)"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-sm">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Şifre *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Şifreniz"
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Şifre Onayı *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Şifrenizi tekrar giriniz"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 ${
                      errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Kayıt Yapılıyor...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Üye Ol
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Zaten hesabınız var mı?{' '}
                <Link
                  href="/auth/signin"
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Giriş Yap
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
