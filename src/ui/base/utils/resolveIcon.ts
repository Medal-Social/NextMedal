import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
  ArrowUp,
  Award,
  Bell,
  Bookmark,
  Box,
  Briefcase,
  Building,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleCheck,
  Clock,
  Cloud,
  Code,
  Coffee,
  Compass,
  Copy,
  CreditCard,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  File,
  FileQuestion,
  FileText,
  Filter,
  Flag,
  Folder,
  Gift,
  Globe,
  Grid,
  Hash,
  Heart,
  HelpCircle,
  Home,
  Image,
  Info,
  Key,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Link,
  List,
  Loader2,
  Lock,
  Mail,
  MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  MoreHorizontal,
  MousePointerClick,
  Music,
  Package,
  Palette,
  Pencil,
  Phone,
  Play,
  Plus,
  Printer,
  QrCode,
  Radio,
  RefreshCcw,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tag,
  Target,
  Terminal,
  ThumbsUp,
  Trash,
  TrendingUp,
  Trophy,
  Truck,
  Umbrella,
  Unlock,
  Upload,
  User,
  Users,
  Video,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { stegaClean } from 'next-sanity';

/**
 * Static icon map for tree-shakeable Lucide icons.
 * Add new icons here when they need to be selectable in Sanity CMS.
 *
 * Performance: This approach bundles only the icons listed here (~50-100KB)
 * instead of the entire Lucide library (~500KB+).
 */
const iconMap: Record<string, LucideIcon> = {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
  ArrowUp,
  Award,
  Bell,
  Bookmark,
  Box,
  Briefcase,
  Building,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleCheck,
  Clock,
  Cloud,
  Code,
  Coffee,
  Compass,
  Copy,
  CreditCard,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  File,
  FileQuestion,
  FileText,
  Filter,
  Flag,
  Folder,
  Gift,
  Globe,
  Grid,
  Hash,
  Heart,
  HelpCircle,
  Home,
  Image,
  Info,
  Key,
  LayoutGrid,
  LayoutTemplate,
  Layers,
  Link,
  List,
  Loader2,
  Lock,
  Mail,
  MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  MoreHorizontal,
  MousePointerClick,
  Music,
  Package,
  Palette,
  Pencil,
  Phone,
  Play,
  Plus,
  Printer,
  QrCode,
  Radio,
  RefreshCcw,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Tag,
  Target,
  Terminal,
  ThumbsUp,
  Trash,
  TrendingUp,
  Trophy,
  Truck,
  Umbrella,
  Unlock,
  Upload,
  User,
  Users,
  Video,
  Wifi,
  X,
  Zap,
};

/**
 * Resolves an icon name to a Lucide icon component.
 * Handles various formats:
 * - Direct name: "Activity"
 * - With prefix: "lucide/Activity"
 * - Lu prefix: "LuActivity"
 *
 * @param iconName - The icon name to resolve
 * @returns The Lucide icon component or null if not found
 */
export function resolveIcon(iconName: string): LucideIcon | null {
  const cleanName = stegaClean(iconName);
  if (!cleanName) return null;

  // Handle "lucide/Activity" format
  const name = cleanName.includes('/') ? cleanName.split('/')[1] : cleanName;

  // Check if the icon exists in our static map
  if (name in iconMap) {
    return iconMap[name];
  }

  // Handle "Lu" prefix (e.g., "LuActivity" -> "Activity")
  if (name.startsWith('Lu') && name.length > 2) {
    const strippedName = name.substring(2);
    if (strippedName in iconMap) {
      return iconMap[strippedName];
    }
  }

  return null;
}

/**
 * Check if an icon name is valid (exists in the static map).
 * Use this for Sanity schema validation.
 */
export function isValidIconName(iconName: string): boolean {
  return resolveIcon(iconName) !== null;
}

/**
 * Gets the fallback icon URL for external icon service
 * @param iconName - The icon name
 * @returns The icon URL
 */
export function getFallbackIconUrl(iconName: string): string {
  return `https://ic0n.dev/${stegaClean(iconName)}`;
}
