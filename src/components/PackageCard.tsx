import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyProvider';
import { AnimatedNumber } from './AnimatedNumber';
import { TiltCard } from './TiltCard';
import { normalizeImageUrl, extractPackagePrice } from '../lib/packageUtils';

export function getPackageDuration(pkg: any): string {
  if (Array.isArray(pkg?.itinerary) && pkg.itinerary.length > 0) {
    const days = pkg.itinerary.length;
    const nights = Math.max(0, days - 1);
    return `${nights} Nights / ${days} Days`;
  }
  if (pkg?.duration) return pkg.duration;
  if (pkg?.durationNights && pkg?.durationDays) {
    return `${pkg.durationNights} Nights / ${pkg.durationDays} Days`;
  }
  if (pkg?.nights) return pkg.nights;
  if (pkg?.days) return pkg.days;
  return '';
}

export function getPackagePreviewText(pkg: any): string {
  const rawText =
    pkg?.overview ||
    pkg?.description ||
    (Array.isArray(pkg?.highlights) ? pkg.highlights.join(', ') : pkg?.highlights) ||
    '';
  const clean = String(rawText).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length > 0) return clean;
  const loc = pkg?.location || pkg?.locations || pkg?.destination;
  if (loc) {
    return `Experience the best of ${loc} with our handpicked tour package featuring guided sightseeing, premium accommodations, and seamless travel logistics.`;
  }
  return `Explore breathtaking destinations with our handpicked tour package featuring seamless itineraries, expert guides, and unforgettable travel experiences.`;
}

export const DEFAULT_PACKAGE_FALLBACK_IMAGE = '/images/hires/beauty-of-kashmir_fixed.jpg';

const ImageWithFallback: React.FC<{ src?: string | null; alt: string }> = ({ src, alt }) => {
  const normalizedSrc = normalizeImageUrl(src || '');
  const [imgSrc, setImgSrc] = React.useState<string>(normalizedSrc || DEFAULT_PACKAGE_FALLBACK_IMAGE);
  const [hasFailed, setHasFailed] = React.useState(false);

  React.useEffect(() => {
    const updated = normalizeImageUrl(src || '');
    setImgSrc(updated || DEFAULT_PACKAGE_FALLBACK_IMAGE);
    setHasFailed(false);
  }, [src]);

  const handleError = () => {
    if (!hasFailed && imgSrc !== DEFAULT_PACKAGE_FALLBACK_IMAGE) {
      setHasFailed(true);
      setImgSrc(DEFAULT_PACKAGE_FALLBACK_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      loading="lazy"
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
};

export interface PackageCardProps {
  pkg: any;
  index?: number;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, index = 0 }) => {
  const { currency, convertPrice } = useCurrency();
  const priceData = extractPackagePrice(pkg);
  const currentVal = priceData.hasPrice ? (convertPrice(priceData.rawPrice, true) as number) : 0;
  const originalVal = priceData.originalPriceINR
    ? (convertPrice(priceData.originalPriceINR, true) as number)
    : null;
  const symbol =
    currency === 'INR'
      ? '₹'
      : currency === 'USD'
      ? '$'
      : currency === 'EUR'
      ? '€'
      : currency === 'RUB'
      ? '₽'
      : currency;

  const title = pkg.title || pkg.name || 'Tour Package';
  const location = pkg.location || pkg.locations || pkg.destination || '';
  const previewText = getPackagePreviewText(pkg);
  const duration = getPackageDuration(pkg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: (index % 6) * 0.05 }}
      className="h-full"
    >
      <Link to={`/packages/${pkg.slug || pkg.id}`} className="no-underline block h-full group">
        <TiltCard>
          <div className="rounded-3xl bg-white dark:bg-zinc-900/60 border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02] flex flex-col h-full">
            {/* Media Hero */}
            <div className="h-60 relative overflow-hidden bg-zinc-950 shrink-0">
              <ImageWithFallback
                src={
                  pkg.featuredImage ||
                  pkg.image_url ||
                  pkg.heroImage ||
                  pkg.image ||
                  pkg.img ||
                  (Array.isArray(pkg.galleryImages) && pkg.galleryImages[0]?.url) ||
                  (Array.isArray(pkg.gallery) && pkg.gallery[0]?.url) ||
                  (Array.isArray(pkg.images) && pkg.images[0]) ||
                  ''
                }
                alt={title}
              />
              {priceData.discountPercentage && priceData.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-md shadow-md z-10">
                  {priceData.discountPercentage}% OFF
                </div>
              )}
              {duration && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1 shadow-sm z-10">
                  <MapPin size={12} className="text-[#FF9933] shrink-0" />
                  <span>{duration}</span>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-7 sm:p-8 flex flex-col flex-1">
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#FF9933] transition-colors">
                {title}
              </h3>
              {location && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1.5 mb-3">
                  <MapPin size={13} className="text-[#FF9933] shrink-0" />
                  <span className="truncate">{location}</span>
                </p>
              )}

              {/* Uniform 3-Line Preview Truncation */}
              <p
                className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 leading-relaxed flex-1 text-justify"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {previewText}
              </p>

              {/* Pricing Footer */}
              <div className="flex justify-between items-center mt-auto pt-5 border-t border-gray-100 dark:border-white/10">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold block uppercase tracking-wider mb-0.5">
                    {priceData.hasPrice ? 'Starting from' : 'Pricing'}
                  </span>
                  {priceData.hasPrice ? (
                    <div className="flex items-baseline gap-2">
                      {originalVal && originalVal > currentVal && (
                        <span className="text-gray-400 line-through text-xs font-semibold">
                          {symbol}
                          {Math.round(originalVal).toLocaleString()}
                        </span>
                      )}
                      <div className="text-2xl font-black text-[#D97736]">
                        <AnimatedNumber
                          value={currentVal}
                          formatFn={(val: number) => {
                            const sym =
                              currency === 'INR'
                                ? '₹'
                                : currency === 'USD'
                                ? '$'
                                : currency === 'EUR'
                                ? '€'
                                : currency === 'RUB'
                                ? '₽'
                                : currency;
                            return `${sym}${Math.round(val).toLocaleString()}`;
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-[#D97736] tracking-tight mt-1">
                      Price on request
                    </div>
                  )}
                </div>

                <div className="w-11 h-11 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 flex items-center justify-center group-hover:bg-[#FF9933] group-hover:text-white transition-all duration-300 shadow-md shrink-0">
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </Link>
    </motion.div>
  );
};

export default PackageCard;
