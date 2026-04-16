import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { useSearchParams, Link } from 'react-router-dom';
import { FiFilter, FiX, FiChevronRight } from 'react-icons/fi';
import './Home.scss';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹25,000', min: 5000, max: 25000 },
  { label: '₹25,000 – ₹1,00,000', min: 25000, max: 100000 },
  { label: 'Over ₹1,00,000', min: 100000, max: 0 },
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: '' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Avg. Customer Review', value: 'rating_desc' },
];

const CAROUSEL_IMAGES = [
  'https://m.media-amazon.com/images/I/61lwJy4B8PL._SX3000_.jpg',
  'https://m.media-amazon.com/images/I/71Ie3JXGfVL._SX3000_.jpg',
  'https://m.media-amazon.com/images/I/71U-Q+N7PXL._SX3000_.jpg',
  'https://m.media-amazon.com/images/I/61zAjw4bqPL._SX3000_.jpg'
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1));

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const brand = searchParams.get('brand') || '';

  const isSearchActive = search || category || sort || minPrice || maxPrice || brand;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await api.get(`/products${query ? `?${query}` : ''}`);
        setProducts(res.data.products || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [searchParams]);

  // Fetch products by category for home page grid sections
  useEffect(() => {
    if (!isSearchActive) {
      const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books'];
      const fetchCategoryProducts = async () => {
        const data = {};
        for (const cat of categories) {
          try {
            const res = await api.get(`/products?category=${cat}`);
            data[cat] = res.data.products?.slice(0, 4) || [];
          } catch (err) { console.error(err); }
        }
        setCategoryProducts(data);
      };
      fetchCategoryProducts();
    }
  }, [isSearchActive]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  // Home Page Grid Static Data (Hardcoded Sections)
  const categoryGrids = [
    {
      title: 'Best of Electronics',
      category: 'Electronics',
      items: [
        { name: 'Smartphones', img: 'https://picsum.photos/seed/iphone15a/200/200', query: 'Electronics' },
        { name: 'Headphones', img: 'https://picsum.photos/seed/sonywha/200/200', query: 'Electronics' },
        { name: 'Laptops', img: 'https://picsum.photos/seed/macairm2a/200/200', query: 'Electronics' },
        { name: 'Watches', img: 'https://picsum.photos/seed/galaxywatcha/200/200', query: 'Electronics' }
      ]
    },
    {
      title: 'Fashion Trends',
      category: 'Fashion',
      items: [
        { name: 'Men\'s Clothing', img: 'https://picsum.photos/seed/levisa/200/200', query: 'Fashion' },
        { name: 'Women\'s Ethnic', img: 'https://picsum.photos/seed/bibaa/200/200', query: 'Fashion' },
        { name: 'Footwear', img: 'https://picsum.photos/seed/nikeairma/200/200', query: 'Fashion' },
        { name: 'Watches', img: 'https://picsum.photos/seed/titana/200/200', query: 'Fashion' }
      ]
    },
    {
      title: 'Home Essentials',
      category: 'Home & Kitchen',
      items: [
        { name: 'Kitchen', img: 'https://picsum.photos/seed/fryera/200/200', query: 'Home & Kitchen' },
        { name: 'Bedding', img: 'https://picsum.photos/seed/bedsheeta/200/200', query: 'Home & Kitchen' },
        { name: 'Cleaning', img: 'https://picsum.photos/seed/roombaa/200/200', query: 'Home & Kitchen' },
        { name: 'Storage', img: 'https://picsum.photos/seed/flaska/200/200', query: 'Home & Kitchen' }
      ]
    },
    {
      title: 'Great Reads',
      category: 'Books',
      items: [
        { name: 'Self Help', img: 'https://picsum.photos/seed/atomica/200/200', query: 'Books' },
        { name: 'Fiction', img: 'https://picsum.photos/seed/alcha/200/200', query: 'Books' },
        { name: 'Bestsellers', img: 'https://picsum.photos/seed/moneypsycha/200/200', query: 'Books' },
        { name: 'Business', img: 'https://picsum.photos/seed/richdada/200/200', query: 'Books' }
      ]
    }
  ];

  return (
    <div className="home">
      {!isSearchActive && (
        <>
          <div className="home__carousel">
            <button className="home__carouselBtn prev" onClick={prevSlide}>&#10094;</button>
            <div className="home__carouselTrack" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {CAROUSEL_IMAGES.map((img, i) => (
                <img key={i} src={img} alt={`Banner ${i + 1}`} className="home__carouselImg" />
              ))}
            </div>
            <button className="home__carouselBtn next" onClick={nextSlide}>&#10095;</button>
          </div>

          <div className="home__grids">
            {categoryGrids.map((grid, idx) => (
              <div key={idx} className="home__gridCard">
                <h3>{grid.title}</h3>
                <div className="home__gridItems">
                  {grid.items.map((item, i) => (
                    <div key={i} className="home__gridItem" onClick={() => updateParam('category', item.query)}>
                      <img src={item.img} alt={item.name} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
                <Link to={`/?category=${grid.category}`} className="home__gridLink">See all results <FiChevronRight /></Link>
              </div>
            ))}
          </div>

          {/* Product Grid Sections */}
          <div className="home__productSections">
            {Object.entries(categoryProducts).map(([category, prods]) => (
              prods.length > 0 && (
                <div key={category} className="home__productSection">
                  <h2 className="home__sectionTitle">{category}</h2>
                  <div className="home__productGrid">
                    {prods.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <Link to={`/?category=${category}`} className="home__seeAllLink">See all {category}</Link>
                </div>
              )
            ))}
          </div>
        </>
      )}

      {isSearchActive && (
        <div className="home__searchHeader">
          <div className="home__searchInfo">
            <span className="home__resultCount">{products.length} results</span>
            {search && <span>for "<strong>{search}</strong>"</span>}
            {category && <span className="home__filterTag">{category} <FiX onClick={() => updateParam('category', '')} /></span>}
            {brand && <span className="home__filterTag">{brand} <FiX onClick={() => updateParam('brand', '')} /></span>}
            <button className="home__clearBtn" onClick={clearFilters}>Clear all</button>
          </div>
          <div className="home__sortRow">
            <label>Sort by:</label>
            <select value={sort} onChange={e => updateParam('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="home__filterToggle" onClick={() => setShowFilters(v => !v)}>
              <FiFilter /> Filters
            </button>
          </div>
        </div>
      )}

      <div className="home__body">
        {isSearchActive && (
          <aside className={`home__sidebar ${showFilters ? 'open' : ''}`}>
            <div className="home__sidebarHeader">
              <h3>Filters</h3>
              <button className="home__sidebarClose" onClick={() => setShowFilters(false)}><FiX /></button>
            </div>
            <div className="filterGroup">
              <h4>Category</h4>
              {['Electronics', 'Fashion', 'Books', 'Home & Kitchen', 'Beauty & Health', 'Sports & Outdoors', 'Toys & Games', 'Grocery'].map(c => (
                <label key={c} className="filterGroup__item">
                  <input type="radio" name="cat" checked={category === c} onChange={() => updateParam('category', c)} />
                  {c}
                </label>
              ))}
            </div>
            <div className="filterGroup">
              <h4>Price</h4>
              {PRICE_RANGES.map(r => (
                <label key={r.label} className="filterGroup__item">
                  <input type="radio" name="price"
                    checked={minPrice === String(r.min) && (r.max ? maxPrice === String(r.max) : !maxPrice)}
                    onChange={() => { updateParam('minPrice', String(r.min)); updateParam('maxPrice', r.max ? String(r.max) : ''); }} />
                  {r.label}
                </label>
              ))}
            </div>
            <div className="filterGroup">
              <h4>Brands</h4>
              {['Apple', 'Samsung', 'OnePlus', 'Realme', 'Motorola', 'Xiaomi', 'POCO', 'Oppo'].map(b => (
                <label key={b} className="filterGroup__item">
                  <input type="checkbox" checked={brand.includes(b)} onChange={() => updateParam('brand', brand === b ? '' : b)} />
                  {b}
                </label>
              ))}
            </div>
          </aside>
        )}

        <div className="home__main">
          {isSearchActive && (
            loading ? (
              <div className="home__loading"><div className="home__spinner" /></div>
            ) : (
              <>
                {products.length === 0 && (
                  <div className="home__empty">
                    <h3>No results found</h3>
                    <p>Try different keywords or clear filters.</p>
                  </div>
                )}
                <div className="home__row">
                  {products.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
