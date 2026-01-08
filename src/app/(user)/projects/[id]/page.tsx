import { pool } from "@/lib/db";
import { notFound } from "next/navigation";
import CommentSection from "./CommentSection";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import ProgressBar from "./ProgressBar"; 
import TOC from "./TOC";
import ContentView from "./ContentView";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const cookieStore = await cookies();
  const isAdmin = !!cookieStore.get("admin_session");

  // 1. 현재 프로젝트 상세 정보 호출
  const [rows]: any = await pool.query(`
    SELECT p.*, c.name as categoryName 
    FROM Project p 
    LEFT JOIN Category c ON p.categoryId = c.id 
    WHERE p.id = ?
  `, [id]);

  const project = rows[0];
  if (!project) notFound();

  // 2. 🔥 추천 카드 데이터 호출 로직
  // 먼저 같은 카테고리의 다른 글들을 가져옵니다.
  let [relatedPosts]: any = await pool.query(`
    SELECT p.id, p.title, p.thumbnail, c.name as categoryName
    FROM Project p
    LEFT JOIN Category c ON p.categoryId = c.id
    WHERE p.categoryId = ? AND p.id != ?
    ORDER BY RAND()
    LIMIT 3
  `, [project.categoryId, id]);

  // 만약 같은 카테고리에 글이 없다면 (본인 제외 0개), 전체 카테고리에서 최신글 3개를 가져옵니다.
  if (relatedPosts.length === 0) {
    const [backupPosts]: any = await pool.query(`
      SELECT p.id, p.title, p.thumbnail, c.name as categoryName
      FROM Project p
      LEFT JOIN Category c ON p.categoryId = c.id
      WHERE p.id != ?
      ORDER BY p.createdAt DESC
      LIMIT 3
    `, [id]);
    relatedPosts = backupPosts;
  }

  // 3. 이전 글 / 다음 글 호출
  const [newerRows]: any = await pool.query(
    "SELECT id, title FROM Project WHERE sortOrder < ? ORDER BY sortOrder DESC LIMIT 1",
    [project.sortOrder]
  );
  const [olderRows]: any = await pool.query(
    "SELECT id, title FROM Project WHERE sortOrder > ? ORDER BY sortOrder ASC LIMIT 1",
    [project.sortOrder]
  );

  const newerPost = newerRows[0];
  const olderPost = olderRows[0];

  return (
    <article className="min-h-screen bg-white dark:bg-zinc-950 pb-20 relative transition-colors duration-300">
      <ProgressBar />

      {/* 헤더 영역 */}
      <header className="pt-20 pb-12 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/20">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/all" className="text-sm font-medium text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-8 inline-block">
            ← 전체 목록으로
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
              {project.categoryName || "Uncategorized"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 leading-tight mb-6 tracking-tight">
            {project.title}
          </h1>
          <div className="text-zinc-400 dark:text-zinc-500 text-sm font-medium">
            Published on {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </header>

      {/* 본문 및 하단 영역 */}
      <div className="max-w-3xl mx-auto px-6 relative flex flex-col items-center">
        {/* 목차 (TOC) */}
        <aside className="hidden xl:block absolute left-[calc(100%+60px)] top-16 h-full">
            <div className="sticky top-32 w-52">
              <TOC />
            </div>
        </aside>

        <div className="w-full py-16">
          {/* 본문 */}
          <ContentView html={project.description} />
          
          {/* 댓글 섹션 */}
          <div className="mt-24 border-t border-zinc-100 dark:border-zinc-900 pt-16">
            <CommentSection projectId={id} isAdmin={isAdmin} />
          </div>

          {/* 🔥 추천 프로젝트 섹션 (댓글 밑) */}
          {relatedPosts.length > 0 && (
            <section className="mt-32 border-t border-zinc-100 dark:border-zinc-900 pt-16">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 text-zinc-900 dark:text-zinc-100">
                Related Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rel: any) => (
                  <Link key={rel.id} href={`/projects/${rel.id}`} className="group block">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 mb-4 border border-zinc-100 dark:border-zinc-800 transition-all group-hover:border-zinc-200 dark:group-hover:border-zinc-700">
                      {rel.thumbnail ? (
                        <Image 
                          src={rel.thumbnail} 
                          alt={rel.title} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-zinc-300 dark:text-zinc-700 text-xs uppercase font-bold">No Image</div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">
                      {rel.categoryName}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* 하단 내비게이션 (이전/다음 글) */}
      <div className="max-w-3xl mx-auto px-6 mt-12 border-t border-zinc-100 dark:border-zinc-800 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newerPost ? (
            <Link href={`/projects/${newerPost.id}`} className="group p-8 border border-zinc-100 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-left block">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-2">이전 글</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">← {newerPost.title}</span>
            </Link>
          ) : (
            <div className="p-8 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl flex items-center justify-center opacity-40 bg-transparent text-zinc-300 dark:text-zinc-700 text-sm font-medium">
              최신 게시물입니다
            </div>
          )}
          
          {olderPost ? (
            <Link href={`/projects/${olderPost.id}`} className="group p-8 border border-zinc-100 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-right block">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-2">다음 글</span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{olderPost.title} →</span>
            </Link>
          ) : (
            <div className="p-8 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl flex items-center justify-center opacity-40 bg-transparent text-zinc-300 dark:text-zinc-700 text-sm font-medium">
              마지막 게시물입니다
            </div>
          )}
        </div>
      </div>
    </article>
  );
}