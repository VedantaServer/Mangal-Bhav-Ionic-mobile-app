import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Api, ApiNU } from 'src/providers';
import { firstValueFrom } from 'rxjs';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';

interface FeedItem {
  FeedID: number;
  Title: string;
  Description: string;
  MediaType: string;
  MediaURL: string;
  ThumbnailURL: string;
  PublishDate: string;
  DateAdded: string;
  UserName: string;
  UserPhoto: string;
  FeedCategory: string;
  Location: string;
  SourceTable: string;
  SourceID?: number;

  // ── Engagement ──
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewCount?: number;
  isLiked?: boolean;
  myFeedLikeID?: number;
  isLikeInFlight?: boolean;
  hasBeenViewed?: boolean;
}

@Component({
  selector: 'app-feed-details',
  templateUrl: './feed-details.component.html',
  styleUrls: ['./feed-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class FeedDetailsComponent implements OnInit {

  userDetails: any;
  feedID = 0;
  item: FeedItem | null = null;
  userPhotoUrl: string | null = null;
  loading = true;
  notFound = false;
  brokenMedia = false;

  // ── Share preview ──────────────────────────────────────
  showSharePreview = false;
  sharePreviewImageUrl: string | null = null;
  isPreparingShare = false;
  private pendingShareItem: FeedItem | null = null;
  private pendingShareText = '';

  imgBaseUrl = 'https://app.mangalbhav.com/assets';
  private readonly shareLinkBaseUrl = 'https://app.mangalbhav.com';

  // ── Comments ─────────────────────────────────────────
  commentsList: any[] = [];
  commentsLoading = false;
  newCommentText = '';
  isSubmittingComment = false;

  // ── Toast ──────────────────────────────────────────────
  toastVisible = false;
  toastIcon = '🙏';
  toastMessage = '';
  private toastTimer: any;

  @ViewChild('commentInput') commentInput?: ElementRef<HTMLInputElement>;

  constructor(
    public api: Api,
    public apinu: ApiNU, public routerCtrl: NavController,
    private route: ActivatedRoute,
    private location: Location,
    private storage: Storage,
    private cdr: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');

    this.feedID = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.feedID) {
      this.notFound = true;
      this.loading = false;
      return;
    }
    this.loadFeed();
  }

  goBack() { this.location.back(); }

  focusCommentInput() {
    this.commentInput?.nativeElement?.focus();
  }

  showToast(icon: string, message: string) {
    this.toastIcon = icon;
    this.toastMessage = message;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3000);
  }

  // ══════════════════════════════════════════════════════
  // LOAD FEED ITEM
  // ══════════════════════════════════════════════════════

  async loadFeed() {
    this.loading = true;
    this.notFound = false;
    try {
      const query = `FeedID=${this.feedID} AND IsActive=1 AND IsDeleted=0`;
      const res: any = await firstValueFrom(
        this.apinu.postUrlData(`FeedSelectByQuery?Query=${encodeURIComponent(query)}`, null)
      );
      const parsed = typeof res === 'string' ? JSON.parse(res) : res;
      const list: FeedItem[] = parsed?.FeedList || [];

      if (!list.length) {
        this.notFound = true;
        return;
      }

      this.item = list[0];
      this.loadEngagementCounts();
      this.loadComments();
      this.recordView();
      this.loadUserPhoto();          // ← new
    } catch (e) {
      console.error('loadFeed failed:', e);
      this.notFound = true;
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private loadUserPhoto() {
    if (!this.item?.UserPhoto) return;
    this.api.getImage('DownloadImages', {
      imageName: this.item.UserPhoto, imagePurpose: 'ProfilePhoto'
    }).subscribe({
      next: (blob: any) => {
        if (!blob?.type?.startsWith('image/')) return;
        this.userPhotoUrl = URL.createObjectURL(blob);
        this.cdr.markForCheck();
      },
      error: () => { /* leave initials fallback */ }
    });
  }


  getSourcePageLink(item: FeedItem): string {

    switch ((item.SourceTable || '').trim()) {
      case 'Profile':
        return `/open-find-pandit/${item.SourceID ?? ''}`;
      case 'Mandir':
        return `/mandirfulldetails/${item.SourceID ?? ''}`;
      case 'Service':
      case 'Booking':
        return this.userDetails?.Role === 'BHAKT' ? '/loggedin-home' : '/tabs/tab3';
      case 'Feed':
      default:
        return '';   // plain feed posts have nowhere else to go
    }
  }

  getSourceLabel(item: FeedItem): string {
    switch ((item.SourceTable || '').trim()) {
      case 'Profile': return 'पंडित प्रोफ़ाइल देखें';
      case 'Mandir': return 'मंदिर देखें';
      case 'Service':
      case 'Booking': return 'सेवा देखें';
      default: return '';
    }
  }


  /** Loads the current user's profile photo via the DownloadImages API and
 * resolves to a data URL. Resolves to null if unavailable. */
  private loadUserProfilePhotoDataUrl(): Promise<string | null> {
    return new Promise((resolve) => {
      const photoFileName = this.userDetails?.ProfilePhoto || this.userDetails?.ProfilePhotoUrl;
      if (!photoFileName) { resolve(null); return; }

      this.api.getImage('DownloadImages', {
        imageName: photoFileName, imagePurpose: 'ProfilePhoto'
      }).subscribe({
        next: (blob: any) => {
          if (!blob?.type?.startsWith('image/')) { resolve(null); return; }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        },
        error: () => resolve(null)
      });
    });
  }

  /** Draws the base image onto a canvas, then overlays the sharing user's
   * profile photo as a circular avatar. `position` picks the corner,
   * `sizeRatio` controls avatar size as a fraction of the base image width. */
  // private async addUserPhotoOverlay(
  //   baseImageDataUrl: string,
  //   position: 'bottom-left' | 'bottom-right' = 'bottom-left',
  //   sizeRatio: number = 0.09
  // ): Promise<string> {
  //   const userPhotoDataUrl = await this.loadUserProfilePhotoDataUrl();
  //   if (!userPhotoDataUrl) return baseImageDataUrl; // nothing to overlay, share as-is

  //   const loadImage = (src: string): Promise<HTMLImageElement> => {
  //     return new Promise((resolve, reject) => {
  //       const img = new Image();
  //       img.onload = () => resolve(img);
  //       img.onerror = reject;
  //       img.src = src;
  //     });
  //   };

  //   try {
  //     const [baseImg, userImg] = await Promise.all([
  //       loadImage(baseImageDataUrl),
  //       loadImage(userPhotoDataUrl)
  //     ]);

  //     const canvas = document.createElement('canvas');
  //     canvas.width = baseImg.width;
  //     canvas.height = baseImg.height;
  //     const ctx = canvas.getContext('2d')!;

  //     ctx.drawImage(baseImg, 0, 0);

  //     const avatarSize = Math.round(baseImg.width * sizeRatio);
  //     const margin = Math.round(baseImg.width * 0.03);
  //     const cx = position === 'bottom-right'
  //       ? baseImg.width - margin - avatarSize / 2
  //       : margin + avatarSize / 2;
  //     const cy = baseImg.height - margin - avatarSize / 2;

  //     ctx.save();
  //     ctx.beginPath();
  //     ctx.arc(cx, cy, avatarSize / 2 + 4, 0, Math.PI * 2);
  //     ctx.fillStyle = '#ffffff';
  //     ctx.fill();
  //     ctx.restore();

  //     ctx.save();
  //     ctx.beginPath();
  //     ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
  //     ctx.closePath();
  //     ctx.clip();

  //     const srcSize = Math.min(userImg.width, userImg.height);
  //     const srcX = (userImg.width - srcSize) / 2;
  //     const srcY = (userImg.height - srcSize) / 2;
  //     ctx.drawImage(
  //       userImg,
  //       srcX, srcY, srcSize, srcSize,
  //       cx - avatarSize / 2, cy - avatarSize / 2, avatarSize, avatarSize
  //     );
  //     ctx.restore();

  //     return canvas.toDataURL('image/png');
  //   } catch (e) {
  //     console.error('addUserPhotoOverlay failed:', e);
  //     return baseImageDataUrl;
  //   }
  // }



  /** Draws the base image onto a canvas, then overlays the sharing user's
   * profile photo as a circular avatar plus their name alongside it.
   * `position` picks the corner, `sizeRatio` controls avatar size as a
   * fraction of the base image width, `bottomOffsetRatio` controls how far
   * up from the very bottom edge the whole overlay sits (smaller = lower). */
  // private async addUserPhotoOverlay(
  //   baseImageDataUrl: string,
  //   position: 'bottom-left' | 'bottom-right' = 'bottom-left',
  //   sizeRatio: number = 0.09,
  //   bottomOffsetRatio: number = 0.015   // was effectively 0.03 via `margin` below — smaller pushes it lower
  // ): Promise<string> {
  //   const userPhotoDataUrl = await this.loadUserProfilePhotoDataUrl();
  //   const userName = this.userDetails?.Name || this.userDetails?.FullName || '';

  //   if (!userPhotoDataUrl && !userName) return baseImageDataUrl; // nothing to overlay, share as-is

  //   const loadImage = (src: string): Promise<HTMLImageElement> => {
  //     return new Promise((resolve, reject) => {
  //       const img = new Image();
  //       img.onload = () => resolve(img);
  //       img.onerror = reject;
  //       img.src = src;
  //     });
  //   };

  //   try {
  //     const baseImg = await loadImage(baseImageDataUrl);
  //     const userImg = userPhotoDataUrl ? await loadImage(userPhotoDataUrl) : null;

  //     const canvas = document.createElement('canvas');
  //     canvas.width = baseImg.width;
  //     canvas.height = baseImg.height;
  //     const ctx = canvas.getContext('2d')!;

  //     ctx.drawImage(baseImg, 0, 0);

  //     const avatarSize = Math.round(baseImg.width * sizeRatio);
  //     const sideMargin = Math.round(baseImg.width * 0.03);
  //     const bottomMargin = Math.round(baseImg.width * bottomOffsetRatio);

  //     const cx = position === 'bottom-right'
  //       ? baseImg.width - sideMargin - avatarSize / 2
  //       : sideMargin + avatarSize / 2;
  //     const cy = baseImg.height - bottomMargin - avatarSize / 2;

  //     // ── Avatar circle (white ring behind it) ──
  //     if (userImg) {
  //       ctx.save();
  //       ctx.beginPath();
  //       ctx.arc(cx, cy, avatarSize / 2 + 4, 0, Math.PI * 2);
  //       ctx.fillStyle = '#ffffff';
  //       ctx.fill();
  //       ctx.restore();

  //       ctx.save();
  //       ctx.beginPath();
  //       ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
  //       ctx.closePath();
  //       ctx.clip();

  //       const srcSize = Math.min(userImg.width, userImg.height);
  //       const srcX = (userImg.width - srcSize) / 2;
  //       const srcY = (userImg.height - srcSize) / 2;
  //       ctx.drawImage(
  //         userImg,
  //         srcX, srcY, srcSize, srcSize,
  //         cx - avatarSize / 2, cy - avatarSize / 2, avatarSize, avatarSize
  //       );
  //       ctx.restore();
  //     }

  //     // ── Name label next to the avatar ──
  //     if (userName) {
  //       const fontSize = Math.round(avatarSize * 0.42);
  //       ctx.font = `600 ${fontSize}px sans-serif`;
  //       const textMetrics = ctx.measureText(userName);
  //       const textPadding = Math.round(avatarSize * 0.22);
  //       const pillHeight = Math.round(avatarSize * 0.62);
  //       const pillWidth = textMetrics.width + textPadding * 2;

  //       // Pill sits just outside the avatar, on the side away from the image edge
  //       const pillX = position === 'bottom-right'
  //         ? cx - avatarSize / 2 - 6 - pillWidth   // grows leftward from avatar
  //         : cx + avatarSize / 2 + 6;              // grows rightward from avatar
  //       const pillY = cy - pillHeight / 2;

  //       ctx.save();
  //       ctx.beginPath();
  //       const radius = pillHeight / 2;
  //       ctx.moveTo(pillX + radius, pillY);
  //       ctx.arcTo(pillX + pillWidth, pillY, pillX + pillWidth, pillY + pillHeight, radius);
  //       ctx.arcTo(pillX + pillWidth, pillY + pillHeight, pillX, pillY + pillHeight, radius);
  //       ctx.arcTo(pillX, pillY + pillHeight, pillX, pillY, radius);
  //       ctx.arcTo(pillX, pillY, pillX + pillWidth, pillY, radius);
  //       ctx.closePath();
  //       ctx.fillStyle = 'rgba(0,0,0,0.55)';
  //       ctx.fill();
  //       ctx.restore();

  //       ctx.save();
  //       ctx.fillStyle = '#ffffff';
  //       ctx.textBaseline = 'middle';
  //       ctx.font = `600 ${fontSize}px sans-serif`;
  //       ctx.fillText(userName, pillX + textPadding, pillY + pillHeight / 2);
  //       ctx.restore();
  //     }

  //     return canvas.toDataURL('image/png');
  //   } catch (e) {
  //     console.error('addUserPhotoOverlay failed:', e);
  //     return baseImageDataUrl;
  //   }
  // }



  private async addUserPhotoOverlay(
    baseImageDataUrl: string,
    footerHeightRatio: number = 0.46
  ): Promise<string> {
    const userPhotoDataUrl = await this.loadUserProfilePhotoDataUrl();
    const userName = this.userDetails?.Name || this.userDetails?.FullName || '';

    const loadImage = (src: string): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    };

    try {
      const baseImg = await loadImage(baseImageDataUrl);
      if (!baseImg) return baseImageDataUrl;

      const [userImg, logoImg] = await Promise.all([
        userPhotoDataUrl ? loadImage(userPhotoDataUrl) : Promise.resolve(null),
        loadImage('assets/mangalbhavlogo1.jpeg')
      ]);

      const footerHeight = Math.round(baseImg.width * footerHeightRatio);

      const canvas = document.createElement('canvas');
      canvas.width = baseImg.width;
      canvas.height = baseImg.height + footerHeight;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0);

      const sideMargin = Math.round(baseImg.width * 0.04);

      const topRowHeight = footerHeight * 0.70;
      const rowGap = footerHeight * 0.08;
      const bottomRowHeight = footerHeight - topRowHeight - rowGap;

      const topRowCy = baseImg.height + topRowHeight / 2;
      const bottomRowCy = baseImg.height + topRowHeight + rowGap + bottomRowHeight / 2;

      // ══════════ ROW 1 (left): user avatar + name ══════════
      const avatarSize = Math.round(topRowHeight * 1.0);
      const avatarCx = sideMargin + avatarSize / 2;

      if (userImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCx, topRowCy, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const srcSize = Math.min(userImg.width, userImg.height);
        const srcX = (userImg.width - srcSize) / 2;
        const srcY = (userImg.height - srcSize) / 2;
        ctx.drawImage(userImg, srcX, srcY, srcSize, srcSize,
          avatarCx - avatarSize / 2, topRowCy - avatarSize / 2, avatarSize, avatarSize);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarCx, topRowCy, avatarSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#C1440E';
        ctx.stroke();
        ctx.restore();
      }

      if (userName) {
        const fontSize = Math.round(topRowHeight * 0.48);
        const textX = userImg ? avatarCx + avatarSize / 2 + 16 : sideMargin;
        const maxTextWidth = canvas.width - textX - sideMargin;
        ctx.font = `600 ${fontSize}px sans-serif`;
        let adjustedFontSize = fontSize;
        while (ctx.measureText(userName).width > maxTextWidth && adjustedFontSize > 10) {
          adjustedFontSize -= 1;
          ctx.font = `600 ${adjustedFontSize}px sans-serif`;
        }
        ctx.save();
        ctx.fillStyle = '#333333';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(userName, textX, topRowCy);
        ctx.restore();
      }

      // ══════════ ROW 2 (bottom-right block: "Powered by" — LOGO — "Mangal Bhav") ══════════
      const rightEdge = canvas.width - sideMargin;
      const logoSize = Math.round(bottomRowHeight * 1.45);
      const textLogoGap = 8;
      const poweredFontSize = Math.round(bottomRowHeight * 0.8);

      ctx.font = `500 ${poweredFontSize}px sans-serif`;
      const preText = 'Powered by';
      const postText = 'Mangal Bhav';
      const preTextWidth = ctx.measureText(preText).width;
      const postTextWidth = ctx.measureText(postText).width;

      // Whole "text — logo — text" block still anchors its right edge to the margin
      const blockWidth = preTextWidth + textLogoGap + logoSize + textLogoGap + postTextWidth;
      const blockLeftX = rightEdge - blockWidth;

      const preTextStartX = blockLeftX;
      const logoCx = blockLeftX + preTextWidth + textLogoGap + logoSize / 2;
      const postTextStartX = blockLeftX + preTextWidth + textLogoGap + logoSize + textLogoGap;

      // "Powered by"
      ctx.save();
      ctx.fillStyle = '#888888';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.font = `500 ${poweredFontSize}px sans-serif`;
      ctx.fillText(preText, preTextStartX, bottomRowCy);
      ctx.restore();

      // Logo (in the middle)
      if (logoImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoCx, bottomRowCy, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        const srcSize = Math.min(logoImg.width, logoImg.height);
        const srcX = (logoImg.width - srcSize) / 2;
        const srcY = (logoImg.height - srcSize) / 2;
        ctx.drawImage(logoImg, srcX, srcY, srcSize, srcSize,
          logoCx - logoSize / 2, bottomRowCy - logoSize / 2, logoSize, logoSize);
        ctx.restore();
      }

      // "Mangal Bhav"
      ctx.save();
      ctx.fillStyle = '#888888';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.font = `500 ${poweredFontSize}px sans-serif`;
      ctx.fillText(postText, postTextStartX, bottomRowCy);
      ctx.restore();

      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('addUserPhotoOverlay failed:', e);
      return baseImageDataUrl;
    }
  }


  openSourcePage() {
    //  console.log('openSourcePage fired', this.item?.SourceTable);
    // alert('helll');
    if (!this.item) return;
    const link = this.getSourcePageLink(this.item);
    if (!link) return;
    this.routerCtrl.navigateForward(link);
  }

  private loadEngagementCounts() {
    if (!this.item) return;
    const userID = this.userDetails?.UserID || 0;
    this.apinu.postUrlData(
      `FeedEngagementCount_Select?FeedID=${this.item.FeedID}&UserID=${userID}`, null
    ).subscribe({
      next: (res: any) => {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        const row = Array.isArray(parsed) ? parsed[0] : parsed;
        if (!row || !this.item) return;
        this.item.likeCount = row.LikeCount ?? 0;
        this.item.commentCount = row.CommentCount ?? 0;
        this.item.shareCount = row.ShareCount ?? 0;
        this.item.viewCount = row.ViewCount ?? 0;
        this.item.isLiked = !!row.IsLikedByUser;
        this.item.myFeedLikeID = row.MyFeedLikeID || undefined;
        this.cdr.markForCheck();
      },
      error: () => { /* leave counts undefined; template shows 0 */ }
    });
  }

  private recordView() {
    if (!this.item || this.item.hasBeenViewed) return;
    const userID = this.userDetails?.UserID || 0;
    if (!userID) return;

    this.item.hasBeenViewed = true;
    const feedView = { FeedID: this.item.FeedID, UserID: userID, ViewedOn: new Date() };
    this.apinu.postUrlData('FeedViewInsert', feedView).subscribe({
      next: () => { if (this.item) this.item.viewCount = (this.item.viewCount ?? 0) + 1; },
      error: () => { if (this.item) this.item.hasBeenViewed = false; }
    });
  }

  // ══════════════════════════════════════════════════════
  // LIKE
  // ══════════════════════════════════════════════════════

  toggleLike() {
    if (!this.item) return;
    const item = this.item;

    const userID = this.userDetails?.UserID;
    if (!userID) {
      this.showToast('⚠️', 'कृपया पहले लॉगिन करें');
      return;
    }
    if (item.isLikeInFlight) return;
    item.isLikeInFlight = true;

    if (item.isLiked && item.myFeedLikeID) {
      const prevCount = item.likeCount ?? 0;
      item.isLiked = false;
      item.likeCount = Math.max(0, prevCount - 1);
      const likeIDToDelete = item.myFeedLikeID;
      item.myFeedLikeID = undefined;

      this.apinu.postUrlData(
        `FeedLikeDelete?feedLikeID=${likeIDToDelete}&tenantID=${this.userDetails?.TenantID || 1}`, null
      ).subscribe({
        next: () => { item.isLikeInFlight = false; },
        error: () => {
          item.isLiked = true;
          item.likeCount = prevCount;
          item.myFeedLikeID = likeIDToDelete;
          item.isLikeInFlight = false;
        }
      });
    } else {
      const prevCount = item.likeCount ?? 0;
      item.isLiked = true;
      item.likeCount = prevCount + 1;

      const feedLike = { FeedID: item.FeedID, UserID: userID, DateAdded: new Date() };
      this.apinu.postUrlData('FeedLikeInsert', feedLike).subscribe({
        next: (res: any) => {
          item.myFeedLikeID = res.FeedLikeID;
          item.isLikeInFlight = false;
        },
        error: () => {
          item.isLiked = false;
          item.likeCount = prevCount;
          item.isLikeInFlight = false;
        }
      });
    }
  }

  // ══════════════════════════════════════════════════════
  // COMMENTS (inline on the detail page)
  // ══════════════════════════════════════════════════════

  loadComments() {
    if (!this.item) return;
    this.commentsLoading = true;
    const query = `FeedID=${this.item.FeedID} AND IsDeleted=0`;
    this.apinu.postUrlData(
      `FeedCommentSelectByQuery?Query=${encodeURIComponent(query)}`, null
    ).subscribe({
      next: (res: any) => {
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        this.commentsList = (parsed?.FeedCommentList || [])
          .sort((a: any, b: any) => new Date(b.DateAdded).getTime() - new Date(a.DateAdded).getTime());
        this.commentsLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.commentsLoading = false; }
    });
  }

  submitComment() {
    const text = this.newCommentText.trim();
    if (!text || !this.item) return;

    const userID = this.userDetails?.UserID;
    if (!userID) {
      this.showToast('⚠️', 'कृपया पहले लॉगिन करें');
      return;
    }

    this.isSubmittingComment = true;
    const feedComment = {
      FeedID: this.item.FeedID,
      UserID: userID,
      Comment: text,
      IsDeleted: false,
      DateAdded: new Date(),
      DateModified: new Date()
    };

    this.apinu.postUrlData('FeedCommentInsert', feedComment).subscribe({
      next: (res: any) => {
        this.isSubmittingComment = false;
        this.newCommentText = '';
        this.commentsList.unshift({
          FeedCommentID: res.FeedCommentID,
          FeedID: this.item!.FeedID,
          UserID: userID,
          UserName: this.userDetails?.Name || 'आप',
          Comment: text,
          DateAdded: new Date().toISOString()
        });
        if (this.item) this.item.commentCount = (this.item.commentCount ?? 0) + 1;
      },
      error: () => {
        this.isSubmittingComment = false;
        this.showToast('❌', 'कमेंट पोस्ट नहीं हुआ, पुनः प्रयास करें');
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // MEDIA
  // ══════════════════════════════════════════════════════


  private getImagePurposeForFeedItem(item: FeedItem): string {
    switch ((item.SourceTable || '').trim()) {
      case 'Mandir': return 'ProfilePhoto';
      case 'Profile': return 'ProfilePhoto';
      case 'Service': return 'PoojaPhoto';
      case 'Booking': return 'PoojaPhoto';
      case 'Feed': return 'feed';
      default: return 'feed';
    }
  }

  private getFeedMediaFolder(item: FeedItem): string {
    switch ((item.SourceTable || '').trim()) {
      case 'Mandir': return 'ProfilePhoto';
      case 'Profile': return 'ProfilePhoto';
      case 'Service': return 'img';
      case 'Booking': return 'img';
      case 'Feed': return 'feed';
      default: return 'feed';
    }
  }

  hasFeedMedia(item: FeedItem): boolean {
    return !!item.MediaURL && item.MediaURL.trim() !== '' && item.MediaURL !== 'null';
  }

  getFeedMediaPath(item: FeedItem): string {
    const folder = this.getFeedMediaFolder(item);
    return `${this.imgBaseUrl}/${folder}/${item.MediaURL}`;
  }

  onMediaError(): void {
    this.brokenMedia = true;
    this.cdr.markForCheck();
  }

  // ══════════════════════════════════════════════════════
  // SHARE
  // ══════════════════════════════════════════════════════

  private getFeedShareLink(item: FeedItem): string {
    return `${this.shareLinkBaseUrl}/feed/${item.FeedID}`;
  }


  // async shareFeedAsImage(item: FeedItem) {

  //   const cardEl = document.querySelector(
  //     `.insta-post[data-feed-id="${item.FeedID}"]`
  //   ) as HTMLElement;

  //   if (!cardEl) {
  //     this.showToast('❌', 'शेयर के लिए पोस्ट नहीं मिली');
  //     return;
  //   }

  //   const userID = this.userDetails?.UserID || 0;
  //   this.apinu.postUrlData('FeedShareInsert', {
  //     FeedID: item.FeedID,
  //     UserID: userID,
  //     ShareType: 'Image',
  //     SharedOn: new Date()
  //   }).subscribe({
  //     next: () => item.shareCount = (item.shareCount ?? 0) + 1,
  //     error: () => { }
  //   });

  //   const shareLink = this.getFeedShareLink(item);
  //   const shareText = item.Title ? `${item.Title}\n\n${shareLink}` : shareLink;

  //   const captureHost = document.createElement('div');
  //   captureHost.style.position = 'fixed';
  //   captureHost.style.left = '-9999px';
  //   captureHost.style.top = '0';
  //   captureHost.style.width = `${cardEl.offsetWidth || 400}px`;
  //   captureHost.style.background = '#ffffff';
  //   document.body.appendChild(captureHost);

  //   const clone = cardEl.cloneNode(true) as HTMLElement;
  //   clone.querySelectorAll('video').forEach((videoEl: HTMLVideoElement) => {
  //     const img = document.createElement('img');
  //     img.src = videoEl.currentSrc || videoEl.src;
  //     img.className = videoEl.className;
  //     img.crossOrigin = 'anonymous';
  //     videoEl.replaceWith(img);
  //   });

  //   captureHost.appendChild(clone);

  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 100));
  //     const images = Array.from(captureHost.querySelectorAll('img'));
  //     await Promise.all(images.map(img => {
  //       if (img.complete) return Promise.resolve();
  //       return new Promise<void>(resolve => {
  //         img.onload = () => resolve();
  //         img.onerror = () => resolve();
  //       });
  //     }));

  //     const canvas = await html2canvas(clone, {
  //       scale: 2,
  //       useCORS: true,
  //       allowTaint: false,
  //       backgroundColor: '#ffffff',
  //       logging: false,
  //     });

  //     const imageData = canvas.toDataURL('image/png');

  //     // Overlay the sharing user's profile photo (bottom-left avatar),
  //     // same treatment as the panchang share image.
  //     const imageToShare = await this.addUserPhotoOverlay(imageData, 'bottom-right', 0.18);


  //     if (Capacitor.isNativePlatform()) {
  //       const base64Data = imageToShare.split(',')[1];
  //       const fileName = `feed-${item.FeedID}.png`;
  //       const savedFile = await Filesystem.writeFile({
  //         path: fileName,
  //         data: base64Data,
  //         directory: Directory.Cache
  //       });
  //       await Share.share({
  //         title: item.Title || 'Post',
  //         text: shareText,          // ← link goes out with the shared image
  //         url: savedFile.uri,
  //         dialogTitle: 'पोस्ट शेयर करें'
  //       });
  //     } else {
  //       const blob = await (await fetch(imageToShare)).blob();
  //       const file = new File([blob], `feed-${item.FeedID}.png`, { type: 'image/png' });

  //       if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
  //         await (navigator as any).share({
  //           files: [file],
  //           title: item.Title || 'Post',
  //           text: shareText          // ← link included alongside the file
  //         });
  //       } else if ((navigator as any).share) {
  //         await (navigator as any).share({
  //           title: item.Title || 'Post',
  //           text: shareText,
  //           url: shareLink            // ← plain link fallback when file share isn't supported
  //         });
  //       } else {
  //         // No native share API — download the image, and separately copy the link
  //         const a = document.createElement('a');
  //         a.href = imageToShare;
  //         a.download = `feed-${item.FeedID}.png`;
  //         a.click();

  //         try {
  //           await navigator.clipboard.writeText(shareLink);
  //           this.showToast('🔗', 'लिंक कॉपी हो गया');
  //         } catch { /* clipboard may be blocked; ignore silently */ }
  //       }
  //     }

  //   } catch (e: any) {
  //     console.error('shareFeedAsImage failed:', e?.name, e?.message, e);
  //     if (e?.name === 'SecurityError' || /tainted/i.test(e?.message || '')) {
  //       this.showToast('❌', 'फ़ोटो सर्वर CORS सेटिंग की वजह से शेयर नहीं हो पाया');
  //     } else {
  //       this.showToast('❌', 'शेयर नहीं हुआ');
  //     }
  //   } finally {
  //     document.body.removeChild(captureHost);
  //   }
  // }



  // ══════════════════════════════════════════════════════
  // SHARE (with preview step)
  // ══════════════════════════════════════════════════════

  async shareFeedAsImage(item: FeedItem) {

    const cardEl = document.querySelector(
      `.insta-post[data-feed-id="${item.FeedID}"]`
    ) as HTMLElement;

    if (!cardEl) {
      this.showToast('❌', 'शेयर के लिए पोस्ट नहीं मिली');
      return;
    }

    const mediaWrapEl = cardEl.querySelector('.ip-media-wrap') as HTMLElement | null;
    const targetEl = mediaWrapEl || cardEl;

    this.isPreparingShare = true;

    const shareLink = this.getFeedShareLink(item);
    const shareText = item.Title ? `${item.Title}\n\n${shareLink}` : shareLink;

    const captureHost = document.createElement('div');
    captureHost.style.position = 'fixed';
    captureHost.style.left = '-9999px';
    captureHost.style.top = '0';
    captureHost.style.width = `${targetEl.offsetWidth || 400}px`;
    captureHost.style.background = '#ffffff';
    document.body.appendChild(captureHost);

    const clone = targetEl.cloneNode(true) as HTMLElement;

    // Convert any <video> to <img> first (existing behavior)
    clone.querySelectorAll('video').forEach((videoEl: HTMLVideoElement) => {
      const img = document.createElement('img');
      img.src = videoEl.currentSrc || videoEl.src;
      img.className = videoEl.className;
      videoEl.replaceWith(img);
    });

    // ── NEW: swap every cloned <img>'s cross-origin src for a same-origin blob data URL ──
    if (this.hasFeedMedia(item)) {
      try {
        const imagePurpose = this.getImagePurposeForFeedItem(item); // matches folder→purpose mapping used elsewhere
        const blob: any = await firstValueFrom(
          this.api.getImage('DownloadImages', { imageName: item.MediaURL, imagePurpose })
        );
        const dataUrl: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const clonedImg = clone.querySelector('img') as HTMLImageElement | null;
        if (clonedImg) clonedImg.src = dataUrl;
      } catch (e) {
        console.error('Failed to fetch media as blob for share capture:', e);
        // fall through — capture will proceed with the original src (may still taint)
      }
    }

    captureHost.appendChild(clone);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const images = Array.from(captureHost.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imageData = canvas.toDataURL('image/png');
      const imageToShare = await this.addUserPhotoOverlay(imageData, 0.16);

      this.pendingShareItem = item;
      this.pendingShareText = shareText;
      this.sharePreviewImageUrl = imageToShare;
      this.showSharePreview = true;

    } catch (e: any) {
      console.error('shareFeedAsImage failed:', e?.name, e?.message, e);
      if (e?.name === 'SecurityError' || /tainted/i.test(e?.message || '')) {
        this.showToast('❌', 'फ़ोटो सर्वर CORS सेटिंग की वजह से शेयर नहीं हो पाया');
      } else {
        this.showToast('❌', 'शेयर नहीं हुआ');
      }
    } finally {
      document.body.removeChild(captureHost);
      this.isPreparingShare = false;
      this.cdr.markForCheck();
    }
  }



  // async shareFeedAsImage(item: FeedItem) {

  //   const cardEl = document.querySelector(
  //     `.insta-post[data-feed-id="${item.FeedID}"]`
  //   ) as HTMLElement;

  //   if (!cardEl) {
  //     this.showToast('❌', 'शेयर के लिए पोस्ट नहीं मिली');
  //     return;
  //   }

  //   this.isPreparingShare = true;

  //   const shareLink = this.getFeedShareLink(item);
  //   const shareText = item.Title ? `${item.Title}\n\n${shareLink}` : shareLink;

  //   const captureHost = document.createElement('div');
  //   captureHost.style.position = 'fixed';
  //   captureHost.style.left = '-9999px';
  //   captureHost.style.top = '0';
  //   captureHost.style.width = `${cardEl.offsetWidth || 400}px`;
  //   captureHost.style.background = '#ffffff';
  //   document.body.appendChild(captureHost);

  //   const clone = cardEl.cloneNode(true) as HTMLElement;
  //   clone.querySelectorAll('video').forEach((videoEl: HTMLVideoElement) => {
  //     const img = document.createElement('img');
  //     img.src = videoEl.currentSrc || videoEl.src;
  //     img.className = videoEl.className;
  //     img.crossOrigin = 'anonymous';
  //     videoEl.replaceWith(img);
  //   });

  //   captureHost.appendChild(clone);

  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 100));
  //     const images = Array.from(captureHost.querySelectorAll('img'));
  //     await Promise.all(images.map(img => {
  //       if (img.complete) return Promise.resolve();
  //       return new Promise<void>(resolve => {
  //         img.onload = () => resolve();
  //         img.onerror = () => resolve();
  //       });
  //     }));

  //     const canvas = await html2canvas(clone, {
  //       scale: 2,
  //       useCORS: true,
  //       allowTaint: false,
  //       backgroundColor: '#ffffff',
  //       logging: false,
  //     });

  //     const imageData = canvas.toDataURL('image/png');
  //     const imageToShare = await this.addUserPhotoOverlay(imageData, 'bottom-left', 0.18);

  //     // Stash everything needed for the actual share, then open the preview
  //     this.pendingShareItem = item;
  //     this.pendingShareText = shareText;
  //     this.sharePreviewImageUrl = imageToShare;
  //     this.showSharePreview = true;

  //   } catch (e: any) {
  //     console.error('shareFeedAsImage failed:', e?.name, e?.message, e);
  //     if (e?.name === 'SecurityError' || /tainted/i.test(e?.message || '')) {
  //       this.showToast('❌', 'फ़ोटो सर्वर CORS सेटिंग की वजह से शेयर नहीं हो पाया');
  //     } else {
  //       this.showToast('❌', 'शेयर नहीं हुआ');
  //     }
  //   } finally {
  //     document.body.removeChild(captureHost);
  //     this.isPreparingShare = false;
  //     this.cdr.markForCheck();
  //   }
  // }

  cancelSharePreview() {
    this.showSharePreview = false;
    this.sharePreviewImageUrl = null;
    this.pendingShareItem = null;
    this.pendingShareText = '';
  }





  async confirmShare() {
    const item = this.pendingShareItem;
    const imageToShare = this.sharePreviewImageUrl;
    const shareText = this.pendingShareText;
    const shareLink = item ? this.getFeedShareLink(item) : '';

    if (!item || !imageToShare) {
      this.cancelSharePreview();
      return;
    }

    // Close the preview immediately so the native share sheet isn't stacked behind it
    this.showSharePreview = false;

    const userID = this.userDetails?.UserID || 0;
    this.apinu.postUrlData('FeedShareInsert', {
      FeedID: item.FeedID,
      UserID: userID,
      ShareType: 'Image',
      SharedOn: new Date()
    }).subscribe({
      next: () => item.shareCount = (item.shareCount ?? 0) + 1,
      error: () => { }
    });

    try {
      if (Capacitor.isNativePlatform()) {
        const base64Data = imageToShare.split(',')[1];
        const fileName = `feed-${item.FeedID}.png`;
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache
        });
        await Share.share({
          title: item.Title || 'Post',
          text: shareText,
          url: savedFile.uri,
          dialogTitle: 'पोस्ट शेयर करें'
        });
      } else {
        const blob = await (await fetch(imageToShare)).blob();
        const file = new File([blob], `feed-${item.FeedID}.png`, { type: 'image/png' });

        if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
          await (navigator as any).share({
            files: [file],
            title: item.Title || 'Post',
            text: shareText
          });
        } else if ((navigator as any).share) {
          await (navigator as any).share({
            title: item.Title || 'Post',
            text: shareText,
            url: shareLink
          });
        } else {
          const a = document.createElement('a');
          a.href = imageToShare;
          a.download = `feed-${item.FeedID}.png`;
          a.click();

          try {
            await navigator.clipboard.writeText(shareLink);
            this.showToast('🔗', 'लिंक कॉपी हो गया');
          } catch { /* clipboard may be blocked; ignore silently */ }
        }
      }
    } catch (e) {
      console.error('confirmShare failed:', e);
      this.showToast('❌', 'शेयर नहीं हुआ');
    } finally {
      this.cancelSharePreview();
    }
  }




}