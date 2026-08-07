import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from 'src/providers';

export interface ProductOrder {
  OrderID: number;
  OrderNo: string;
  FK_ProductID: number;
  ProductName: string;
  ProductImage?: string;
  Category?: string;
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
  AlternateMobile?: string;
  Email?: string;
  Address: string;
  Landmark?: string;
  City: string;
  State: string;
  Pincode: string;
  PaymentMethod: string;
  PaymentStatus: string;
  OrderStatus: string;
  OrderRemarks?: string;
  ExpectedDeliveryDate: string;
  DateAdded: string;
}

export interface OrderDispatch {
  OrderDispatchID?: number;
  FK_OrderID?: number;
  CourierName?: string;
  TrackingNumber?: string;
  AWBNumber?: string;
  TrackingURL?: string;
  DispatchDate?: string;
  DeliveredDate?: string;
  ExpectedDeliveryDate?: string;
  DispatchedBy?: string;
  VehicleNumber?: string;
  DispatchStatus?: string;
  Remarks?: string;
  DateAdded?: string;
}

export interface DispatchForm {
  CourierName: string;
  TrackingNumber: string;
  AWBNumber: string;
  DispatchDate: string;
  DispatchStatus: string;
  Remarks: string;
}

// ── A video the admin has picked locally but not yet uploaded ────
export interface PendingDispatchVideo {
  file: File;
  name: string;
  previewUrl?: string | null; // created LAZILY, only when the user taps to preview
}

export interface OrderDispatchMedia {
  OrderDispatchMediaID?: number;
  FK_OrderDispatchID?: number;
  MediaURL?: string;
  MediaType?: string; // 'VIDEO' | 'IMAGE'
  DisplayOrder?: number;
  Caption?: string;
  DateAdded?: string;
  UpdatedByUser?: number;
  previewUrl?: string | null; // fetched LAZILY on tap, not eagerly
  __expanded?: boolean;       // client-side only — whether the video player is currently shown
}
export interface OrderFeedback {
  OrderFeedbackID?: number;
  FK_OrderID?: number;
  CustomerName?: string;
  Rating?: number;
  ReviewTitle?: string;
  Review?: string;
  ImageURL?: string;
  IsApproved?: boolean;
  DateAdded?: string;
}

export interface FeedbackForm {
  Rating: number;
  ReviewTitle: string;
  Review: string;
}

