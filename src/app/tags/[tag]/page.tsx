import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowPathRoundedSquareIcon, HeartIcon } from "@heroicons/react/24/outline";
import { getGlobals } from "@/lib/globals";
import { countEntriesByTag, getEntriesByTag } from "@/lib/db";

const PAGE_SIZE = 40;

interface Props {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const { domain } = getGlobals();
  const displayTag = decodeURIComponent(tag);
  return {
    title: `#${displayTag}`,
    description: `Posts tagged #${displayTag} on ${domain}`,
    alternates: {
      canonical: `https://${domain}/tags/${encodeURIComponent(displayTag.toLowerCase())}`,
    },
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const { db } = getGlobals();
  const displayTag = decodeURIComponent(tag);

  const { page: pageParam } = await searchParams;
  const page = Math.max(0, parseInt(pageParam || "0", 10));
  const offset = page * PAGE_SIZE;

  const [total, entries] = await Promise.all([
    countEntriesByTag(db, displayTag),
    getEntriesByTag(db, displayTag, PAGE_SIZE, offset),
  ]);

  if (total === 0 && page === 0) {
    notFound();
  }

  const hasNext = offset + entries.length < total;
  const hasPrev = page > 0;

  return (
    <>
      <Link href="/" className="btn btn-ghost btn-sm gap-1 mb-6 -ml-2">
        <span>&larr;</span> All bots
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          #{displayTag}
        </h1>
        <p className="text-base-content/60 mt-1">
          {total.toLocaleString("en-US")} post{total !== 1 ? "s" : ""}
        </p>
      </div>

      <ul className="divide-y divide-base-300">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-baseline justify-between gap-4 py-2"
          >
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
              <Link
                href={`/@${entry.botUsername}`}
                className="text-xs text-base-content/50 font-mono shrink-0"
              >
                @{entry.botUsername}
              </Link>
              {entry.url ? (
                <a href={entry.url} className="link link-hover font-medium">
                  {entry.title}
                </a>
              ) : (
                <span className="font-medium">{entry.title}</span>
              )}
              {entry.hashtags.length > 0 && (
                <span className="flex gap-1 flex-wrap">
                  {entry.hashtags.map((t) => (
                    <Link
                      key={t}
                      href={`/tags/${encodeURIComponent(t.toLowerCase())}`}
                      className={`text-xs font-mono ${t.toLowerCase() === displayTag.toLowerCase() ? "text-primary" : "text-base-content/40 hover:text-primary/70"}`}
                    >
                      #{t}
                    </Link>
                  ))}
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <span
                title="Boosts"
                className="btn btn-ghost btn-xs gap-1 text-base-content/50 cursor-default"
              >
                <ArrowPathRoundedSquareIcon className="w-4 h-4" /> {entry.boostCount}
              </span>
              <span
                title="Favorites"
                className="btn btn-ghost btn-xs gap-1 text-base-content/50 cursor-default"
              >
                <HeartIcon className="w-4 h-4" /> {entry.likeCount}
              </span>
              {entry.publishedAt && (
                <time
                  dateTime={entry.publishedAt.toISOString()}
                  className="text-xs text-base-content/50 whitespace-nowrap"
                >
                  {entry.publishedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
            </span>
          </li>
        ))}
      </ul>

      {(hasPrev || hasNext) && (
        <div className="join mt-6">
          {hasPrev && (
            <Link
              href={`/tags/${encodeURIComponent(displayTag.toLowerCase())}?page=${page - 1}`}
              className="join-item btn btn-sm"
            >
              &laquo; Newer
            </Link>
          )}
          {hasNext && (
            <Link
              href={`/tags/${encodeURIComponent(displayTag.toLowerCase())}?page=${page + 1}`}
              className="join-item btn btn-sm"
            >
              Older &raquo;
            </Link>
          )}
        </div>
      )}
    </>
  );
}
