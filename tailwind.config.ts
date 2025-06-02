
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontSize: {
				'xs-enhanced': ['14px', { lineHeight: '1.5' }],
				'sm-enhanced': ['15px', { lineHeight: '1.5' }],
				'base-enhanced': ['17px', { lineHeight: '1.6' }],
				'lg-enhanced': ['19px', { lineHeight: '1.6' }],
				'xl-enhanced': ['22px', { lineHeight: '1.5' }],
				'2xl-enhanced': ['26px', { lineHeight: '1.4' }],
				'3xl-enhanced': ['32px', { lineHeight: '1.3' }],
				'4xl-enhanced': ['38px', { lineHeight: '1.2' }],
			},
			spacing: {
				'enhanced': '16px',
				'enhanced-sm': '12px',
				'enhanced-lg': '20px',
				'enhanced-xl': '24px',
			},
			minHeight: {
				'touch': '44px',
				'touch-lg': '48px',
			},
			minWidth: {
				'touch': '44px',
				'touch-lg': '48px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'danger-blink': {
					'0%, 50%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'25%, 75%': {
						opacity: '0.3',
						transform: 'scale(1.05)'
					}
				},
				'danger-blink-fast': {
					'0%, 50%': {
						opacity: '1',
						transform: 'scale(1)',
						backgroundColor: 'rgb(239 68 68)'
					},
					'25%, 75%': {
						opacity: '0.4',
						transform: 'scale(1.08)',
						backgroundColor: 'rgb(220 38 38)'
					}
				},
				'danger-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)',
						boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.05)',
						boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'danger-blink': 'danger-blink 0.6s ease-in-out infinite',
				'danger-blink-fast': 'danger-blink-fast 0.4s ease-in-out infinite',
				'danger-pulse': 'danger-pulse 0.8s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
