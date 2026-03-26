import { rehypeSlug } from "fromsrc";
import {
  Badge,
  Callout,
  Card,
  Cards,
  CodeBlock,
  Kbd,
  LinkCard,
  LinkCards,
  Properties,
  Property,
  Step,
  Steps,
} from "fromsrc/client";
import { MDXRemote } from "next-mdx-remote/rsc";
import { isValidElement } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import remarkGfm from "remark-gfm";

type LinkProps = ComponentPropsWithoutRef<"a">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type ItemProps = ComponentPropsWithoutRef<"li">;
type CodeProps = ComponentPropsWithoutRef<"code"> & { children?: ReactNode };
type PreProps = ComponentPropsWithoutRef<"pre"> & { children?: ReactNode };
type TableProps = ComponentPropsWithoutRef<"table">;
type TheadProps = ComponentPropsWithoutRef<"thead">;
type ThProps = ComponentPropsWithoutRef<"th">;
type TdProps = ComponentPropsWithoutRef<"td">;
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">;

function language(node: ReactNode): string {
  if (!isValidElement(node)) {return "";}
  const props = node.props as { className?: string };
  const value = props.className ?? "";
  const match = value.match(/language-([a-z0-9_-]+)/i);
  return match?.[1] ?? "";
}

const components = {
  a: (props: LinkProps) => <a {...props} />,
  ul: (props: ListProps) => (
    <ul className="my-4 space-y-2 text-muted" role="list" {...props} />
  ),
  li: (props: ItemProps) => (
    <li className="flex gap-2" role="listitem">
      <span className="text-dim select-none" aria-hidden="true">
        •
      </span>
      <span>{props.children}</span>
    </li>
  ),
  code: (props: CodeProps) => <code {...props} />,
  pre: ({ children, ...props }: PreProps) => (
    <CodeBlock lang={language(children)}>
      <pre
        {...props}
        style={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
        }}
      >
        {children}
      </pre>
    </CodeBlock>
  ),
  table: (props: TableProps) => (
    <div
      className="my-6 overflow-x-auto rounded-xl border border-line"
      role="region"
    >
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: TheadProps) => <thead className="bg-surface" {...props} />,
  th: (props: ThProps) => (
    <th
      className="text-left px-4 py-3 font-medium text-fg border-b border-line"
      {...props}
    />
  ),
  td: (props: TdProps) => (
    <td className="px-4 py-3 border-b border-line/50" {...props} />
  ),
  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="my-6 pl-4 border-l-2 border-line text-muted italic"
      {...props}
    />
  ),
  Badge,
  Callout,
  Card,
  Cards,
  Kbd,
  LinkCard,
  LinkCards,
  Properties,
  Property,
  Step,
  Steps,
};

export async function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug],
        },
      }}
    />
  );
}
