import {
  Code,
  File,
  Image as ImageIcon,
  Link as Link2,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideProps,
} from "lucide-react";

export const itemTypeIconMap: Record<string, React.ElementType<LucideProps>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: Link2,
  File,
  Image: ImageIcon,
};
