/** In-app #tag link styling (shared by post lists and the tag index). */
export const hashtagClassNames = {
  link: "text-xs font-mono text-primary/70 hover:text-primary transition-colors",
  linkActive: "text-xs font-mono text-primary hover:text-primary/70 transition-colors",
  /** /tags list: same color as body text, emphasis via weight. */
  tagsIndex: "text-sm font-mono font-semibold text-base-content hover:underline underline-offset-2",
} as const;
