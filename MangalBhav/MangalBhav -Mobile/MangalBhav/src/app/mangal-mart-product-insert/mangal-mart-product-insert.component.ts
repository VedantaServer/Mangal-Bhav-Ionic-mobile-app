import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, ApiNU } from 'src/providers';

@Component({
  selector: 'app-mangal-mart-product-insert',
  templateUrl: './mangal-mart-product-insert.component.html',
  styleUrls: ['./mangal-mart-product-insert.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class MangalMartProductInsertComponent implements OnInit {

  isEditMode = false;

  categories = [
    'Pooja Samagri',
    'Idols & Murtis',
    'Incense & Dhoop',
    'Books & Scriptures',
    'Clothing',
    'Jewellery',
    'Home Decor',
    'Other'
  ];

  Product: any = this.emptyProduct();

  // ── List / search / paging ──────────────────────────────────
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  productSearchQuery = '';
  showAddProductForm = false;
  isSubmittingProduct = false;
  private infiniteScrollEvent: any = null;
  pageNumber = 1;
  pageSize = 10;
  query = 'tenantID=1 ORDER BY DateAdded DESC';
  private searchTimeout: any;

  // ── Main image ───────────────────────────────────────────────
  selectedMainImageFile: File | null = null;
  mainImagePreview: string | null = null;
  isUploadingMainImage = false;

  // ── Gallery images ───────────────────────────────────────────
  // existing = already saved (ProductImageID > 0), pending = newly picked, not yet uploaded
  existingGalleryImages: any[] = [];   // { ProductImageID, ImageURL, previewUrl }
  pendingGalleryFiles: { file: File, previewUrl: string }[] = [];
  isUploadingGallery = false;

  constructor(
    public api: Api,
    public apinu: ApiNU,
    public routerCtrl: NavController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  private emptyProduct() {
    return {
      TenantID: Number(1),
      ProductID: -1,
      ProductName: '',
      ShortDescription: '',
      Description: '',
      Category: '',
      SKU: '',
      MRP: null,
      SellingPrice: null,
      DiscountPercentage: null,
      Weight: null,
      Length: null,
      Width: null,
      Height: null,
      StockQuantity: null,
      MainImage: '',
      IsActive: true,
      DateAdded: new Date(),
      DateModified: new Date()
    };
  }

  // ── Load list ────────────────────────────────────────────────
  // NOTE: assumes a "ProductSelectByQueryPaging" SP/endpoint mirroring
  // "MandirSelectByQueryPaging" — returns { ProductList: [...] }
  loadProducts(loadMore = false) {
    const body = {
      tenantID: 1,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      query: this.query.replace(/\s+/g, ' ').trim()
    };

    this.apinu.postUrlData('ProductSelectByQuery?Query=1=1', null).subscribe({
      next: (res: any) => {
        const newProducts = (res?.ProductList ?? []).map((p: any) => ({
          ...p,
          MainImageUrl: null
        }));

        this.allProducts = loadMore ? [...this.allProducts, ...newProducts] : newProducts;
        this.filteredProducts = [...this.allProducts];

        newProducts.forEach((p: any) => this.loadProductMainImage(p));

        if (this.infiniteScrollEvent) {
          this.infiniteScrollEvent.target.complete();
          if (newProducts.length < this.pageSize) {
            this.infiniteScrollEvent.target.disabled = true;
          }
          this.infiniteScrollEvent = null;
        }
      },
      error: (err: any) => {
        console.error('loadProducts error', err);
        if (this.infiniteScrollEvent) {
          this.infiniteScrollEvent.target.complete();
          this.infiniteScrollEvent = null;
        }
      }
    });
  }

  onInfiniteScroll(event: any) {
    this.infiniteScrollEvent = event;
    this.pageNumber++;
    this.loadProducts(true);
  }

  onProductSearch() {
    clearTimeout(this.searchTimeout);
    const q = this.productSearchQuery?.trim();

    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 1;
      this.allProducts = [];
      this.filteredProducts = [];
      this.infiniteScrollEvent = null;

      this.query = q
        ? `tenantID=1 AND (ProductName LIKE '%${q}%' OR SKU LIKE '%${q}%' OR Category LIKE '%${q}%') ORDER BY DateAdded DESC`
        : `tenantID=1 ORDER BY DateAdded DESC`;

      this.loadProducts();
    }, 500);
  }

  loadProductMainImage(product: any) {
    if (!product.MainImage) return;
    this.api.getImage('DownloadImages', { imageName: product.MainImage, imagePurpose: 'ProductImage' }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          product.MainImageUrl = URL.createObjectURL(blob);
          this.filteredProducts = [...this.filteredProducts];
        }
      },
      error: (err) => console.error('Error loading product image:', err)
    });
  }

  // ── Modal open/close ─────────────────────────────────────────
  openAddProduct() {
    this.isEditMode = false;
    this.resetProductForm();
    this.showAddProductForm = true;
  }

  openEditProduct(p: any, event: Event) {
    event.stopPropagation();
    this.isEditMode = true;

    this.Product = {
      TenantID: p.TenantID ?? 1,
      ProductID: p.ProductID,
      ProductName: p.ProductName ?? '',
      ShortDescription: p.ShortDescription ?? '',
      Description: p.Description ?? '',
      Category: p.Category ?? '',
      SKU: p.SKU ?? '',
      MRP: p.MRP ?? null,
      SellingPrice: p.SellingPrice ?? null,
      DiscountPercentage: p.DiscountPercentage ?? null,
      Weight: p.Weight ?? null,
      Length: p.Length ?? null,
      Width: p.Width ?? null,
      Height: p.Height ?? null,
      StockQuantity: p.StockQuantity ?? null,
      MainImage: p.MainImage ?? '',
      IsActive: p.IsActive ?? true,
      DateAdded: new Date(p.DateAdded),
      DateModified: new Date()
    };

    const existing = this.filteredProducts.find(x => x.ProductID === p.ProductID);
    this.mainImagePreview = existing?.MainImageUrl ?? null;
    this.selectedMainImageFile = null;

    this.pendingGalleryFiles = [];
    this.existingGalleryImages = [];
    this.loadGalleryImages();

    this.showAddProductForm = true;
  }

  closeAddProduct() {
    this.showAddProductForm = false;
    this.pageNumber = 1;
    this.allProducts = [];
    this.filteredProducts = [];
    this.infiniteScrollEvent = null;
    this.query = 'tenantID=1 ORDER BY DateAdded DESC';
    this.loadProducts();
  }

  resetProductForm() {
    this.Product = this.emptyProduct();
    this.selectedMainImageFile = null;
    this.mainImagePreview = null;
    this.pendingGalleryFiles = [];
    this.existingGalleryImages = [];
  }

  // ── Main image ───────────────────────────────────────────────
  onMainImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    this.selectedMainImageFile = file;
    this.Product.MainImage = '';
    const reader = new FileReader();
    reader.onload = (e: any) => (this.mainImagePreview = e.target.result);
    reader.readAsDataURL(file);
  }

  uploadMainImage() {
    if (!this.selectedMainImageFile) return;
    this.isUploadingMainImage = true;
    this.api.uploadImage([this.selectedMainImageFile], 'ProductImage', 'product', 'ProductImage').subscribe({
      next: (res: any) => {
        this.isUploadingMainImage = false;
        if (res?.Status === 'Success') {
          this.Product.MainImage = res.FileName;
          this.selectedMainImageFile = null;
          this.showToast('Main photo uploaded ✅', 'success');
        } else {
          this.showToast('Main photo upload failed', 'danger');
        }
      },
      error: () => {
        this.isUploadingMainImage = false;
        this.showToast('Main photo upload error', 'danger');
      }
    });
  }

  // ── Gallery images ───────────────────────────────────────────
  // NOTE: assumes "ProductImageSelectByQuery" / "ProductImageDelete" endpoints
  // mirroring "EntitySocialMediaSelectByQuery" / delete pattern used for Mandir.
  loadGalleryImages() {
    if (!this.Product.ProductID || this.Product.ProductID === -1) return;

    this.apinu.postUrlData(
      `ProductImageSelectByQuery?Query=FK_ProductID=${this.Product.ProductID} ORDER BY DisplayOrder ASC`,
      null
    ).subscribe((res: any) => {
      const images = res?.ProductImageList ?? [];
      this.existingGalleryImages = images.map((img: any) => ({ ...img, previewUrl: null }));
      this.existingGalleryImages.forEach((img: any) => this.loadGalleryImageBlob(img));
    });
  }

  private loadGalleryImageBlob(img: any) {
    if (!img.ImageURL) return;
    this.api.getImage('DownloadImages', { imageName: img.ImageURL, imagePurpose: 'ProductImage' }).subscribe({
      next: (blob: any) => {
        if (blob?.type?.startsWith('image/')) {
          img.previewUrl = URL.createObjectURL(blob);
          this.existingGalleryImages = [...this.existingGalleryImages];
        }
      },
      error: (err) => console.error('Error loading gallery image:', err)
    });
  }

  onGalleryImagesSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pendingGalleryFiles.push({ file, previewUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    });

    event.target.value = '';
  }

  removePendingGalleryImage(index: number) {
    this.pendingGalleryFiles.splice(index, 1);
  }

  deleteExistingGalleryImage(img: any) {
    if (!confirm('Remove this photo?')) return;
    this.apinu.postUrlData('ProductImageDelete', img).subscribe({
      next: () => {
        this.existingGalleryImages = this.existingGalleryImages.filter(x => x.ProductImageID !== img.ProductImageID);
        this.showToast('Photo removed', 'success');
      },
      error: () => this.showToast('Unable to remove photo', 'danger')
    });
  }

  // ── Submit (Insert OR Update) ────────────────────────────────
  async submitProduct() {
    if (!this.Product.ProductName?.trim())
      return this.showToast('Please enter the product name 🛍', 'warning');
    if (!this.Product.SKU?.trim())
      return this.showToast('Please enter the SKU', 'warning');
    if (this.Product.MRP === null || this.Product.MRP === '')
      return this.showToast('Please enter the MRP', 'warning');
    if (this.Product.SellingPrice === null || this.Product.SellingPrice === '')
      return this.showToast('Please enter the selling price', 'warning');
    if (this.selectedMainImageFile && !this.Product.MainImage)
      return this.showToast('Please upload the main photo first ⬆', 'warning');

    this.isSubmittingProduct = true;
    this.Product.DateModified = new Date();

    const endpoint = this.isEditMode ? 'ProductUpdate' : 'ProductInsert';
    const successMsg = this.isEditMode ? 'Product updated successfully 🙏' : 'Product added successfully 🙏';

    this.apinu.postUrlData(endpoint, this.Product).subscribe({
      next: async (res: any) => {
        const productID = this.isEditMode ? this.Product.ProductID : res?.ProductID;

        if (this.pendingGalleryFiles.length > 0) {
          await this.uploadPendingGalleryImages(productID);
        }

        this.isSubmittingProduct = false;
        this.closeAddProduct();
        await this.showToast(successMsg, 'success');
      },
      error: async () => {
        this.isSubmittingProduct = false;
        await this.showToast('Something went wrong. Please try again.', 'danger');
      }
    });
  }

  private async uploadPendingGalleryImages(productID: number) {
    this.isUploadingGallery = true;
    const startOrder = this.existingGalleryImages.length;

    for (let i = 0; i < this.pendingGalleryFiles.length; i++) {
      const { file } = this.pendingGalleryFiles[i];
      try {
        const uploadRes: any = await this.api
          .uploadImage([file], 'ProductImage', 'product', 'ProductImage')
          .toPromise();

        if (uploadRes?.Status === 'Success') {
          const productImage = {
            ProductImageID: -1,
            FK_ProductID: productID,
            ImageURL: uploadRes.FileName,
            DisplayOrder: startOrder + i + 1,
            DateAdded: new Date()
          };
          await this.apinu.postUrlData('ProductImageInsert', productImage).toPromise();
        }
      } catch (err) {
        console.error('Gallery image upload error:', err);
      }
    }

    this.pendingGalleryFiles = [];
    this.isUploadingGallery = false;
  }

  // ── Delete product ───────────────────────────────────────────
  // NOTE: assumes "ProductDelete" endpoint mirroring "MandirDelete"
  deleteProduct(item: any, event: Event) {
    event.stopPropagation();
    if (!confirm(`Delete "${item.ProductName}"?`)) return;

    this.apinu.postUrlData(
      `ProductDelete?productID=${item.ProductID}&tenantID=${item.TenantID}`,
      null
    ).subscribe({
      next: () => {
        this.showToast('Product deleted successfully.', 'success');
        this.loadProducts();
      },
      error: () => this.showToast('Unable to delete product.', 'danger')
    });
  }

  async showToast(message: string, color = 'primary') {
    const toast = await this.toastController.create({ message, duration: 3000, color, position: 'top' });
    toast.present();
  }
}