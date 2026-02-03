import { Link } from 'react-router-dom'
import { categoryNames, type LegoCategory } from '@/types'

const popularCategories: LegoCategory[] = [
  'star-wars',
  'technic',
  'city',
  'harry-potter',
  'marvel',
  'creator',
]

export default function Footer() {
  return (
    <footer className="bg-lego-black text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-lego-yellow rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧱</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">לגו ישראל</h3>
                <p className="text-sm text-gray-400">השוואת מחירים</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              מצא את המחירים הזולים ביותר למוצרי לגו בישראל. השווה מחירים בין חנויות וחסוך כסף!
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">קטגוריות פופולריות</h4>
            <ul className="space-y-2">
              {popularCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/category/${cat}`}
                    className="text-gray-400 hover:text-lego-yellow transition-colors"
                  >
                    {categoryNames[cat]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4">קישורים</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/deals" className="text-gray-400 hover:text-lego-yellow transition-colors">
                  מבצעים חמים
                </Link>
              </li>
              <li>
                <Link to="/alerts" className="text-gray-400 hover:text-lego-yellow transition-colors">
                  התרעות מחיר
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-lego-yellow transition-colors">
                  חיפוש מתקדם
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">צור קשר</h4>
            <p className="text-gray-400 text-sm mb-4">
              יש לך שאלות או הצעות? נשמח לשמוע ממך!
            </p>
            <a
              href="mailto:contact@lego-israel.co.il"
              className="text-lego-yellow hover:underline"
            >
              contact@lego-israel.co.il
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>
            אתר זה אינו קשור או מאושר על ידי LEGO Group.
            <br />
            LEGO הוא סימן מסחרי של LEGO Group.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} לגו ישראל - השוואת מחירים</p>
        </div>
      </div>
    </footer>
  )
}
