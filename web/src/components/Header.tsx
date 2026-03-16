import { Link } from 'wouter';

export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-gray-700">
            Tiny Inventory
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Products
            </Link>
            <Link href="/stores" className="text-gray-600 hover:text-gray-900 font-medium">
              Stores
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
