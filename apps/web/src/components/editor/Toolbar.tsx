import { Bold, Download, Italic, Link2, MessageSquarePlus, Wand2 } from "lucide-react";

const tools = [
  { label: "Bold", icon: Bold },
  { label: "Italic", icon: Italic },
  { label: "Link", icon: Link2 },
  { label: "Comment", icon: MessageSquarePlus },
  { label: "AI rewrite", icon: Wand2 },
  { label: "Export", icon: Download },
];

export function Toolbar() {
  return (
    <div className="flex flex-wrap gap-2 border-b border-zinc-200 p-3">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <button key={tool.label} title={tool.label} className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100">
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

export default Toolbar;
