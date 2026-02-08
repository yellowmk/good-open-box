import { Link } from 'react-router-dom'

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="mt-auto">
      {/* Back to top */}
      <button
        onClick={scrollTop}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm py-3 transition"
      >
        Back to top
      </button>

      {/* Main footer links */}
      <div className="bg-gray-800 text-gray-300">
        <div className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold text-sm mb-3">Get to Know Us</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white hover:underline">About Good Open Box</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">Careers</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">Press Releases</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">Sustainability</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">Shop With Us</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-white hover:underline">All Products</Link></li>
                <li><Link to="/products?condition=open-box" className="hover:text-white hover:underline">Open Box Deals</Link></li>
                <li><Link to="/products?condition=refurbished" className="hover:text-white hover:underline">Refurbished Items</Link></li>
                <li><Link to="/products?condition=like-new" className="hover:text-white hover:underline">Like New</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products?category=Electronics" className="hover:text-white hover:underline">Electronics</Link></li>
                <li><Link to="/products?category=Home+%26+Kitchen" className="hover:text-white hover:underline">Home & Kitchen</Link></li>
                <li><Link to="/products?category=Sports+%26+Outdoors" className="hover:text-white hover:underline">Sports & Outdoors</Link></li>
                <li><Link to="/products?category=Fashion" className="hover:text-white hover:underline">Fashion</Link></li>
                <li><Link to="/products?category=Toys+%26+Games" className="hover:text-white hover:underline">Toys & Games</Link></li>
                <li><Link to="/products?category=Beauty+%26+Personal+Care" className="hover:text-white hover:underline">Beauty & Personal Care</Link></li>
                <li><Link to="/products?category=Automotive" className="hover:text-white hover:underline">Automotive</Link></li>
                <li><Link to="/products?category=Office+%26+School" className="hover:text-white hover:underline">Office & School</Link></li>
                <li><Link to="/products?category=Baby+%26+Kids" className="hover:text-white hover:underline">Baby & Kids</Link></li>
                <li><Link to="/products?category=Patio+%26+Garden" className="hover:text-white hover:underline">Patio & Garden</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-3">Help & Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/orders" className="hover:text-white hover:underline">Your Orders</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">Shipping Rates & Policies</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">Returns & Replacements</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline">Customer Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-900 text-gray-400 border-t border-gray-700">
        <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col items-center gap-3">
          <Link to="/">
            <img src="/logo-full.png" alt="Good Open Box" className="h-14 w-auto" />
          </Link>
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Good Open Box. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
