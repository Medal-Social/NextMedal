import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="max-w-md rounded-lg border-2 border-dashed border-gray-300 p-12">
        <h2 className="text-xl font-semibold mb-2">This page is empty</h2>
        <p className="text-gray-500 mb-6">Add modules in the Studio to populate this page.</p>
        <Link
          href="/studio"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Go to Studio
        </Link>
      </div>
    </div>
  );
}
