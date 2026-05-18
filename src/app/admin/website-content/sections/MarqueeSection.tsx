'use client';

import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CustomEditor from '@/components/custom-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import VideoWatermark from '@/components/VideoWatermark';
import {
  LuRefreshCw as RefreshCw,
  LuPlus as Plus,
  LuTrash2 as Trash,
  LuGlobe as Globe,
  LuPhone as Phone,
  LuMail as Mail,
  LuPalette as Palette,
  LuNavigation as Navigation,
  LuMessageSquare as MessageSquare,
  LuLink as LinkIcon,
  LuSettings as Settings,
  LuSparkles as Sparkles,
  LuInfo as Info,
  LuStar as Star,
  LuChartBar as BarChart,
  LuBriefcase as Briefcase,
  LuAward as Award,
  LuImage as ImageIcon,
  LuFileText as FileText,
  LuDownload as DownloadIcon,
  LuLayoutList as LayoutIcon,
  LuArrowUp,
  LuArrowDown,
  LuGripVertical,
  LuSearch as Search,
  LuLoader as Loader2,
  LuPlay as Play,
  LuEye as Eye,
} from 'react-icons/lu';
import {
  defaultSectionOrder,
} from '@/lib/websiteContentDefaults';
import type { WebsiteContent } from './types';


interface MarqueeSectionProps {
  content: WebsiteContent;
  updateContent: (path: string[], value: unknown) => void;
  editingMessageIndex: number | null;
  setEditingMessageIndex: (index: number | null) => void;
  addMarqueeMessage: () => void;
  removeMarqueeMessage: (index: number) => void;
}

export function MarqueeSection({
  content,
  updateContent,
  editingMessageIndex,
  setEditingMessageIndex,
  addMarqueeMessage,
  removeMarqueeMessage,
}: MarqueeSectionProps) {
  return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Marquee Banner Settings
              </CardTitle>
              <CardDescription>Configure the scrolling banner at the top of the header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold">Enable Marquee</label>
                  <p className="text-sm text-gray-500">Show/hide the marquee banner</p>
                </div>
                <button
                  onClick={() => updateContent(['marquee', 'enabled'], !content.marquee.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    content.marquee.enabled ? 'bg-[#7B2CBF]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      content.marquee.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Marquee Messages</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addMarqueeMessage}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Message
                  </Button>
                </div>
                {content.marquee.messages.map((message, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={message}
                      onChange={(e) => {
                        const newMessages = [...content.marquee.messages];
                        newMessages[index] = e.target.value;
                        updateContent(['marquee', 'messages'], newMessages);
                      }}
                      placeholder="Enter marquee message"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMarqueeMessage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Gradient Start Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.marquee.gradientFrom}
                      onChange={(e) => updateContent(['marquee', 'gradientFrom'], e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={content.marquee.gradientFrom}
                      onChange={(e) => updateContent(['marquee', 'gradientFrom'], e.target.value)}
                      placeholder="#EC4899"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Gradient End Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.marquee.gradientTo}
                      onChange={(e) => updateContent(['marquee', 'gradientTo'], e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={content.marquee.gradientTo}
                      onChange={(e) => updateContent(['marquee', 'gradientTo'], e.target.value)}
                      placeholder="#A855F7"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
  );
}
