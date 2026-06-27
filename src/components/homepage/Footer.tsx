import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#252838] bg-[#0c0e16]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                DC
              </div>
              <span className="text-lg font-semibold text-white">DevClustr</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500">The developer knowledge hub</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Product</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#features" className="text-sm text-slate-500 hover:text-slate-300">Features</a></li>
              <li><a href="#pricing" className="text-sm text-slate-500 hover:text-slate-300">Pricing</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300">Changelog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Resources</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300">Documentation</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300">API</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300">Status</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300">About</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300">Blog</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-slate-300">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#252838] pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">© {year} DevClustr. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
