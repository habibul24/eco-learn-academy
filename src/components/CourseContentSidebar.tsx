
import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

type Chapter = {
  id: number;
  title: string;
  order_index: number; // FIX: Add order_index property
  description?: string | null;
};

type Video = {
  id: number;
  chapter_id: number;
  title: string;
  video_url: string;
  duration?: number | null;
};

type Props = {
  chapters: Chapter[];
  videos: Video[];
  firstVideoUrl: string | null;
  activeVideoUrl: string | null;
  setActiveVideoUrl: (value: string | null) => void;
};

export default function CourseContentSidebar({
  chapters,
  videos,
  firstVideoUrl,
  activeVideoUrl,
  setActiveVideoUrl,
}: Props) {
  // Find the very first video (lowest chapter order_index, then lowest video id)
  let firstVideoId: number | null = null;
  let sortedChapters = chapters.slice().sort((a, b) => a.order_index - b.order_index);
  for (const chapter of sortedChapters) {
    const chapterVideos = videos.filter(v => v.chapter_id === chapter.id);
    if (chapterVideos.length > 0) {
      // Get the video with the lowest id in this chapter (if multiple videos per chapter)
      chapterVideos.sort((a, b) => a.id - b.id);
      firstVideoId = chapterVideos[0].id;
      break;
    }
  }

  return (
    <div className="bg-white border rounded-xl shadow p-6 mb-5">
      <strong className="block text-green-900 text-lg mb-3">Course content</strong>
      <Accordion type="single" collapsible defaultValue={String(chapters[0]?.id)}>
        {sortedChapters.map((chapter) => {
          const vids = videos.filter(v => v.chapter_id === chapter.id);
          return (
            <AccordionItem key={chapter.id} value={String(chapter.id)}>
              <AccordionTrigger className="text-green-800 font-medium">{chapter.title}</AccordionTrigger>
              <AccordionContent className="pb-2">
                <ul>
                  {vids.map((video) => {
                    const isFirst = video.id === firstVideoId;
                    const isActive = activeVideoUrl === video.video_url;
                    return (
                      <li
                        key={video.id}
                        className={`
                          flex items-center justify-between p-1 pl-3 rounded
                          ${isFirst ? "hover:bg-green-50 cursor-pointer" : "cursor-not-allowed bg-gray-100 opacity-60"}
                          ${isActive && isFirst ? "bg-green-100" : ""}
                        `}
                        onClick={() => {
                          if (isFirst) setActiveVideoUrl(video.video_url);
                        }}
                        style={{ pointerEvents: isFirst ? "auto" : "none" }}
                        aria-disabled={!isFirst}
                        tabIndex={isFirst ? 0 : -1}
                      >
                        <span className="flex items-center gap-2 text-green-900 text-sm">
                          <Youtube size={16} className="text-red-600" />
                          {video.title}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {video.duration
                            ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
                            : ""}
                        </span>
                        {!isFirst && (
                          <span className="text-[10px] ml-3 px-2 py-1 rounded-full bg-gray-200 text-gray-600">Locked</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold text-lg mt-6 transition-colors rounded shadow">
        Buy Course
      </Button>
    </div>
  );
}