@Component({
  selector: 'app-mangal-mart-order-list',
  templateUrl: './mangal-mart-order-list.component.html',
  styleUrls: ['./mangal-mart-order-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class MangalMartOrderListComponent implements OnInit {

  Orders: ProductOrder[] = [];
  isLoading = true;
  userDetails: any;
  isAdmin = false;
  readonly DISPATCH_VIDEO_BASE_URL = 'https://app.mangalbhav.com/assets/DispatchVideo/';
  // ── Order detail expand/collapse ──────────────────────────
  expandedOrderId: number | null = null;

  // ── Dispatch view panel ───────────────────────────────────
  dispatchMap: Record<number, OrderDispatch | null> = {};
  dispatchLoadingMap: Record<number, boolean> = {};
  dispatchOpenMap: Record<number, boolean> = {};

  // ── Dispatch form (admin only) ────────────────────────────
  dispatchFormOpenMap: Record<number, boolean> = {};
  dispatchFormMap: Record<number, DispatchForm> = {};
  dispatchSubmittingMap: Record<number, boolean> = {};

  // ── Dispatch videos — MANDATORY, min N required ───────────
  // Set to 3 instead of 2 if you want a stricter minimum.
  readonly MIN_DISPATCH_VIDEOS = 2;

  // Videos picked in the form but not yet uploaded (no preview shown by default)
  pendingDispatchVideosMap: Record<number, PendingDispatchVideo[]> = {};
  // Which pending-video squares are currently expanded/playing → key `${orderId}:${index}`
  expandedPendingVideoMap: Record<string, boolean> = {};
  isUploadingDispatchVideoMap: Record<number, boolean> = {};

  // Videos already saved on the server (view panel) — fetched lazily on tap
  dispatchMediaMap: Record<number, OrderDispatchMedia[]> = {};
  dispatchMediaLoadingMap: Record<string, boolean> = {}; // key `${orderId}:${mediaId}`

  // ── Feedback view panel ───────────────────────────────────
  feedbackMap: Record<number, OrderFeedback | null> = {};
  feedbackLoadingMap: Record<number, boolean> = {};
  feedbackViewOpenMap: Record<number, boolean> = {};

  // ── Feedback form (user only) ─────────────────────────────
  feedbackFormOpenMap: Record<number, boolean> = {};
  feedbackFormMap: Record<number, FeedbackForm> = {};
  feedbackSubmittingMap: Record<number, boolean> = {};
  // add near dispatchMediaLoadingMap
  expandedSavedVideoMap: Record<string, boolean> = {};
  readonly DISPATCH_STATUSES = [
    'PENDING', 'DISPATCHED', 'IN_TRANSIT',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED'
  ];

  readonly STAR_LABELS: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    public apinu: ApiNU,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private storage: Storage,
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
    this.isAdmin = (this.userDetails?.Role ?? this.userDetails?.UserRole ?? '').toUpperCase() === 'ADMIN';
    this.loadOrders();
  }

  // ── LOAD ORDERS ───────────────────────────────────────────

  loadOrders() {
    this.isLoading = true;
    const query = this.isAdmin
      ? `1=1 ORDER BY DateAdded DESC`
      : `UserID=${this.userDetails?.UserID ?? 0} ORDER BY DateAdded DESC`;

    this.apinu
      .postUrlData(`ProductOrderSelectByQuery?Query=${query}`, null)
      .subscribe({
        next: (res: any) => {
          this.Orders = res?.ProductOrderList ?? [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.showToast('Unable to load orders. Please try again.');
        }
      });
  }

  // ── ORDER DETAIL EXPAND / COLLAPSE ────────────────────────

  toggleExpand(orderId: number) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  isExpanded(orderId: number): boolean {
    return this.expandedOrderId === orderId;
  }

  // ── DISPATCH VIEW PANEL ───────────────────────────────────

  toggleDispatch(orderId: number) {
    if (this.dispatchOpenMap[orderId]) {
      this.dispatchOpenMap[orderId] = false;
      return;
    }
    this.dispatchOpenMap[orderId] = true;
    if (this.dispatchMap.hasOwnProperty(orderId)) return;

    this.dispatchLoadingMap[orderId] = true;
    this.apinu
      .postUrlData(`OrderDispatchSelectByQuery?Query=FK_OrderID=${orderId}`, null)
      .subscribe({
        next: (res: any) => {
          const dispatch = res?.OrderDispatchList?.[0] ?? null;
          this.dispatchMap[orderId] = dispatch;
          this.dispatchLoadingMap[orderId] = false;

          // If a dispatch already exists, fetch its media list (NOT the blobs — those load lazily on tap)
          if (dispatch?.OrderDispatchID) {
            this.loadDispatchMedia(orderId, dispatch.OrderDispatchID);
          }
        },
        error: () => {
          this.dispatchMap[orderId] = null;
          this.dispatchLoadingMap[orderId] = false;
          this.showToast('Unable to load dispatch details. Please try again.');
        }
      });
  }

  // ── DISPATCH MEDIA (VIDEOS) — VIEW SIDE ───────────────────
  // NOTE: uses "OrderDispatchMediaSelectByQuery" endpoint mirroring
  // "ProductImageSelectByQuery" used for the product gallery.
  // Only fetches the LIST here — actual video blobs are fetched lazily on tap.
  loadDispatchMedia(orderId: number, dispatchID: number) {
    this.apinu
      .postUrlData(
        `OrderDispatchMediaSelectByQuery?Query=FK_OrderDispatchID=${dispatchID} ORDER BY DisplayOrder ASC`,
        null
      )
      .subscribe({
        next: (res: any) => {
          const media: OrderDispatchMedia[] = (res?.OrderDispatchMediaList ?? []).map((m: any) => ({
            ...m,
            previewUrl: null
          }));
          this.dispatchMediaMap[orderId] = media;
        },
        error: (err: any) => console.error('OrderDispatchMediaSelectByQuery error:', err)
      });
  }

  // Tap on a saved-video square: fetch the blob only the first time, then toggle play/hide.

  isSavedVideoLoading(orderId: number, media: OrderDispatchMedia): boolean {
    return !!this.dispatchMediaLoadingMap[`${orderId}:${media.OrderDispatchMediaID}`];
  }

  toggleSavedDispatchVideo(orderId: number, media: OrderDispatchMedia) {
    const key = `${orderId}:${media.OrderDispatchMediaID}`;
  
    if (!media.previewUrl && media.MediaURL) {
      media.previewUrl = this.DISPATCH_VIDEO_BASE_URL + media.MediaURL;
    }
  
    this.expandedSavedVideoMap[key] = !this.expandedSavedVideoMap[key];
  }

  isSavedVideoExpanded(orderId: number, media: OrderDispatchMedia): boolean {
    return !!this.expandedSavedVideoMap[`${orderId}:${media.OrderDispatchMediaID}`];
  }


  // ── DISPATCH FORM (ADMIN) ─────────────────────────────────

  toggleDispatchForm(orderId: number) {
    if (this.dispatchFormOpenMap[orderId]) {
      this.dispatchFormOpenMap[orderId] = false;
      return;
    }
    this.dispatchFormOpenMap[orderId] = true;
    if (!this.dispatchFormMap[orderId]) {
      this.dispatchFormMap[orderId] = {
        CourierName: '', TrackingNumber: '', AWBNumber: '',
        DispatchDate: new Date().toISOString().split('T')[0],
        DispatchStatus: 'DISPATCHED', Remarks: ''
      };
    }
    if (!this.pendingDispatchVideosMap[orderId]) {
      this.pendingDispatchVideosMap[orderId] = [];
    }
  }

  // ── DISPATCH VIDEOS — MULTI PICK, PENDING UNTIL SUBMIT ────
  // (mirrors the Mangal Mart "Gallery Photos" pending pattern, but for videos)

  onDispatchVideosSelected(orderId: number, event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    if (!this.pendingDispatchVideosMap[orderId]) this.pendingDispatchVideosMap[orderId] = [];

    Array.from(files).forEach((file: File) => {
      this.pendingDispatchVideosMap[orderId].push({ file, name: file.name, previewUrl: null });
    });

    event.target.value = '';
  }

  removePendingDispatchVideo(orderId: number, index: number) {
    const item = this.pendingDispatchVideosMap[orderId]?.[index];
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    this.pendingDispatchVideosMap[orderId]?.splice(index, 1);

    // Rebuild expanded-state keys for this order since indices shift after removal
    const prefix = `${orderId}:`;
    const rebuilt: Record<string, boolean> = {};
    Object.keys(this.expandedPendingVideoMap).forEach(key => {
      if (!key.startsWith(prefix)) {
        rebuilt[key] = this.expandedPendingVideoMap[key];
        return;
      }
      const idx = Number(key.slice(prefix.length));
      if (idx < index) {
        rebuilt[key] = this.expandedPendingVideoMap[key];
      } else if (idx > index) {
        rebuilt[`${prefix}${idx - 1}`] = this.expandedPendingVideoMap[key];
      }
      // idx === index → this was the removed item, drop its key entirely
    });
    this.expandedPendingVideoMap = rebuilt;
  }

  // Tap on a pending-video square: create the object URL only the first time, then toggle play/hide.
  togglePendingDispatchVideo(orderId: number, index: number) {
    const key = `${orderId}:${index}`;
    const item = this.pendingDispatchVideosMap[orderId]?.[index];
    if (!item) return;

    if (this.expandedPendingVideoMap[key]) {
      this.expandedPendingVideoMap[key] = false;
      return;
    }
    if (!item.previewUrl) {
      item.previewUrl = URL.createObjectURL(item.file);
    }
    this.expandedPendingVideoMap[key] = true;
  }

  isPendingVideoExpanded(orderId: number, index: number): boolean {
    return !!this.expandedPendingVideoMap[`${orderId}:${index}`];
  }

  pendingVideoCount(orderId: number): number {
    return this.pendingDispatchVideosMap[orderId]?.length ?? 0;
  }

  async submitDispatch(order: ProductOrder) {
    const form = this.dispatchFormMap[order.OrderID];
    if (!form?.CourierName?.trim()) return this.showToast('Please enter courier name.');
    if (!form?.TrackingNumber?.trim()) return this.showToast('Please enter tracking number.');

    // ── Video is MANDATORY — minimum count required ──
    const videoCount = this.pendingVideoCount(order.OrderID);
    if (videoCount < this.MIN_DISPATCH_VIDEOS) {
      return this.showToast(
        `Please add at least ${this.MIN_DISPATCH_VIDEOS} dispatch video(s). Currently added: ${videoCount}.`
      );
    }

    const confirmed = await this.confirmAlert(
      'Confirm Dispatch',
      `Dispatch order <strong>${order.OrderNo}</strong> via <strong>${form.CourierName}</strong>?`
    );
    if (!confirmed) return;

    this.dispatchSubmittingMap[order.OrderID] = true;

    const payload: OrderDispatch = {
      FK_OrderID: order.OrderID,
      CourierName: form.CourierName.trim(),
      TrackingNumber: form.TrackingNumber.trim(),
      AWBNumber: form.AWBNumber?.trim() ?? '',
      DispatchDate: form.DispatchDate ? new Date(form.DispatchDate).toISOString() : new Date().toISOString(),
      DispatchStatus: form.DispatchStatus,
      Remarks: form.Remarks?.trim() ?? '',
      DateAdded: new Date().toISOString()
    };

    this.apinu.postUrlData('OrderDispatchInsert', payload).subscribe({
      next: async (res: any) => {
        if (res?.OrderDispatchID) {
          const dispatchID = res.OrderDispatchID;
          this.dispatchMap[order.OrderID] = { ...payload, OrderDispatchID: dispatchID };

          // Upload all pending videos + link them to this dispatch
          await this.uploadPendingDispatchVideos(order.OrderID, dispatchID);

          this.dispatchSubmittingMap[order.OrderID] = false;
          this.showToast('Order dispatched successfully! 🚚', 'success');

          this.dispatchFormOpenMap[order.OrderID] = false;
          this.dispatchOpenMap[order.OrderID] = true;
          delete this.dispatchFormMap[order.OrderID];
        } else {
          this.dispatchSubmittingMap[order.OrderID] = false;
          this.showToast('Unexpected response. Please check and retry.');
        }
      },
      error: () => {
        this.dispatchSubmittingMap[order.OrderID] = false;
        this.showToast('Failed to dispatch order. Please try again.', 'danger');
      }
    });
  }

  // Uploads each pending video file, then registers it via OrderDispatchMediaInsert.
  // NOTE: uses "OrderDispatchMediaInsert" endpoint provided by backend.
  private async uploadPendingDispatchVideos(orderId: number, dispatchID: number) {
    const pending = this.pendingDispatchVideosMap[orderId] ?? [];
    if (pending.length === 0) return;

    this.isUploadingDispatchVideoMap[orderId] = true;
    const savedMedia: OrderDispatchMedia[] = [];

    for (let i = 0; i < pending.length; i++) {
      const { file } = pending[i];
      try {
        const uploadRes: any = await this.api
          .uploadImage([file], 'DispatchVideo', 'dispatch', 'DispatchVideo')
          .toPromise();

        if (uploadRes?.Status === 'Success') {
          const media: OrderDispatchMedia = {
            FK_OrderDispatchID: dispatchID,
            MediaURL: uploadRes.FileName,
            MediaType: 'VIDEO',
            DisplayOrder: i + 1,
            Caption: '',
            DateAdded: new Date().toISOString(),
            UpdatedByUser: this.userDetails?.UserID ?? 0
          };
          const insertRes: any = await this.apinu.postUrlData('OrderDispatchMediaInsert', media).toPromise();
          if (insertRes?.OrderDispatchMediaID) {
            savedMedia.push({ ...media, OrderDispatchMediaID: insertRes.OrderDispatchMediaID, previewUrl: null });
          }
        }
      } catch (err) {
        console.error('Dispatch video upload/insert error:', err);
      }
    }

    // Clean up local object URLs and pending state
    pending.forEach(p => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
    this.pendingDispatchVideosMap[orderId] = [];
    this.expandedPendingVideoMap = Object.fromEntries(
      Object.entries(this.expandedPendingVideoMap).filter(([k]) => !k.startsWith(`${orderId}:`))
    );

    this.dispatchMediaMap[orderId] = [...(this.dispatchMediaMap[orderId] ?? []), ...savedMedia];
    this.isUploadingDispatchVideoMap[orderId] = false;
  }

  // ── FEEDBACK VIEW PANEL ───────────────────────────────────

  toggleFeedbackView(orderId: number) {
    if (this.feedbackViewOpenMap[orderId]) {
      this.feedbackViewOpenMap[orderId] = false;
      return;
    }
    this.feedbackViewOpenMap[orderId] = true;
    if (this.feedbackMap.hasOwnProperty(orderId)) return;

    this.feedbackLoadingMap[orderId] = true;
    this.apinu
      .postUrlData(`OrderFeedbackSelectByQuery?Query=FK_OrderID=${orderId}`, null)
      .subscribe({
        next: (res: any) => {
          this.feedbackMap[orderId] = res?.OrderFeedbackList?.[0] ?? null;
          this.feedbackLoadingMap[orderId] = false;
        },
        error: () => {
          this.feedbackMap[orderId] = null;
          this.feedbackLoadingMap[orderId] = false;
        }
      });
  }

  // ── FEEDBACK FORM (USER ONLY) ─────────────────────────────

  toggleFeedbackForm(orderId: number) {
    if (this.feedbackFormOpenMap[orderId]) {
      this.feedbackFormOpenMap[orderId] = false;
      return;
    }
    this.feedbackFormOpenMap[orderId] = true;
    if (!this.feedbackFormMap[orderId]) {
      this.feedbackFormMap[orderId] = { Rating: 0, ReviewTitle: '', Review: '' };
    }
  }

  setRating(orderId: number, star: number) {
    if (this.feedbackFormMap[orderId]) {
      this.feedbackFormMap[orderId].Rating = star;
    }
  }

  async submitFeedback(order: ProductOrder) {
    const form = this.feedbackFormMap[order.OrderID];
    if (!form?.Rating || form.Rating < 1) return this.showToast('Please select a star rating.');
    if (!form?.Review?.trim()) return this.showToast('Please write a review.');

    this.feedbackSubmittingMap[order.OrderID] = true;

    const payload: OrderFeedback = {
      FK_OrderID: order.OrderID,
      CustomerName: order.CustomerName,
      Rating: form.Rating,
      ReviewTitle: form.ReviewTitle?.trim() ?? '',
      Review: form.Review.trim(),
      ImageURL: '',
      IsApproved: false,
      DateAdded: new Date().toISOString()
    };

    this.apinu.postUrlData('OrderFeedbackInsert', payload).subscribe({
      next: (res: any) => {
        this.feedbackSubmittingMap[order.OrderID] = false;
        if (res?.OrderFeedbackID) {
          this.showToast('Thank you for your feedback! 🙏', 'success');
          // Cache so view panel shows it immediately
          this.feedbackMap[order.OrderID] = { ...payload, OrderFeedbackID: res.OrderFeedbackID };
          // Close form, open view panel
          this.feedbackFormOpenMap[order.OrderID] = false;
          this.feedbackViewOpenMap[order.OrderID] = true;
          delete this.feedbackFormMap[order.OrderID];
        } else {
          this.showToast('Unexpected response. Please try again.');
        }
      },
      error: () => {
        this.feedbackSubmittingMap[order.OrderID] = false;
        this.showToast('Failed to submit feedback. Please try again.', 'danger');
      }
    });
  }

  getStarArray(): number[] { return [1, 2, 3, 4, 5]; }

  hasFeedback(orderId: number): boolean {
    return !!this.feedbackMap[orderId];
  }

  // ── VIEW PRODUCT ──────────────────────────────────────────

  viewProduct() {
    this.routerCtrl.navigateForward('/mangalmart');
  }

  // ── STATUS HELPERS ────────────────────────────────────────

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'DISPATCHED':
      case 'SHIPPED': return 'status-shipped';
      case 'IN_TRANSIT': return 'status-transit';
      case 'OUT_FOR_DELIVERY': return 'status-out';
      case 'DELIVERED': return 'status-delivered';
      case 'RETURNED':
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'time-outline';
      case 'CONFIRMED': return 'checkmark-circle-outline';
      case 'DISPATCHED':
      case 'SHIPPED': return 'rocket-outline';
      case 'IN_TRANSIT': return 'git-branch-outline';
      case 'OUT_FOR_DELIVERY': return 'bicycle-outline';
      case 'DELIVERED': return 'bag-check-outline';
      case 'RETURNED': return 'return-down-back-outline';
      case 'CANCELLED': return 'close-circle-outline';
      default: return 'time-outline';
    }
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'Pending';
      case 'CONFIRMED': return 'Confirmed';
      case 'DISPATCHED': return 'Dispatched';
      case 'SHIPPED': return 'Shipped';
      case 'IN_TRANSIT': return 'In Transit';
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
      case 'DELIVERED': return 'Delivered';
      case 'RETURNED': return 'Returned';
      case 'CANCELLED': return 'Cancelled';
      default: return status ?? '—';
    }
  }

  // ── DATE & UTILS ──────────────────────────────────────────

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  todayISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ── NAVIGATION ────────────────────────────────────────────

  goHome() { this.routerCtrl.navigateRoot('/mangalmart'); }
  placeNewOrder() { this.routerCtrl.navigateForward('/mangalmart'); }

  // ── ALERT CONFIRM ─────────────────────────────────────────

  private async confirmAlert(header: string, message: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header, message,
        buttons: [
          { text: 'Cancel', role: 'cancel', handler: () => resolve(false) },
          { text: 'Confirm', handler: () => resolve(true) }
        ]
      });
      await alert.present();
    });
  }

  // ── TOAST ─────────────────────────────────────────────────

  async showToast(message: string, color = 'warning') {
    const toast = await this.toastCtrl.create({
      message, duration: 2400, position: 'bottom', cssClass: 'mangal-toast', color
    });
    await toast.present();
  }
}