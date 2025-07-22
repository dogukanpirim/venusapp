
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ZoneDetail } from '@/components/zone-detail';

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    slug: string;
  };
}

async function getZone(slug: string) {
  try {
    const zone = await prisma.zone.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });
    return zone;
  } catch (error) {
    console.error('Error fetching zone:', error);
    return null;
  }
}

export default async function ZonePage({ params }: PageProps) {
  const zone = await getZone(params.slug);

  if (!zone) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ZoneDetail zone={zone} />
      </main>
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      select: { slug: true },
    });

    return zones.map((zone) => ({
      slug: zone.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
