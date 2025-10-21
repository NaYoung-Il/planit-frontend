/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: {
          DEFAULT: '#34D399',
          light: '#86EFAC',   
          dark: '#10B981',   
        },
        // 배경색
        bg: {
          DEFAULT: '#F5FFF8', 
          card: 'rgba(16, 185, 129, 0.08)', 
        },
        // 표면(Surface)
        surface: '#F0FDF4', 
        // 텍스트
        text: {
          DEFAULT: '#064E3B', 
          soft: '#047857',   
        },
        // 사이드바
        sidebar: {
          brand: '#0d5842',
          link: '#0f5a44',
        },        
        // 기타
        accent: '#22C55E',  
        panel: '#ffffff',  
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],            // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],        // 14px
        'DEFAULT': ['1rem', { lineHeight: '1.5rem' }],        // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],        // 18px
        'xl': ['1.5rem', { lineHeight: '2rem' }],             // 24px
        '2xl': ['2.75rem', { lineHeight: '3rem' }],           // 44px
      },

      borderRadius: {
        'DEFAULT': '0.75rem', // 12px
        'lg': '1rem',        // 16px
      },

      boxShadow: {
        'DEFAULT': '0 0.5rem 1.5rem rgba(16, 185, 129, 0.08)',
        'lg': '0 0.75rem 2rem rgba(16, 185, 129, 0.2)',
        'button': '0 0.25rem 1rem rgba(16, 185, 129, 0.3)',
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #D9F2E4 0%, #B9EFD2 94%)',
        'gradient-weather': 'linear-gradient(135deg, #63E5B2 0%, #2FC98F 100%)',
        'gradient-weather-clear': 'linear-gradient(160deg, #6EA1FF, #3E67F0)',
        'gradient-weather-night': 'linear-gradient(160deg, #233A7A, #0D1B3D)',
        'gradient-weather-sand': 'linear-gradient(160deg, #FFA46E, #FF6D6D)',
      },

      backdropBlur: {
        'DEFAULT': '0.5rem', // 8px
      },

      animation: {
        'fadeIn': 'fadeIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // dvh 지원
      height: {
        'dvh': '100dvh'
      },
      minHeight: {
        'dvh': '100dvh'
      },
      maxHeight: {
        'dvh': '100dvh'
      },
    },
  },
  plugins: [],
};