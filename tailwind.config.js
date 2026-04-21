/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0a0f',
          900: '#0f1020',
          800: '#17182d'
        },
        neon: {
          cyan: '#00f5ff',
          violet: '#7b2fff',
          pink: '#ff4fd8',
          lime: '#8dff6a'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      boxShadow: {
        neon: '0 0 24px rgba(0, 245, 255, 0.25)',
        violet: '0 0 24px rgba(123, 47, 255, 0.28)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'hero-radial':
          'radial-gradient(circle at top, rgba(0,245,255,0.12), transparent 38%), radial-gradient(circle at 80% 20%, rgba(123,47,255,0.14), transparent 30%), linear-gradient(135deg, rgba(10,10,15,0.94), rgba(15,16,32,0.94))'
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 20s linear infinite',
        pulseGlow: 'pulseGlow 2.6s ease-in-out infinite',
        blink: 'blink 1s step-end infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(0,245,255,0.16)' },
          '50%': { boxShadow: '0 0 28px rgba(123,47,255,0.3)' }
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' }
        }
      }
    }
  },
  plugins: []
};
