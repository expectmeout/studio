'use client'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { useRef, forwardRef, MutableRefObject } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'

const menuItems = [
   // { name: 'Case Studies', href: '/examples/case-studies' },
    { name: 'Our Process', href: '/our-process' },
    { name: 'Services', href: '#' },
    { name: 'Pricing', href: '/our-pricing' },
]

// Define Resources sub-menu items
const resourceSubItems = [
    { name: 'Calculator', href: '/examples/calculator' },
    { name: 'Blog', href: '/examples/blog' },
    { name: 'Newsletter', href: '/examples/resources#newsletter-signup' },
    { name: 'Contact Us', href: '/contact' },
];

// Define Services sub-menu items
const serviceSubItems = [
    { name: 'Dedicated VA Teams', href: '/services/operations' },
    { name: 'Sponsored Advertising', href: '/services/advertising' },
    { name: 'AI Automation Systems', href: '/services/ai-automations' },
];

// This component uses browser APIs and should only be rendered on the client side
export const HeroHeader = forwardRef<HTMLElement, {}>((props, ref) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    // Use explicit MutableRefObject type to allow assigning to .current
    const navRef = useRef<HTMLElement>(null) as MutableRefObject<HTMLElement | null>

    React.useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined') {
            const handleScroll = () => {
                setIsScrolled(window.scrollY > 50)
            }
            // Check initial scroll position
            handleScroll()
            window.addEventListener('scroll', handleScroll)
            return () => window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const scrollToBooking = () => {
        const targetElement = document.getElementById('booking-calendar-container');
        if (targetElement) {
            const headerOffset = navRef.current?.offsetHeight || 70;
            const buffer = 20;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset - buffer;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
        if (menuState) {
            setMenuState(false);
        }
    };

    return (
        <header>
            <nav
                ref={(el) => {
                    // Forward the ref to the parent component
                    if (typeof ref === 'function') {
                        ref(el);
                    } else if (ref) {
                        ref.current = el;
                    }
                    // Also maintain our internal ref
                    navRef.current = el;
                }}
                data-state={menuState ? 'active' : 'inactive'}
                className="fixed z-20 w-full px-2">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <svg viewBox="0 0 240 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-auto text-foreground">
                                  <g transform="translate(15 9)" fill="url(#chanlytics_logo_gradient_header)">
                                    <rect x="4" y="8" width="8" height="8" rx="2"/>
                                    <rect x="12" y="12" width="8" height="8" rx="2" opacity=".8"/>
                                    <rect x="20" y="16" width="8" height="8" rx="2" opacity=".6"/>
                                  </g>
                                  <text x="50" y="50%" dominantBaseline="middle" fontFamily="'Playwright Display', sans-serif" fontSize="28" fontWeight="400" letterSpacing="1" fill="currentColor">
                                    CHANLYTICS
                                  </text>
                                  <defs>
                                    <linearGradient id="chanlytics_logo_gradient_header" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                                      <stop stopColor="#4A6CF7"/>
                                      <stop offset="1" stopColor="#2BC8B7"/>
                                    </linearGradient>
                                  </defs>
                                </svg>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        {item.name === 'Resources' ? (
                                            <HoverCard openDelay={100} closeDelay={100}>
                                                <HoverCardTrigger asChild>
                                                    <Link
                                                        href={item.href}
                                                        className="flex items-center gap-1 text-muted-foreground hover:text-accent-foreground outline-none focus:outline-none">
                                                        <span>{item.name}</span>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Link>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-48 p-2" align="start">
                                                    <ul className="space-y-1">
                                                        {resourceSubItems.map((subItem, subIndex) => (
                                                            <li key={subIndex}>
                                                                <Link
                                                                    href={subItem.href}
                                                                    className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-accent-foreground">
                                                                    {subItem.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </HoverCardContent>
                                            </HoverCard>
                                        ) : item.name === 'Services' ? (
                                            <HoverCard openDelay={100} closeDelay={100}>
                                                <HoverCardTrigger asChild>
                                                    <Link
                                                        href={item.href}
                                                        className="flex items-center gap-1 text-muted-foreground hover:text-accent-foreground outline-none focus:outline-none">
                                                        <span>{item.name}</span>
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Link>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-48 p-2" align="start">
                                                    <ul className="space-y-1">
                                                        {serviceSubItems.map((subItem, subIndex) => (
                                                            <li key={subIndex}>
                                                                <Link
                                                                    href={subItem.href}
                                                                    className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-accent-foreground">
                                                                    {subItem.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </HoverCardContent>
                                            </HoverCard>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            {item.name === 'Resources' ? (
                                                <div className="font-semibold text-accent-foreground mb-2 mt-4">{item.name}</div>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setMenuState(false)}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                                </Link>
                                            )}
                                            {item.name === 'Resources' && (
                                                <ul className="pl-4 space-y-3 mt-2 border-l border-border">
                                                    {resourceSubItems.map((subItem, subIndex) => (
                                                        <li key={subIndex}>
                                                            <Link
                                                                href={subItem.href}
                                                                onClick={() => setMenuState(false)}
                                                                className="text-muted-foreground hover:text-accent-foreground block duration-150 text-sm">
                                                                <span>{subItem.name}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {item.name === 'Services' && (
                                                <ul className="pl-4 space-y-3 mt-2 border-l border-border">
                                                    {serviceSubItems.map((subItem, subIndex) => (
                                                        <li key={subIndex}>
                                                            <Link
                                                                href={subItem.href}
                                                                onClick={() => setMenuState(false)}
                                                                className="text-muted-foreground hover:text-accent-foreground block duration-150 text-sm">
                                                                <span>{subItem.name}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit md:items-center">
                                <Button
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}
                                    onClick={scrollToBooking}>
                                    <span>Get in Touch</span>
                                </Button>
                                <Button
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                                    onClick={scrollToBooking}>
                                    <span>Get in Touch</span>
                                </Button>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
})
