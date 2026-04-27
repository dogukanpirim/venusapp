'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Stage = 'amount' | 'qr' | 'success' | 'error';

interface QrDepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gizmoUserId: number | null;
  onSuccess?: (amount: number) => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

export function QrDepositModal({
  open,
  onOpenChange,
  gizmoUserId,
  onSuccess,
}: QrDepositModalProps) {
  const [stage, setStage] = useState<Stage>('amount');
  const [amount, setAmount] = useState<number>(100);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStage('amount');
        setQrImage(null);
        setPaymentIntent(null);
        setErrorMsg(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Long-poll the payment status when QR is shown
  useEffect(() => {
    if (stage !== 'qr' || !paymentIntent) return;

    let cancelled = false;

    async function pollOnce() {
      try {
        const res = await fetch(
          `/api/gizmo/v3/payment/wait?intent=${encodeURIComponent(paymentIntent!)}`,
        );
        if (cancelled) return;
        const json = await res.json();

        if (res.ok && json.success) {
          setStage('success');
          onSuccess?.(amount);
          return;
        }

        if (res.status === 408 || json.timeout) {
          // Timeout — restart poll (Gizmo /wait is long-poll, not infinite)
          setTimeout(pollOnce, 1000);
        } else {
          setErrorMsg(json.error || 'Ödeme onaylanmadı');
          setStage('error');
        }
      } catch (err) {
        if (!cancelled) {
          // Network glitch — retry
          setTimeout(pollOnce, 3000);
        }
      }
    }

    pollOnce();
    return () => {
      cancelled = true;
    };
  }, [stage, paymentIntent, amount, onSuccess]);

  async function createIntent() {
    if (!gizmoUserId) {
      setErrorMsg('Hesabın Gizmo ile bağlı değil. Önce cafe operatörüyle eşleştir.');
      setStage('error');
      return;
    }
    if (amount <= 0) return;

    setStage('qr');
    setQrImage(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gizmo/v3/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gizmoUserId, amount }),
      });
      const json = await res.json();

      if (res.ok && json.success && json.qrImage) {
        setPaymentIntent(json.paymentIntent);
        // QR image format: assume base64 PNG; if not data URL prefixed, add it
        const src = json.qrImage.startsWith('data:')
          ? json.qrImage
          : `data:image/png;base64,${json.qrImage}`;
        setQrImage(src);
      } else {
        setErrorMsg(json.error || 'QR kodu oluşturulamadı');
        setStage('error');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStage('error');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-fuchsia-400" />
            Bakiye Yükle
          </DialogTitle>
          <DialogDescription>
            Cafe bakiyene Gizmo üzerinden QR ile ödeme yap
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* ─── Stage: amount entry ─────────────────── */}
          {stage === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <Button
                    key={a}
                    variant={amount === a ? 'default' : 'outline'}
                    onClick={() => setAmount(a)}
                    className="text-sm"
                  >
                    {a} ₺
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Özel tutar (₺)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={10}
                  max={5000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="text-center text-lg font-semibold"
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Yüklediğin tutar Gizmo cafe bakiyene eklenir. Aynı zamanda{' '}
                <span className="font-medium text-amber-300">
                  ~{Math.floor(amount / 10)} coin
                </span>{' '}
                gamification ödülü kazanırsın.
              </div>

              <Button
                className="w-full bg-gradient-to-r from-fuchsia-600 to-cyan-500"
                onClick={createIntent}
                disabled={amount <= 0}
              >
                QR Kodu Oluştur
              </Button>
            </motion.div>
          )}

          {/* ─── Stage: QR display + waiting ─────────── */}
          {stage === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4 text-center"
            >
              <div className="flex justify-center">
                {qrImage ? (
                  <div className="rounded-xl bg-white p-4 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrImage}
                      alt="Ödeme QR Kodu"
                      className="h-56 w-56 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-muted/50">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <div>
                <p className="text-2xl font-bold">{amount} ₺</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Telefonunla QR'ı tara, ödemeyi tamamla
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Ödeme bekleniyor...
              </div>

              <Button variant="ghost" size="sm" onClick={() => setStage('amount')}>
                İptal et
              </Button>
            </motion.div>
          )}

          {/* ─── Stage: success ──────────────────────── */}
          {stage === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold">Ödeme Başarılı!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Bakiyene <span className="font-semibold text-amber-300">{amount} ₺</span>{' '}
                  yüklendi
                </p>
              </div>
              <Button onClick={() => onOpenChange(false)} className="w-full">
                Tamam
              </Button>
            </motion.div>
          )}

          {/* ─── Stage: error ────────────────────────── */}
          {stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 text-center space-y-4"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20">
                <AlertCircle className="h-10 w-10 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Bir Hata Oluştu</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {errorMsg || 'Bilinmeyen hata'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStage('amount')} className="flex-1">
                  Tekrar dene
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
                  Kapat
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
