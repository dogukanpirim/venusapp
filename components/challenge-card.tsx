
'use client';

import { motion } from 'framer-motion';
import { Calendar, Target, Gift, Clock, Gamepad2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ClientTimeRemaining } from '@/components/client-date';
import Link from 'next/link';
import Image from 'next/image';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    image?: string | null;
    game: {
      name: string;
      image?: string | null;
      category: string;
    };
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
    category: 'AUTO' | 'MANUAL';
    difficulty: string;
    target: string;
    targetValue: number;
    currentProgress: number;
    pointsReward: number;
    creditsReward: number;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
    
    // Manual challenge fields
    submissionInstructions?: string | null;
    exampleImages?: string[];
    requiredProofCount?: number;
    
    // Auto challenge fields
    gizmoTrackingKey?: string | null;
    autoCompleteRule?: string | null;
    
    // Submissions (for manual challenges)
    submissions?: Array<{
      id: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
      createdAt: string;
    }>;
  };
}

const typeColors = {
  DAILY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  WEEKLY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  MONTHLY: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  SPECIAL: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeLabels = {
  DAILY: 'Günlük',
  WEEKLY: 'Haftalık',
  MONTHLY: 'Aylık',
  SPECIAL: 'Özel',
};

const categoryColors = {
  AUTO: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  MANUAL: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const categoryLabels = {
  AUTO: '🔄 Otomatik',
  MANUAL: '📸 Manuel',
};

const categoryDescriptions = {
  AUTO: 'Gizmo sistemi tarafından otomatik takip edilir',
  MANUAL: 'Screenshot ile kanıt göndermeniz gerekir',
};

const difficultyColors = {
  Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  Expert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const difficultyLabels = {
  Easy: 'Kolay',
  Medium: 'Orta',
  Hard: 'Zor',
  Expert: 'Uzman',
};

const submissionStatusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  UNDER_REVIEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const submissionStatusLabels = {
  PENDING: '⏳ Beklemede',
  APPROVED: '✅ Onaylandı',
  REJECTED: '❌ Reddedildi',
  UNDER_REVIEW: '🔍 İnceleniyor',
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const progress = (challenge.currentProgress / challenge.targetValue) * 100;
  const isCompleted = challenge.status === 'COMPLETED' || progress >= 100;
  const isExpired = challenge.status === 'EXPIRED';
  
  // For manual challenges, check submission status
  const latestSubmission = challenge.submissions && challenge.submissions.length > 0 
    ? challenge.submissions[0] 
    : null;
  const hasSubmission = !!latestSubmission;
  const submissionStatus = latestSubmission?.status;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className={`gaming-card group h-full flex flex-col overflow-hidden ${
        isCompleted || (challenge.category === 'MANUAL' && submissionStatus === 'APPROVED') 
          ? 'border-green-500/30 bg-green-500/5' : 
        isExpired ? 'border-gray-600/30 bg-gray-600/5' : 
        challenge.category === 'MANUAL' && submissionStatus === 'REJECTED' 
          ? 'border-red-500/30 bg-red-500/5' : ''
      }`}>
        <CardHeader className="p-0 relative">
          {/* Game Image */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={challenge.game.image || '/placeholder-game.jpg'}
              alt={challenge.game.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Challenge Category Badge */}
            <Badge 
              className={`absolute top-3 right-3 ${categoryColors[challenge.category]}`}
              title={categoryDescriptions[challenge.category]}
            >
              {categoryLabels[challenge.category]}
            </Badge>
            
            {/* Challenge Type Badge */}
            <Badge 
              className={`absolute top-3 left-3 ${typeColors[challenge.type]}`}
            >
              {typeLabels[challenge.type]}
            </Badge>
            
            {/* Difficulty Badge */}
            <Badge 
              className={`absolute top-12 left-3 ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}`}
            >
              {difficultyLabels[challenge.difficulty as keyof typeof difficultyLabels]}
            </Badge>

            {/* Status Badges */}
            {isCompleted && (
              <Badge className="absolute bottom-3 right-3 bg-green-500/20 text-green-400 border-green-500/30">
                ✅ Tamamlandı
              </Badge>
            )}
            {isExpired && (
              <Badge className="absolute bottom-3 right-3 bg-gray-500/20 text-gray-400 border-gray-500/30">
                ⏰ Süre Doldu
              </Badge>
            )}
            {challenge.category === 'MANUAL' && hasSubmission && submissionStatus && (
              <Badge className={`absolute bottom-3 right-3 ${submissionStatusColors[submissionStatus]}`}>
                {submissionStatusLabels[submissionStatus]}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 space-y-3">
          {/* Challenge Title */}
          <div>
            <h3 className="font-bold text-lg text-white mb-1 line-clamp-2">
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {challenge.description}
            </p>
          </div>

          {/* Game Info */}
          <div className="flex items-center text-sm text-gray-300">
            <Gamepad2 className="w-4 h-4 mr-2 text-purple-400" />
            <span>{challenge.game.name}</span>
            <span className="mx-2">•</span>
            <span className="text-gray-400">{challenge.game.category}</span>
          </div>

          {/* Challenge Category Info */}
          <div className={`bg-gradient-to-r ${
            challenge.category === 'AUTO' 
              ? 'from-cyan-900/20 to-blue-900/20' 
              : 'from-orange-900/20 to-red-900/20'
          } rounded-lg p-3`}>
            <div className="text-sm text-gray-300">
              <strong className={challenge.category === 'AUTO' ? 'text-cyan-300' : 'text-orange-300'}>
                {categoryLabels[challenge.category]}:
              </strong> {categoryDescriptions[challenge.category]}
            </div>
          </div>

          {/* Progress (for AUTO challenges or when we have progress data) */}
          {(challenge.category === 'AUTO' || challenge.currentProgress > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-300">
                  <Target className="w-4 h-4 mr-2 text-purple-400" />
                  <span>İlerleme</span>
                </div>
                <span className="text-white font-semibold">
                  {challenge.currentProgress}/{challenge.targetValue}
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-gray-800"
              />
            </div>
          )}

          {/* Target Description */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-300">
              <strong className="text-white">Hedef:</strong> {challenge.target}
            </div>
          </div>

          {/* Manual Challenge Instructions */}
          {challenge.category === 'MANUAL' && challenge.submissionInstructions && (
            <div className="bg-orange-900/20 rounded-lg p-3 border border-orange-500/30">
              <div className="text-sm text-orange-300 mb-2">
                <strong>📸 Kanıt Gönderme Talimatları:</strong>
              </div>
              <div className="text-sm text-gray-300">
                {challenge.submissionInstructions}
              </div>
              {challenge.requiredProofCount && challenge.requiredProofCount > 1 && (
                <div className="text-xs text-orange-400 mt-2">
                  * {challenge.requiredProofCount} adet screenshot gereklidir
                </div>
              )}
            </div>
          )}

          {/* Submission Status for Manual Challenges */}
          {challenge.category === 'MANUAL' && hasSubmission && submissionStatus && (
            <div className={`rounded-lg p-3 border ${
              submissionStatus === 'APPROVED' ? 'bg-green-900/20 border-green-500/30' :
              submissionStatus === 'REJECTED' ? 'bg-red-900/20 border-red-500/30' :
              submissionStatus === 'UNDER_REVIEW' ? 'bg-blue-900/20 border-blue-500/30' :
              'bg-yellow-900/20 border-yellow-500/30'
            }`}>
              <div className="text-sm">
                <strong className="text-white">Submission Durumu:</strong>
                <span className={`ml-2 ${
                  submissionStatus === 'APPROVED' ? 'text-green-400' :
                  submissionStatus === 'REJECTED' ? 'text-red-400' :
                  submissionStatus === 'UNDER_REVIEW' ? 'text-blue-400' :
                  'text-yellow-400'
                }`}>
                  {submissionStatusLabels[submissionStatus]}
                </span>
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center text-sm text-purple-300 mb-2">
              <Gift className="w-4 h-4 mr-2" />
              <span className="font-semibold">Ödüller</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Puan:</span>
                <span className="text-yellow-400 font-semibold">
                  +{challenge.pointsReward}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kredi:</span>
                <span className="text-green-400 font-semibold">
                  ₺{challenge.creditsReward}
                </span>
              </div>
            </div>
          </div>

          {/* Time Remaining */}
          {!isExpired && !isCompleted && !(challenge.category === 'MANUAL' && submissionStatus === 'APPROVED') && (
            <div className="flex items-center text-sm text-orange-400">
              <Clock className="w-4 h-4 mr-2" />
              <ClientTimeRemaining endDate={challenge.endDate} />
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button 
            className={`w-full ${
              isCompleted || (challenge.category === 'MANUAL' && submissionStatus === 'APPROVED')
                ? 'bg-green-600 hover:bg-green-700' 
                : isExpired 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : challenge.category === 'MANUAL' && submissionStatus === 'REJECTED'
                ? 'bg-red-600 hover:bg-red-700'
                : challenge.category === 'MANUAL' && hasSubmission
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            }`}
            disabled={isExpired || (challenge.category === 'MANUAL' && hasSubmission && submissionStatus !== 'REJECTED')}
            asChild={!isCompleted && !isExpired && !(challenge.category === 'MANUAL' && hasSubmission && submissionStatus !== 'REJECTED')}
          >
            {isCompleted || (challenge.category === 'MANUAL' && submissionStatus === 'APPROVED') ? (
              '✅ Tamamlandı'
            ) : isExpired ? (
              '⏰ Süre Doldu'
            ) : challenge.category === 'MANUAL' && submissionStatus === 'REJECTED' ? (
              <Link href={`/challenges/${challenge.id}`}>
                🔄 Tekrar Dene
              </Link>
            ) : challenge.category === 'MANUAL' && hasSubmission ? (
              submissionStatusLabels[submissionStatus!]
            ) : (
              <Link href={`/challenges/${challenge.id}`}>
                {challenge.category === 'AUTO' ? '🔄 Katıl' : '📸 Screenshot Gönder'}
              </Link>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
