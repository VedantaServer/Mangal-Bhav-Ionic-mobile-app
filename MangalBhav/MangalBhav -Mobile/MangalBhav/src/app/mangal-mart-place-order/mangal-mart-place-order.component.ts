import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute } from '@angular/router';
import { Api, ApiNU } from 'src/providers';
declare const fbq: any;
export interface ProductOrder {
  OrderID?: number;
  OrderNo: string;
  FK_ProductID: number;
  Quantity: number;
  UnitPrice: number;
  SubTotal: number;
  ShippingCharge: number;
  Discount: number;
  TaxAmount: number;
  GrandTotal: number;
  UserID: number;
  CustomerName: string;
  MobileNumber: string;
  AlternateMobile: string;
  Email: string;
  Address: string;
  Landmark: string;
  City: string;
  State: string;
  Pincode: string;
  PaymentMethod: string;
  PaymentStatus: string;
  OrderStatus: string;
  OrderRemarks: string;
  ExpectedDeliveryDate: Date;
  DateAdded: Date;
  DateModified: Date;
}

@Component({
  selector: 'app-mangal-mart-place-order',
  templateUrl: './mangal-mart-place-order.component.html',
  styleUrls: ['./mangal-mart-place-order.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class MangalMartPlaceOrderComponent implements OnInit {

  productId!: number;
  Product: any = null;
  isLoadingProduct = true;
  productMainImageUrl: string | null = null;

  userDetails: any;
  isLoggedIn = false;

  quantity = 1;

  FREE_SHIPPING_THRESHOLD = 499;
  FLAT_SHIPPING_CHARGE = 49;

  Order: ProductOrder = this.emptyOrder();

  isPlacingOrder = false;
  orderPlaced = false;
  placedOrderNo = '';
  placedOrderId = 0;

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    public apinu: ApiNU,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private storage: Storage,
  ) { }

  async ngOnInit() {
    this.productId = Number(this.route.snapshot.paramMap.get('productId')) || 0;

    this.userDetails = await this.storage.get('account');
    const loggedInFlag = await this.storage.get('IsUserLoggedIn');
    this.isLoggedIn = loggedInFlag === 'true' && !!this.userDetails?.UserID;

    this.prefillFromAccount();

    if (this.productId > 0) {
      this.loadProduct();
    } else {
      this.isLoadingProduct = false;
    }
  }

  private emptyOrder(): ProductOrder {
    return {
      OrderNo: '',
      FK_ProductID: 0,
      Quantity: 1,
      UnitPrice: 0,
      SubTotal: 0,
      ShippingCharge: 0,
      Discount: 0,
      TaxAmount: 0,
      GrandTotal: 0,
      UserID: 0,
      CustomerName: '',
      MobileNumber: '',
      AlternateMobile: '',
      Email: '',
      Address: '',
      Landmark: '',
      City: '',
      State: '',
      Pincode: '',
      PaymentMethod: 'COD',
      PaymentStatus: 'PENDING',
      OrderStatus: 'PENDING',
      OrderRemarks: '',
      ExpectedDeliveryDate: this.addDays(new Date(), 5),
      DateAdded: new Date(),
      DateModified: new Date()
    };
  }

  private prefillFromAccount() {
    if (!this.userDetails) return;

    this.Order.UserID = this.userDetails.UserID ?? 0;
    this.Order.CustomerName = this.userDetails.FullName ?? '';
    this.Order.MobileNumber = this.userDetails.LoginID ?? '';
    this.Order.Email = this.userDetails.Email ?? '';
  }

  // ── LOAD PRODUCT ─────────────────────────────────────────

  loadProduct() {
    this.isLoadingProduct = true;

    this.apinu
      .postUrlData(`ProductSelectByQuery?Query=ProductID=${this.productId}`, null)
      .subscribe({
        next: (res: any) => {
          this.Product = res?.ProductList?.[0] ?? null;
          this.isLoadingProduct = false;

          if (!this.Product) return;

          this.Order.FK_ProductID = this.Product.ProductID;
          this.Order.UnitPrice = this.Product.SellingPrice;

          this.recalculateTotals();
          this.loadMainImage();
        },
        error: () => {
          this.isLoadingProduct = false;
          this.showToast('Unable to load product details.');
        }
      });
  }

  loadMainImage() {
    if (!this.Product?.MainImage) return;

    this.api.getImage('DownloadImages', {
      imageName: this.Product.MainImage,
      imagePurpose: 'ProductImage'
    }).subscribe((blob: any) => {
      this.productMainImageUrl = URL.createObjectURL(blob);
    });
  }

  // ── QUANTITY ─────────────────────────────────────────────

  get maxQuantity(): number {
    const stock = this.Product?.StockQuantity;
    return (stock && stock > 0) ? stock : 10;
  }

  increaseQty() {
    if (this.quantity < this.maxQuantity) {
      this.quantity++;
      this.recalculateTotals();
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
      this.recalculateTotals();
    }
  }

  onQuantityChange() {
    if (!this.quantity || this.quantity < 1) this.quantity = 1;
    if (this.quantity > this.maxQuantity) this.quantity = this.maxQuantity;
    this.recalculateTotals();
  }

  // ── PRICING ──────────────────────────────────────────────

  recalculateTotals() {
    if (!this.Product) return;

    const unitPrice = this.Product.SellingPrice || 0;
    const mrp = this.Product.MRP || unitPrice;

    this.Order.Quantity = this.quantity;
    this.Order.UnitPrice = unitPrice;
    this.Order.SubTotal = +(unitPrice * this.quantity).toFixed(2);
    this.Order.ShippingCharge = this.Order.SubTotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.FLAT_SHIPPING_CHARGE;
    this.Order.Discount = +((mrp - unitPrice) * this.quantity).toFixed(2);
    this.Order.TaxAmount = 0;
    this.Order.GrandTotal = +(this.Order.SubTotal + this.Order.ShippingCharge + this.Order.TaxAmount).toFixed(2);
  }

  // ── ORDER NUMBER ─────────────────────────────────────────

  private generateOrderNo(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `MM${y}${m}${d}${rand}`;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // ── VALIDATION ───────────────────────────────────────────

  private validate(): string | null {
    if (!this.Order.CustomerName?.trim()) return 'Please enter your name';
    if (!this.Order.MobileNumber?.trim() || this.Order.MobileNumber.trim().length !== 10)
      return 'Please enter a valid 10-digit mobile number';
    if (!this.Order.Address?.trim()) return 'Please enter your delivery address';
    if (!this.Order.City?.trim()) return 'Please enter your city';
    if (!this.Order.State?.trim()) return 'Please enter your state';
    if (!this.Order.Pincode?.trim() || this.Order.Pincode.trim().length !== 6)
      return 'Please enter a valid 6-digit pincode';
    return null;
  }

  // ── SUBMIT ───────────────────────────────────────────────

  async submitOrder() {
    const validationError = this.validate();
    if (validationError) {
      return this.showToast(validationError, 'warning');
    }

    this.isPlacingOrder = true;

    if (this.isLoggedIn && this.Order.UserID > 0) {
      // Already logged in → skip account creation, go straight to order
      this.finalizeOrder();
    } else {
      this.registerGuestThenOrder();
    }
  }

  /** Not logged in: check if mobile already has an account, else create one, then log in */
  private registerGuestThenOrder() {
    const mobile = this.Order.MobileNumber.trim();

    this.apinu.postUrlData(`UsersNUSelectByQuery?Query=LoginID=${mobile}`, null).subscribe({
      next: (res: any) => {
        if (res?.UserList?.length > 0) {
          // Number already registered — log them in instead of creating a duplicate
          this.loginAndFinalize(mobile);
        } else {
          this.createGuestUser(mobile);
        }
      },
      error: () => {
        this.isPlacingOrder = false;
        this.showToast('Something went wrong. Please try again.', 'danger');
      }
    });
  }

  private createGuestUser(mobile: string) {
    const userBody = {
      TenantID: Number(1),
      Role: 'BHAKT', // Yajman
      LoginID: String(mobile),
      PasswordHash: String('Pass@123'),
      IsLocked: Boolean(0),
      Status: String('ACTIVE'),
      LastLoginAt: new Date(),
      PasswordChangedAt: new Date(),
      DateAdded: new Date(),
      DateModified: new Date(),
      UpdatedByUser: String(mobile)
    };

    this.apinu.postUrlData('UsersInsert', userBody).subscribe({
      next: (res: any) => {
        const newUserID = res?.UserID;

        const profileBody = {
          profileID: 0, tenantID: 1, userID: newUserID,
          fullName: this.Order.CustomerName || '',
          dOB: new Date().toISOString(),
          gender: '',
          phoneNumber: String(mobile),
          email: this.Order.Email || '',
          experienceYears: 0,
          bio: '',
          languages: '',
          basePrice: 0,
          profilePhotoUrl: '',
          verificationStatus: 'APPROVED',
          AddressLine1: this.Order.Address || '',
          AddressLine2: this.Order.Landmark || '',
          City: this.Order.City || '',
          State: this.Order.State || '',
          PinCode: this.Order.Pincode || '',
          Lat: '', Longitude: '',
          isActive: Boolean(1),
          Specializations: '', Category: '',
          dateAdded: new Date().toISOString(),
          dateModified: new Date().toISOString(),
          updatedByUser: ''
        };

        this.apinu.postUrlData('ProfilesInsert', profileBody).subscribe({
          next: () => this.loginAndFinalize(mobile),
          error: () => this.loginAndFinalize(mobile) // profile failure shouldn't block the order
        });
      },
      error: () => {
        this.isPlacingOrder = false;
        this.showToast('Unable to create your account. Please try again.', 'danger');
      }
    });
  }

  private loginAndFinalize(mobile: string) {
    this.apinu.postUrlData(`VedantaLogin?UserName=${mobile}`, null).subscribe({
      next: async (res: any) => {
        if (res?.UserID) {
          await this.storage.set('account', res);
          await this.storage.set('IsUserLoggedIn', 'true');
          await this.storage.set('Language', res.Languages);

          this.userDetails = res;
          this.isLoggedIn = true;
          this.Order.UserID = res.UserID;

          this.finalizeOrder();
        } else {
          this.isPlacingOrder = false;
          this.showToast('Login failed. Please try again.', 'danger');
        }
      },
      error: () => {
        this.isPlacingOrder = false;
        this.showToast('Login failed. Please try again.', 'danger');
      }
    });
  }


  ionViewDidEnter() {
    if (typeof fbq === 'function') {
      fbq('track', 'Lead');
    }
  }



  private finalizeOrder() {
    this.Order.OrderNo = this.generateOrderNo();
    this.Order.DateAdded = new Date();
    this.Order.DateModified = new Date();
    this.Order.PaymentStatus = 'PENDING';
    this.Order.OrderStatus = 'PENDING';

    this.apinu.postUrlData('ProductOrderInsert', this.Order).subscribe({
      next: (res: any) => {
        this.isPlacingOrder = false;
        this.orderPlaced = true;
        this.placedOrderId = res?.OrderID ?? 0;
        this.placedOrderNo = this.Order.OrderNo;
        this.showToast('Order placed successfully 🙏', 'success');
      },
      error: () => {
        this.isPlacingOrder = false;
        this.showToast('Something went wrong placing your order. Please try again.', 'danger');
      }
    });
  }

  goBackToMart() {
    // Redirect to default route now that the user is logged in
    this.routerCtrl.navigateRoot('/tabs/tab1');
  }

  // ── TOAST ────────────────────────────────────────────────

  async showToast(message: string, color = 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      position: 'bottom',
      cssClass: 'mangal-toast',
      color,
    });
    await toast.present();
  }
}