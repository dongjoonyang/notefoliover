"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";

export default function TOC() {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState("");
  const [isBottom, setIsBottom] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateHeadings = useCallback(() => {
    const contentArea = document.querySelector(".prose-custom");
    if (!contentArea) return;

    // ✅ 중복 ID 방지를 위한 카운터 객체
    const idCounts: Record<string, number> = {};

    const elements = Array.from(contentArea.querySelectorAll("h2, h3")).map((elem) => {
      const text = elem.textContent?.trim() || "";
      // 1. 기본 ID 생성
      let baseId = elem.id || text.replace(/\s+/g, "-").toLowerCase();
      
      // 2. 중복 체크 및 고유 ID 부여
      if (idCounts[baseId] === undefined) {
        idCounts[baseId] = 0;
      } else {
        idCounts[baseId]++;
        baseId = `${baseId}-${idCounts[baseId]}`; // 중복이면 뒤에 -1, -2 등을 붙임
      }

      elem.id = baseId; // 실제 DOM 요소의 ID도 업데이트해서 스크롤 연동 보장
      return { id: baseId, text, level: Number(elem.tagName.substring(1)) };
    });
    
    if (elements.length > 0) setHeadings(elements);
  }, []);

  useEffect(() => {
    setMounted(true);
    updateHeadings();

    const interval = setInterval(() => {
      const content = document.querySelector(".prose-custom h2, .prose-custom h3");
      if (content) {
        updateHeadings();
        clearInterval(interval);
      }
    }, 100);

    const activeObserver = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) => 
            prev.boundingClientRect.y < curr.boundingClientRect.y ? prev : curr
          );
          setActiveId(topEntry.target.id);
        }
      },
      { rootMargin: "-120px 0% -70% 0%", threshold: 0 }
    );

    const bottomObserver = new IntersectionObserver(
      (entries) => setIsBottom(entries[0].isIntersecting),
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );

    const targets = document.querySelectorAll(".prose-custom h2, .prose-custom h3");
    targets.forEach((h) => activeObserver.observe(h));
    
    const footerArea = document.querySelector(".comment-section");
    if (footerArea) bottomObserver.observe(footerArea);

    return () => {
      clearInterval(interval);
      activeObserver.disconnect();
      bottomObserver.disconnect();
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [updateHeadings, headings.length]);

  if (!mounted || headings.length === 0) return null;

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      isScrollingRef.current = true;
      setActiveId(id);

      const offset = 100;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000);
    }
  };

  return (
    <nav className={`relative pl-4 transition-opacity duration-300 ${isBottom ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-100 dark:bg-zinc-800 rounded-full" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-2 select-none">
        On this page
      </p>
      
      <ul className="relative flex flex-col gap-1">
        {headings.map((h, index) => ( // ✅ index를 map의 인자로 추가
          <li key={`${h.id}-${index}`} className="relative py-1"> {/* ✅ 고유 키 생성 */}
            {activeId === h.id && (
              <motion.div
                layoutId="active-toc-indicator"
                className="absolute -left-[17px] w-[2px] bg-blue-600 rounded-full z-10"
                style={{ height: "20px", top: "calc(50% - 10px)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            <a
              href={`#${h.id}`}
              onClick={(e) => { e.preventDefault(); scrollTo(h.id); }}
              className={`text-sm block px-2 transition-all duration-300 outline-none ${
                activeId === h.id 
                  ? "text-blue-600 font-bold translate-x-1" 
                  : "text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-100"
              } ${h.level === 3 ? "pl-6 text-[13px]" : "pl-2"}`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}