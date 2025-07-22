
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Phone, MessageCircle, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export function ContactSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: 'Mesaj Gönderildi!',
          description: 'En kısa sürede size dönüş yapacağız.',
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: 'Hata!',
        description: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact-section" className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bizimle <span className="text-purple-400">İletişime</span> Geçin
          </h2>
          <p className="text-gray-400 text-lg">
            Sorularınız, önerileriniz veya rezervasyon talepleriniz için
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-6">İletişim Bilgileri</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="font-medium text-white">Adres</p>
                    <p className="text-gray-400 text-sm">Merkez Mahallesi, Gaming Sokağı No:1</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Phone className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium text-white">Telefon</p>
                    <p className="text-gray-400 text-sm">+90 555 123 4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <MessageCircle className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-white">WhatsApp</p>
                    <p className="text-gray-400 text-sm">+90 555 123 4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="font-medium text-white">E-posta</p>
                    <p className="text-gray-400 text-sm">info@venusespor.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="gaming-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Hızlı Bilgi</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Rezervasyon gerekli değil</p>
                <p>• Grup indirimleri mevcut</p>
                <p>• Doğum günü organizasyonları</p>
                <p>• Turnuva düzenlemeleri</p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="gaming-card p-6">
              <h3 className="text-xl font-bold text-white mb-6">Mesaj Gönder</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Adınız
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 focus:border-purple-500"
                      placeholder="Adınızı girin"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-posta
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 focus:border-purple-500"
                      placeholder="E-posta adresiniz"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Konu
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-600 focus:border-purple-500"
                    placeholder="Mesaj konusu"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mesaj
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="bg-gray-800 border-gray-600 focus:border-purple-500"
                    placeholder="Mesajınızı yazın"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 neon-glow"
                >
                  {isSubmitting ? (
                    'Gönderiliyor...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Mesaj Gönder
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
