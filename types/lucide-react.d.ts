declare module "lucide-react" {
  import { FC, SVGProps } from "react";

  type LucideIcon = FC<SVGProps<SVGSVGElement> & { size?: number | string }>;

  export const LogIn: LucideIcon;
  export const LogOut: LucideIcon;
  export const Loader2: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Save: LucideIcon;
  export const Trash2: LucideIcon;
  export const Check: LucideIcon;
  export const Copy: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const X: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Power: LucideIcon;
  export const KeyRound: LucideIcon;
  export const Edit: LucideIcon;
  export const Plus: LucideIcon;
  export const Server: LucideIcon;

  const icons: Record<string, LucideIcon>;
  export default icons;
}
