"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Save, ArrowLeft } from "lucide-react";
import Link from "lucide-react";
import { useRouter } from "next/navigation"; // 1. useRouter 추가

// --- 개별 카드 컴포넌트 ---
function SortableCard({ project }: { project: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 0 };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-xl overflow-hidden shadow-sm ${isDragging ? "ring-2 ring-blue-500 opacity-50" : ""}`}>
      <div className="relative aspect-video bg-gray-100">
        <div {...attributes} {...listeners} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg cursor-grab active:cursor-grabbing z-10">
          <GripVertical size={16} />
        </div>
        {project.thumbnail && <img src={project.thumbnail} className="w-full h-full object-cover" />}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold truncate">{project.title}</h3>
        <p className="text-[10px] text-blue-600 font-semibold mt-1">{project.categoryName}</p>
      </div>
    </div>
  );
}

// --- 메인 페이지 컴포넌트 ---
export default function ReorderPage() {
  const router = useRouter(); // 2. 라우터 선언
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      // 💡 여기서도 캐시를 피하기 위해 t=${Date.now()}를 붙여줍니다.
      const [pRes, cRes] = await Promise.all([
        fetch(`/api/projects?limit=100&t=${Date.now()}`), 
        fetch("/api/categories")
      ]);
      setProjects(await pRes.json());
      setCategories(await cRes.json());
    };
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return filter === "all" ? projects : projects.filter(p => p.categoryName === filter);
  }, [filter, projects]);

// admin/reorder/page.tsx 내부의 handleDragEnd 함수

const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    const oldIndex = projects.findIndex((i) => i.id === active.id);
    const newIndex = projects.findIndex((i) => i.id === over.id);
    const newArray = arrayMove(projects, oldIndex, newIndex);
    
    setProjects(newArray); // 1. 화면에 즉시 반영 (부드러운 드래그)
    setIsSaving(true);

    try {
      await fetch("/api/projects/reorder", {
        method: "POST",
        body: JSON.stringify({ ids: newArray.map(p => p.id) }),
      });
      
      // ✨ [수정] 페이지를 이동하지 않고, Next.js에게 서버 데이터가 바뀌었음을 알림
      // 이렇게 하면 관리자 화면에 그대로 남으면서 캐시만 업데이트됩니다.
      router.refresh(); 

    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false); // 저장 중 알림 끄기
    }
  }
};

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <a href="/admin" className="text-sm text-gray-500 flex items-center gap-1 mb-2">
            <ArrowLeft size={14}/> 관리자 홈
          </a>
          <h1 className="text-3xl font-black">순서 관리</h1>
        </div>
        {isSaving && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 animate-pulse">
            <Save size={16}/> 저장 중...
          </div>
        )}
      </header>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-sm font-bold ${filter === "all" ? "bg-zinc-900 text-white" : "bg-white border"}`}>전체</button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFilter(cat.name)} className={`px-4 py-2 rounded-full text-sm font-bold ${filter === cat.name ? "bg-blue-600 text-white" : "bg-white border"}`}>{cat.name}</button>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredItems} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredItems.map((project) => (
              <SortableCard key={project.id} project={project} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}