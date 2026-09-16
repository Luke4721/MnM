/**
 * Admin Dashboard Unified Design Tokens
 * Consistent styling, colors, glassmorphic presets, and elevation.
 */

export const ADMIN_TOKENS = {
  colors: {
    brand: {
      orange: '#FF9933',
      orangeHover: '#F2871F',
      gradient: 'from-rose-500 to-indigo-600',
      gradientLight: 'from-rose-500/90 to-indigo-500/90',
      gradientSubtle: 'from-rose-500/10 to-indigo-500/10',
    },
    status: {
      success: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      },
      warning: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      },
      danger: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      },
      info: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500',
      },
    },
    neutrals: {
      pageBg: 'bg-wave-gradient',
      cardBg: 'bg-white/50',
      cardBgHover: 'bg-white/70',
      subtleBg: 'bg-white/60',
      border: 'border-white/60',
      borderSubtle: 'border-white/40',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-400',
    },
  },

  surfaces: {
    card: 'bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl',
    cardSolid: 'bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl',
    cardInteractive: 'bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl hover:bg-white/75 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all',
    header: 'bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.02)]',
    sidebar: 'bg-white/50 backdrop-blur-xl border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]',
    dropdown: 'bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_16px_40px_rgba(0,0,0,0.1)] rounded-2xl',
    modal: 'bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_24px_60px_rgba(0,0,0,0.15)] rounded-3xl',
    input: 'bg-white/60 border border-white/60 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white/95 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-sm',
    badge: 'px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm inline-flex items-center gap-1.5',
  },

  shadows: {
    sm: 'shadow-[0_2px_8px_rgba(0,0,0,0.02)]',
    md: 'shadow-[0_4px_16px_rgba(0,0,0,0.04)]',
    lg: 'shadow-[0_8px_32px_rgba(0,0,0,0.04)]',
    xl: 'shadow-[0_16px_48px_rgba(0,0,0,0.08)]',
    modal: 'shadow-[0_24px_60px_rgba(0,0,0,0.15)]',
    primaryButton: 'shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.4)]',
    dangerButton: 'shadow-[0_4px_12px_rgba(244,63,94,0.25)] hover:shadow-[0_6px_16px_rgba(244,63,94,0.4)]',
  },

  radii: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },

  breakpoints: {
    mobileMax: 767,
    tabletMin: 768,
    desktopMin: 1024,
  },
} as const;
