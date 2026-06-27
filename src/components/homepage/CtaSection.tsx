import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-[#13151f] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Organize Your Knowledge?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Join thousands of developers who stopped losing their best code and ideas.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-500"
            >
              Get Started Free
            </Link>
            <a
              href="#pricing"
              className="text-base font-medium text-slate-300 transition-colors hover:text-white"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
