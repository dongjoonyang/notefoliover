"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, Tag, ListOrdered } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // 💡 실시간 인증 감시 로직
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const hasAdminCookie = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("is_admin="));

      if (!hasAdminCookie) {
        console.log("관리자 권한 만료 감지: 로그인 페이지로 이동합니다.");
        router.push("/login"); 
      }
    };

    checkAuthAndRedirect();
    const interval = setInterval(checkAuthAndRedirect, 2000);
    
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-zinc-900">
      {/* 사이드바 */}
      <aside className="w-52 bg-zinc-900 text-white p-6 flex flex-col fixed h-full">
        <h2 className="text-xl font-bold mb-10 text-blue-400">Admin Panel</h2>
        
        <nav className="flex-1 space-y-4 text-sm">
          <Link href="/admin" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <LayoutDashboard size={20} /> <span>대시보드</span>
          </Link>
          
          <Link href="/admin/categories" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <Tag size={20} /> <span>카테고리 관리</span>
          </Link>
          
          <Link href="/admin/projects" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <FolderKanban size={20} /> <span>프로젝트 관리</span>
          </Link>

          {/* ✅ 이전에 만들어드린 순서 관리 경로(/admin/order)로 복구 */}
          <Link href="/admin/reorder" className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <ListOrdered size={20} /> <span>순서 관리</span>
          </Link>
        </nav>

        {/* 로그아웃 버튼 */}
        <div className="pt-6 border-t border-zinc-800">
          <LogoutButton variant="sidebar" />
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 ml-52 p-10">
        {children}
      </main>
    </div>
  );
}