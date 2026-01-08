export default function Loading() {
    // 스켈레톤 카드 6개를 생성
    const skeletons = Array.from({ length: 6 }, (_, i) => i);
  
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* 제목 부분 스켈레톤 */}
        <div className="h-10 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse mb-12" />
  
        {/* 카드 그리드 스켈레톤 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skeletons.map((i) => (
            <div key={i} className="flex flex-col gap-4">
              {/* 이미지 영역 */}
              <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
              
              {/* 텍스트 영역 (카테고리) */}
              <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse mt-2" />
              
              {/* 텍스트 영역 (제목) */}
              <div className="space-y-2">
                <div className="h-5 w-full bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                <div className="h-5 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }