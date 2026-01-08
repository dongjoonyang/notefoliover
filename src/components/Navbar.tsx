"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

function NavbarContent({ categories, initialIsAdmin }: { categories: any[], initialIsAdmin: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategory = searchParams.get('category');
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 관리자 상태 관리
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  useEffect(() => {
    setMounted(true);
    // ✅ 새로고침이나 페이지 이동 시 쿠키를 직접 확인해서 isAdmin 상태 업데이트
    const checkAdmin = () => {
      const hasAdminCookie = document.cookie.split(';').some((item) => item.trim().startsWith('is_admin='));
      setIsAdmin(hasAdminCookie);
    };

    checkAdmin();
  }, [pathname]); // 경로가 바뀔 때마다 체크

  // ✅ 로그아웃 핸들러
  const handleLogout = () => {
    // 쿠키 삭제
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  const getDesktopLinkStyle = (isActive: boolean) => 
    `text-sm font-bold tracking-tight transition-colors hover:text-blue-600 ${
      isActive ? "text-black dark:text-white" : "text-zinc-400 dark:text-zinc-500"
    }`;

  const getMobileLinkStyle = (isActive: boolean) => 
    `block text-5xl font-black py-4 uppercase tracking-tighter transition-colors ${
      isActive ? "text-black dark:text-white" : "text-zinc-200 dark:text-zinc-800"
    }`;

  return (
    <>
      <nav className="border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-[100] shadow-sm transition-colors h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          
          <div className="flex items-center gap-10">
            <Link href="/" className="font-black text-xl tracking-tighter z-[120] dark:text-white relative">
              Behance
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <Link href="/all" className={getDesktopLinkStyle(pathname === '/all' && !currentCategory)}>ALL</Link>
              {categories?.map((cat: any) => (
                <Link key={cat.id} href={`/all?category=${cat.name}`} className={getDesktopLinkStyle(currentCategory === cat.name)}>
                  {cat.name}
                </Link>
              ))}
              
              {/* ✅ 데스크톱 관리자 메뉴 섹션 */}
              {isAdmin && (
                <div className="flex items-center gap-6 ml-4 pl-6 border-l border-zinc-100 dark:border-zinc-800">
                  <Link href="/admin" className={getDesktopLinkStyle(pathname.startsWith('/admin'))}>
                    ADMIN
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-sm font-bold tracking-tight text-red-500 hover:text-red-600 transition-colors"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 다크모드 토글 */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 z-[120] transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <AnimatePresence mode="wait">
                {mounted && (
                  <motion.span
                    key={theme}
                    initial={{ y: 10, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -10, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2 }}
                    className="text-lg"
                  >
                    {theme === 'dark' ? '🌞' : '🌙'}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* 햄버거 메뉴 버튼 (모바일) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 z-[120] relative flex items-center justify-center"
            >
              <div className="relative w-6 h-4">
                <motion.span className="absolute w-6 h-0.5 bg-black dark:bg-white block origin-center" style={{ top: 0 }} animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} />
                <motion.span className="absolute w-6 h-0.5 bg-black dark:bg-white block" style={{ top: "50%", marginTop: "-1px" }} animate={isMobileMenuOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }} />
                <motion.span className="absolute w-6 h-0.5 bg-black dark:bg-white block origin-center" style={{ bottom: 0 }} animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 오버레이 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-[90] lg:hidden flex flex-col p-10 pt-32 overflow-y-auto"
          >
            <div className="flex flex-col gap-2">
              <Link href="/all" className={getMobileLinkStyle(pathname === '/all' && !currentCategory)}>ALL</Link>
              {categories?.map((cat: any) => (
                <Link key={cat.id} href={`/all?category=${cat.name}`} className={getMobileLinkStyle(currentCategory === cat.name)}>
                  {cat.name}
                </Link>
              ))}

              {/* ✅ 모바일 관리자 메뉴 추가 */}
              {isAdmin && (
                <div className="mt-10 pt-10 border-t border-zinc-100 dark:border-zinc-800">
                  <Link href="/admin" className={getMobileLinkStyle(pathname.startsWith('/admin'))}>
                    ADMIN
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="block text-5xl font-black py-4 uppercase tracking-tighter text-red-500 text-left"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Navbar({ categories = [], initialIsAdmin = false }: { categories: any[], initialIsAdmin?: boolean }) {
  return (
    <Suspense fallback={<div className="h-16 border-b bg-white dark:bg-zinc-950" />}>
      <NavbarContent categories={categories} initialIsAdmin={initialIsAdmin} />
    </Suspense>
  );
}