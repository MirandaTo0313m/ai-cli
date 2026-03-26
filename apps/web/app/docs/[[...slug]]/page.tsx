import { extractHeadings, getDoc } from "fromsrc";
import { notFound } from "next/navigation";

import { Mdx } from "../mdx";
import { Outline } from "../outline";

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  const path = slug ?? [];
  const doc = await getDoc("docs", path);

  if (!doc) {notFound();}

  const headings = extractHeadings(doc.content).filter(
    (heading) => heading.level >= 2 && heading.level <= 3
  );

  return (
    <div className="flex w-full max-w-7xl mx-auto">
      <article className="flex-1 min-w-0 px-8 py-12 lg:px-12">
        <div className="docs-article max-w-[860px]">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="mt-3 text-lg text-muted">{doc.description}</p>
            )}
          </header>
          <Mdx source={doc.content} />
        </div>
      </article>
      <Outline headings={headings} />
    </div>
  );
}
