import { BlogCard } from "@/components/blog-card";
import type { Blog } from "@/types";

export type BlogListProps = {
  blogs: Blog[];
};

export function BlogList({ blogs }: Readonly<BlogListProps>) {
  if (blogs.length === 0) {
    return (
      <div className="border border-border py-12 text-center">
        <p className="text-muted-foreground">
          No blog posts available at the moment.
        </p>
      </div>
    );
  }

  const blogsByYear = blogs.reduce<Record<string, Blog[]>>((acc, blog) => {
    const year = blog.publishedAt
      ? new Date(blog.publishedAt).getFullYear().toString()
      : "Archive";
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(blog);
    return acc;
  }, {});

  const years = Object.keys(blogsByYear).sort((a, b) => {
    if (a === "Archive") {
      return 1;
    }
    if (b === "Archive") {
      return -1;
    }
    return Number(b) - Number(a);
  });

  return (
    <div className="flex flex-col gap-12">
      {years.map((year) => (
        <section aria-labelledby={`year-${year}`} key={year}>
          <div className="mb-4 flex items-center gap-4">
            <h2
              className="font-semibold text-muted-foreground text-sm tracking-wider"
              id={`year-${year}`}
            >
              {year}
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {blogsByYear[year]?.map((blog) => (
              <BlogCard blog={blog} key={blog._id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
