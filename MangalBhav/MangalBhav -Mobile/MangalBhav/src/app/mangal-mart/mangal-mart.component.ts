import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from 'src/providers';

@Component({
  selector: 'app-mangal-mart',
  templateUrl: './mangal-mart.component.html',
  styleUrls: ['./mangal-mart.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class MangalMartComponent implements OnInit {

  Products: any[] = [];
  isLoadingProducts = true;
  cartCount = 0;
  userDetails: any;

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    public apinu: ApiNU,
    private toastCtrl: ToastController,
    private storage: Storage,
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.loadAllProducts();
  }

  // ── LOAD PRODUCTS ──────────────────────────────────────

  loadAllProducts() {
    this.isLoadingProducts = true;

    this.apinu
      .postUrlData('ProductSelectByQuery?Query=IsActive=1 ORDER BY ProductName', null)
      .subscribe({
        next: (res: any) => {
          this.Products = (res.ProductList || []).map((p: any) => ({
            ...p,
            CarouselImages: [] as string[],
            activeSlide: 0
          }));

          this.isLoadingProducts = false;

          this.Products.forEach((p: any) => {
            this.loadMainImage(p);
            this.loadGalleryImages(p);
          });
        },
        error: () => {
          this.isLoadingProducts = false;
          this.showToast('Unable to load products right now.');
        }
      });
  }

  loadMainImage(product: any) {
    if (!product.MainImage) return;

    this.api.getImage('DownloadImages', {
      imageName: product.MainImage,
      imagePurpose: 'ProductImage'
    }).subscribe((blob: any) => {
      // main image goes first in the carousel
      product.CarouselImages = [URL.createObjectURL(blob), ...product.CarouselImages];
    });
  }

  loadGalleryImages(product: any) {
    this.apinu
      .postUrlData(
        `ProductImageSelectByQuery?Query=FK_ProductID=${product.ProductID} ORDER BY DisplayOrder ASC`,
        null
      )
      .subscribe((res: any) => {
        (res.ProductImageList || []).forEach((img: any) => {
          this.api.getImage('DownloadImages', {
            imageName: img.ImageURL,
            imagePurpose: 'ProductImage'
          }).subscribe((blob: any) => {
            product.CarouselImages = [...product.CarouselImages, URL.createObjectURL(blob)];
          });
        });
      });
  }

  // ── NAVIGATION ─────────────────────────────────────────

  goHome() {
    this.routerCtrl.navigateBack('/');
  }

  openCart() {
     this.routerCtrl.navigateForward('/orderlist');
  }

  placeOrder(product: any) {
    this.routerCtrl.navigateForward(`/placeorder/${product.ProductID}`);
  }

  // ── CAROUSEL (per product, since each card has its own slide index) ──

  nextSlide(product: any) {
    if (product.activeSlide < product.CarouselImages.length - 1) {
      product.activeSlide++;
    }
  }

  prevSlide(product: any) {
    if (product.activeSlide > 0) {
      product.activeSlide--;
    }
  }

  goToSlide(product: any, index: number) {
    product.activeSlide = index;
  }

  // ── HELPERS ──────────────────────────────────────────────

  discountPercent(product: any): number {
    if (!product.MRP || !product.SellingPrice || product.MRP <= product.SellingPrice) return 0;
    return Math.round((1 - (product.SellingPrice / product.MRP)) * 100);
  }

  // ── SHARE ────────────────────────────────────────────────

  async shareProduct(product: any) {
    const shareUrl = `https://app.mangalbhav.com/mangalmart`;

    if (navigator.share) {
      await navigator.share({
        title: product.ProductName,
        text: product.ShortDescription || product.ProductName,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      this.showToast('Product link copied 📋');
    }
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
}