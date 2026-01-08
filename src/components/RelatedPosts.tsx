// components/RelatedPosts.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function RelatedPosts({ posts }: { posts: any[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-24 border-t border-zinc-100 dark:border-zinc-900 pt-16">
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 tracking-tighter uppercase">
        More to Explore
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/projects/${post.id}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-4">
              {post.thumbnail ? (
                <Image 
                  src={post.thumbnail} 
                  alt={post.title} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400">No Image</div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 block">
                {post.categoryName}
              </span>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:underline">
                {post.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}