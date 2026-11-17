export type SpritewareTheme = 'nebula' | 'biopod' | 'liquid';
export interface SpritewareOptions {
 src: string; theme?: SpritewareTheme; poster?: string; title?: string;
 captions?: Array<{src: string; language?: string; label?: string}>;
 chapters?: Array<{time: number; label: string}> | 'auto';
 /** Directory containing themes/. Relative to document URL; include trailing slash. */
 assetBase?: string;
 crossOrigin?: 'anonymous' | 'use-credentials';
}
export interface SpritewareInstance {
 root: HTMLElement; video: HTMLVideoElement; player: HTMLElement; theme: {id: SpritewareTheme; name: string};
 /** True when artwork is decoded; false on artwork failure or disposal before readiness. */
 ready: Promise<boolean>;
 play(): Promise<void>; pause(): void; seek(seconds: number): void; sync(): void;
 dispose(): void;
}
export function mountSpriteware(host: Element, options: SpritewareOptions): SpritewareInstance;
export const spritewareThemes: Record<SpritewareTheme, {id: SpritewareTheme; name: string}>;
