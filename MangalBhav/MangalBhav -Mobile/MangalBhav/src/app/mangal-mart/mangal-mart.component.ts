import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';


export interface Product {
  id: number;
  name: string;
  desc: string;
  description?: string;
  emoji: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  category: string;
  wishlisted: boolean;
  addedToCart: boolean;
}

export interface Category {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-mangal-mart',
  templateUrl: './mangal-mart.component.html',
  styleUrls: ['./mangal-mart.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule,PanditjibottomtabsComponent]
})
export class MangalMartComponent implements OnInit {

  searchQuery: string = '';
  activeCategory: string = 'all';
  cartCount: number = 0;

  categories: Category[] = [
    { key: 'all', label: 'All', icon: '🌺' },
    { key: 'diyas', label: 'Diyas', icon: '🪔' },
    { key: 'flowers', label: 'Flowers', icon: '🌸' },
    { key: 'threads', label: 'Sacred Threads', icon: '🧵' },
    { key: 'malas', label: 'Malas', icon: '📿' },
    { key: 'havan', label: 'Havan', icon: '🪵' },
    { key: 'idols', label: 'Idols', icon: '🛕' },
  ];

  featuredProduct: Product = {
    id: 0,
    name: 'Navratri Puja Complete Kit',
    desc: '',
    description: 'Everything you need for 9 days of divine celebration',
    emoji: '🪔',
    price: 599,
    originalPrice: 999,
    discount: 40,
    rating: 4.9,
    reviews: 512,
    category: 'all',
    wishlisted: false,
    addedToCart: false,
  };

  trendingProducts: Product[] = [
    { id: 10, name: 'Mitti Diyas (Pack 12)', desc: 'Clay · Pack of 12', emoji: '🪔', price: 49, originalPrice: 75, discount: 35, rating: 4.7, reviews: 88, category: 'diyas', wishlisted: false, addedToCart: false },
    { id: 11, name: 'Rudraksha Mala', desc: 'Natural · 108 beads', emoji: '📿', price: 299, originalPrice: 450, discount: 33, rating: 4.9, reviews: 210, category: 'malas', wishlisted: false, addedToCart: false },
    { id: 12, name: 'Pooja Thali Set', desc: 'Brass · 5 piece', emoji: '🌺', price: 189, originalPrice: 250, discount: 24, rating: 4.6, reviews: 63, category: 'flowers', wishlisted: false, addedToCart: false },
    { id: 13, name: 'Mauli Thread', desc: 'Cotton · Red & Yellow', emoji: '🧵', price: 29, originalPrice: 45, discount: 36, rating: 4.5, reviews: 177, category: 'threads', wishlisted: false, addedToCart: false },
    { id: 14, name: 'Lotus Agarbatti', desc: 'Pack of 100', emoji: '🪷', price: 65, originalPrice: 90, discount: 28, rating: 4.8, reviews: 145, category: 'flowers', wishlisted: false, addedToCart: false },
  ];

  allProducts: Product[] = [
    { id: 1, name: 'Premium Ghee Diya Set', desc: 'Brass finish · Pack of 6', emoji: '🪔', price: 149, originalPrice: 210, discount: 30, rating: 4.8, reviews: 124, category: 'diyas', wishlisted: false, addedToCart: false },
    { id: 2, name: '5 Mukhi Rudraksha Mala', desc: 'Natural · 108 beads', emoji: '📿', price: 349, originalPrice: 499, discount: 0, rating: 4.9, reviews: 89, category: 'malas', wishlisted: false, addedToCart: false },
    { id: 3, name: 'Pure Ganga Jal', desc: '500ml sealed bottle', emoji: '🧴', price: 89, originalPrice: 120, discount: 25, rating: 4.7, reviews: 203, category: 'all', wishlisted: false, addedToCart: false },
    { id: 4, name: 'Brass Pooja Thali', desc: 'Engraved · 12 inch', emoji: '🌸', price: 299, originalPrice: 450, discount: 0, rating: 4.6, reviews: 57, category: 'flowers', wishlisted: false, addedToCart: false },
    { id: 5, name: 'Havan Samagri Kit', desc: '250g · Pure herbs', emoji: '🪵', price: 199, originalPrice: 249, discount: 20, rating: 4.8, reviews: 311, category: 'havan', wishlisted: false, addedToCart: false },
    { id: 6, name: 'Ganesh Idol Brass', desc: 'Hand-crafted · 5 inch', emoji: '🛕', price: 699, originalPrice: 950, discount: 0, rating: 5.0, reviews: 42, category: 'idols', wishlisted: false, addedToCart: false },
    { id: 7, name: 'Camphor Tablets', desc: 'Pure · Pack of 50', emoji: '🕯️', price: 55, originalPrice: 80, discount: 31, rating: 4.7, reviews: 192, category: 'all', wishlisted: false, addedToCart: false },
    { id: 8, name: 'Shankh (Conch Shell)', desc: 'Natural · Polished', emoji: '🐚', price: 249, originalPrice: 350, discount: 29, rating: 4.8, reviews: 76, category: 'idols', wishlisted: false, addedToCart: false },
  ];

