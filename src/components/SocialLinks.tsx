import React from 'react';

export interface SocialLink {
  name: string;
  href: string;
  ariaLabel: string;
  icon: (size?: number) => React.ReactNode;
}

/**
 * Verified official social media links for Monks & Monkeys Travels.
 * Rules:
 * - Only Instagram, Facebook, and YouTube are included.
 * - Icons only: no text labels.
 * - Opens in new tab with target="_blank" and rel="noopener noreferrer".
 * - Screen-reader accessible via aria-label.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Instagram',
    ariaLabel: 'Instagram',
    href: 'https://www.instagram.com/monksandmonkeys.travel?stkn=dWNuYXVuMnM0azkw',
    icon: (size = 18) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    ariaLabel: 'Facebook',
    href: 'https://www.facebook.com/share/1ZCwCHb8Mi/',
    icon: (size = 18) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    ariaLabel: 'YouTube',
    href: 'https://youtube.com/@monksandmonkeystravels?si=200OlrPcBr_-ddwj',
    icon: (size = 18) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
        aria-hidden="true"
      >
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
];

export interface SocialLinksProps {
  className?: string;
  iconSize?: number;
  itemClassName?: string;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  className = 'flex items-center gap-4',
  iconSize = 18,
  itemClassName = 'hover:text-[#D97736] transition-colors',
}) => {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map(({ name, href, ariaLabel, icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          className={itemClassName}
        >
          {icon(iconSize)}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
