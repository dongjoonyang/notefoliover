"use client";

export const dynamic = 'force-dynamic';
import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LoadingSkeleton from "./loading"; 

export default function AllPostsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProjectListContent />
    </Suspense>
  );
}

function ProjectListContent() {
  const [projects, setProjects] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true); 
  const [hasMore, setHasMore] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); 
  
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const observerTarget = useRef<HTMLDivElement>(null);

  const cleanDescription = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  };

  const fetchProjects = useCallback(async (isReset = false) => {
    if (loading && !isReset) return;
    
    setLoading(true);
    const targetPage = isReset ? 1 : page;
    
    try {
      // Aiven 등 외부 DB 사용 시 네트워크 지연을 시뮬레이션하려면 아래 주석 해제
      // await new Promise(resolve => setTimeout(resolve, 800));

      const response = await fetch(`/api/projects?page=${targetPage}&limit=6&search=${activeSearch}&category=${categoryParam}&v=${Date.now()}`);
      const data = await response.json();
      
      if (isReset) { 
        setProjects(data); 
        setPage(2); // 다음 페이지 준비
      } else { 
        setProjects(prev => [...prev, ...data.filter((n: any) => !prev.some(p => p.id === n.id))]); 
        setPage(p => p + 1); 
      }
      setHasMore(data.length === 6);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }, [page, activeSearch, categoryParam, loading]);

  // 카테고리/검색어 변경 시 리스트 초기화 없이 fetch (기존 데이터 유지로 고장난 느낌 방지)
  useEffect(() => { 
    fetchProjects(true); 
  }, [categoryParam, activeSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setActiveSearch(searchTerm);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchProjects(false);
    }, { threshold: 0.1 });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchProjects]);

  return (
    <main className="max-w-7xl mx-auto p-10 min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* 헤더 섹션 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
          {categoryParam === "all" ? "Archive" : categoryParam}
        </h1>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search & Press Enter"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm dark:text-zinc-200 outline-none focus:ring-2 focus:ring-zinc-500/20 transition-all"
          />
        </div>
      </div>

      <div className="relative">
        
        {/* 1. 중앙 로딩 바: '카테고리 변경' 시에만 노출 (page가 2일 때가 첫 페이지 로딩 직후 상태) */}
        {loading && projects.length > 0 && page <= 2 && (
          <div className="absolute inset-0 z-20 flex flex-col items-start justify-start pt-24 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[1px] transition-all">
            <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-900 rounded-full shadow-xl border border-zinc-100 dark:border-zinc-800 mx-auto">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 rounded-full animate-spin" />
              <span className="text-sm font-bold uppercase tracking-widest dark:text-white">Updating...</span>
            </div>
          </div>
        )}

        {/* 그리드 리스트 */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-500 ${loading && page <= 2 ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          {/* 완전 생초기 로딩(데이터 0개)일 때만 스켈레톤 노출 */}
          {loading && projects.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 rounded-3xl animate-pulse" />
                <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-6 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : (
            projects.map((project, index) => (
              <Link 
                href={`/projects/${project.id}`} 
                key={`${project.id}-${index}`} 
                className="group block border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 hover:shadow-xl transition-all"
              >
                <div className="relative aspect-video bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
                  {project.thumbnail && <Image src={project.thumbnail} alt={project.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-full uppercase">{project.categoryName || "Mixed"}</span>
                  <h2 className="text-xl font-bold mt-3 mb-2 uppercase line-clamp-1 dark:text-zinc-100">{project.title}</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-2 leading-relaxed">{cleanDescription(project.description)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 2. 하단 스피너: 스크롤을 내려서 '추가 데이터'를 가져올 때만 노출 (page가 2보다 클 때) */}
      {loading && projects.length > 0 && page > 2 && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
        </div>
      )}

      <div ref={observerTarget} className="h-20" />
    </main>
  );
}