  filteredProducts: Product[] = [...this.allProducts];
  userDetails: any;

  constructor(public routerCtrl: NavController,
    private navCtrl: NavController,
    private toastCtrl: ToastController, private storage: Storage,
  ) { }

  async ngOnInit() {
    this.filterProducts();
    
    this.userDetails = await this.storage.get("account");
  }

  // ── NAVIGATION ─────────────────────────────────────────

  goHome() {
    this.navCtrl.navigateBack('/');
  }

  openCart() {
    // this.navCtrl.navigateForward('/cart');
  }

  openProduct(product: Product) {
    // this.navCtrl.navigateForward(`/product-detail/${product.id}`);
  }

  // ── FILTERS & SEARCH ───────────────────────────────────

  selectCategory(key: string) {
    this.activeCategory = key;
    this.filterProducts();
  }

  onSearch() {
    this.filterProducts();
  }

  
  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  filterProducts() {
    let result = [...this.allProducts];

    if (this.activeCategory !== 'all') {
      result = result.filter(p => p.category === this.activeCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      );
    }

    this.filteredProducts = result;
  }

  openFilter() {
    // open filter sheet
  }

  // ── CART ───────────────────────────────────────────────

  addToCart(product: Product) {
    if (product.addedToCart) return;

    product.addedToCart = true;
    this.cartCount++;

    this.showToast(`${product.name} added to cart 🛒`);

    // Reset the tick after 1.5s
    setTimeout(() => {
      product.addedToCart = false;
    }, 1500);
  }

  // ── WISHLIST ───────────────────────────────────────────

  toggleWishlist() {

  }

  // ── TOAST ──────────────────────────────────────────────

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1800,
      position: 'bottom',
      cssClass: 'mangal-toast',
      color: 'warning',
    });
    await toast.present();
  }

  // ─── Add these to your component class ───────────────────

  // Carpet image paths — put your 3 images in assets/ folder
  carpetImages: string[] = [
    '../../assets/carpet1.jpeg',
    '../../assets/carpet2.jpeg',
    '../../assets/carpet3.jpeg',
  ];

  activeSlide = 0;
  wishlisted = false;

  readonly AMAZON_LINK = 'https://www.amazon.in/dp/B0GXKJDD65';

  // ── Carousel controls ──────────────────────────────────

  nextSlide() {
    if (this.activeSlide < this.carpetImages.length - 1) {
      this.activeSlide++;
    }
  }

  prevSlide() {
    if (this.activeSlide > 0) {
      this.activeSlide--;
    }
  }

  goToSlide(index: number) {
    this.activeSlide = index;
  }

  // ── CTA ───────────────────────────────────────────────

  buyNow() {
    window.open(this.AMAZON_LINK, '_blank');
  }


  // ── Share ─────────────────────────────────────────────

  async shareProduct() {
    if (navigator.share) {
      await navigator.share({
        title: 'मंगल पूजा कालीन',
        text: 'Check out this beautiful Pooja Carpet on Amazon!',
        url: this.AMAZON_LINK,
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(this.AMAZON_LINK);
    }
  }



}