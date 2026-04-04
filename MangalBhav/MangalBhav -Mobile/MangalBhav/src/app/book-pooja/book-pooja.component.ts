import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { concatMap, elementAt, forkJoin, map, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';

@Component({
  selector: 'app-book-pooja',
  templateUrl: './book-pooja.component.html',
  styleUrls: ['./book-pooja.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ZXingScannerModule, PanditjibottomtabsComponent]
})
export class BookPoojaComponent implements OnInit {
  userDetails: any;
  PanditServiceList: any;
  searchQuery: string = '';
  isScannerOpen = false;
  scannedQrData: string | null = null;
  PanditServicesList: any;
  formats = [BarcodeFormat.QR_CODE];
  // Properties
  isPhotosModalOpen = false;
  isPreviewOpen = false;
  serviceImages: any[] = [];
  previewUrl = '';
  labels = {
    en: {
      welcomeLine: '🪔 Sacred rituals for every event of life',
      chooseStage: 'Choose a life stage...',

      rituals: 'Rituals',
      mins: 'mins',
      atHome: 'At your home',

      verifiedPandit: 'Verified Pandit Ji',
      samagriChecklist: 'Samagri checklist provided',

      findPandit: 'Find Pandit ji',

      veryGood: 'Very Good',
      reviews: 'Reviews',

      heroTagline: "India's most trusted platform for booking verified Pandits for every sacred ritual — from the first breath to the final farewell.",

      samskaras: '16 Samskaras Covered',
      verified: 'Verified Pandits',
      doorstep: 'At Your Doorstep',
      trusted: 'Trusted by Families',
      logoTitle: 'Mangal.Bhav',
      logoSub: '✦ Peace · Prosperity · Protection ✦',

      statsRituals: 'Sacred Rituals',
      statsPandits: 'Verified Pandits',
      statsFamilies: 'Families Served',
      statsCities: 'Cities Covered',

      // ── How It Works ──────────────────────────────
      simpleProcess: 'Simple Process',
      howWorks: 'How Mangal.Bhav Works',
      howSub: 'Connecting devotees with qualified pandits in 3 simple steps',

      step1: 'Step 1',
      step2: 'Step 2',
      step3: 'Step 3',

      how1Title: 'Choose Your Ritual',
      how1Desc: 'Browse from 30+ sacred havans and pooja ceremonies — from birth to ancestral rites. Select the one that fits your need.',

      how2Title: 'Match a Pandit',
      how2Desc: 'Get matched with a verified, experienced Pandit from your region. View profiles, specializations, languages, and ratings.',

      how3Title: 'Ritual at Your Home',
      how3Desc: 'The Pandit arrives at your doorstep with all necessary samagri. Experience authentic Vedic rituals in the comfort of your home.',

      // ── For Whom ──────────────────────────────────
      builtFor: 'Built For',
      twoSides: 'Two Sides, One Sacred Bridge',
      twoSidesSub: 'Whether you seek blessings or offer them — Mangal.Bhav is your home',

      yajman: 'Yajman',
      yajmanSubtitle: 'The Devotee · भक्त',
      forYou: 'For You',

      pandit: 'Pandit Ji',
      panditSubtitle: 'The Priest · पंडित जी',
      joinUs: 'Join Us',

      // Yajman features
      yFeature1: 'Browse 30+ rituals by life stage',
      yFeature2: 'View verified Pandit profiles & ratings',
      yFeature3: 'Book at-home ceremonies in minutes',
      yFeature4: 'Get muhurat (auspicious timing) suggestions',
      yFeature5: 'Track ritual progress and history',
      yFeature6: 'Samagri checklist provided beforehand',

      // Pandit features
      pFeature1: 'Create a verified professional profile',
      pFeature2: 'Receive booking requests near your location',
      pFeature3: 'Manage your schedule and availability',
      pFeature4: 'Grow your reach beyond word-of-mouth',
      pFeature5: 'Earn trust through reviews & ratings',
      pFeature6: 'List all specializations and expertise',

      trustedByFamilies: 'Trusted by families across India',

      // ── Testimonials ──────────────────────────────
      testimonials: 'Trusted By Families',
      whatFamilies: 'What Families Say',
      realExperiences: 'Real experiences from Yajmans across India',

      // ── Refer & Earn ──────────────────────────────
      referTitle: 'Refer & Earn',
      referSub: 'Invite your family & friends to Mangal.Bhav and earn sacred rewards together',

      youGet: 'You Get',
      friendGets: 'Friend Gets',
      referralCode: 'Your Referral Code',
      copy: 'Copy',
      copied: 'Copied!',
      share: 'Share with Friends',

      explore: 'Explore Life',
      me: 'Me',

      // ── Find Pandit Page ──────────────────────────
      sacredRitual: 'Sacred Vedic Ritual',

      // Info grid
      infoLabelDuration: 'Duration',
      infoValueDuration: '90 – 120 mins',
      infoLabelFamily: 'Family Members',
      infoValueFamily: 'All welcome',
      infoLabelVenue: 'Venue',
      infoValueVenue: 'At your home',
      infoLabelBestTime: 'Best Time',
      infoValueBestTime: 'Morning muhurat',

      // Loading / empty
      loadingPandits: 'Finding Pandits for you...',
      noPanditsTitle: 'No Pandits Found',
      noPanditsDesc: 'No pandits available for this pooja right now.',

      // Pandit card
      verifiedBadge: '✓ Verified',
      pendingBadge: '⏳ Pending',
      yrsExp: 'yrs exp',
      dakshina: 'Dakshina',
      bookNow: '🙏 Book Now →',

      // Pooja modal
      sevaDetails: 'Seva Details',
      aboutSeva: '🪔 About this Seva',
      aboutSevaText: 'This sacred ritual has been performed by Hindu families for thousands of years. It invokes divine blessings, purifies the surroundings, and brings peace, prosperity, and protection to all family members. Conducted by our verified Pandits with full Vedic vidhi and samagri.',
      whatsIncluded: "✅ What's Included",
      included1: 'Verified Pandit Ji',
      included2: 'Complete Vedic Vidhi',
      included3: 'Samagri checklist provided',
      included4: 'Muhurat consultation',
      included5: 'At-home ceremony',

      // Pandit modal
      panditProfile: 'Pandit Profile',
      verifiedPanditBadge: '✓ Verified Pandit',
      pendingPanditBadge: '⏳ Verification Pending',
      infoLabelExperience: 'Experience',
      infoLabelGender: 'Gender',
      infoLabelLanguages: 'Languages',
      aboutPandit: '🙏 About Pandit Ji',
      specializations: '📿 Specializations',
      spec1: 'Vedic Havans & Yagyas',
      spec2: 'Jyotish & Muhurat',
      spec3: 'Griha Pravesh & Vastu',
      spec4: 'Marriage Ceremonies',

      // ── Book Pandit Page ──────────────────────────
      bookPanditTitle: 'Book Pandit',
      bannerSub: 'Find & Book',
      bannerTitle: 'Your Seva Pandit',
      searchPlaceholder: 'Search by name, language...',

      scanQrTitle: 'Scan QR Code',
      qrHint: 'Point camera at a Mangal.Bhav QR code',

      availableServices: 'Available Services',

      statusAvailable: 'Available',
      statusUnavailable: 'Unavailable',
      startingAt: 'Starting at',
      peopleBooked: 'people have booked this',

      tagHavan: '🔥 Havan',
      tagVedic: '📿 Vedic',
      tagAtHome: '🏠 At Home',

      viewSevaPhotos: 'View Seva Photos',
      bookNowBtn: 'Book Now',
      notAvailable: 'Not Available',

      emptyTitle: 'No Services Found',
      emptySub: 'Check back soon for available pandits near you',

      // Booking modal
      confirmBooking: '✅ Confirm Booking',
      summaryLabelPandit: 'Pandit',
      summaryLabelLocation: 'Location',
      summaryLabelDakshina: 'Dakshina',
      summaryLabelAboutSeva: 'About this Seva',
      noDescription: 'No description available',
      selectPujaDate: '📅 Select Puja Date',
      confirmBtn: 'Confirm Booking',

      // ── Footer ────────────────────────────────────
      footerTagline: "India's most trusted platform for booking verified Pandits for every sacred ritual — from the first breath to the final farewell.",
      footerOm: 'ॐ नमः शिवाय',

      footerPlatform: '🙏 Platform',
      footerAbout: 'About Us',
      footerHowWorks: 'How It Works',
      footerAllRituals: 'All Rituals',
      footerCities: 'Cities We Serve',

      footerForPandits: '🧘 For Pandits',
      footerJoinPandit: 'Join as Pandit',
      footerDashboard: 'Pandit Dashboard',
      footerManageBookings: 'Manage Bookings',
      footerSupport: 'Support',

      footerLegal: '📜 Legal',
      footerPrivacy: 'Privacy Policy',
      footerTerms: 'Terms of Service',
      footerRefund: 'Refund Policy',
      footerContact: 'Contact Us',

      footerCopy: '© 2026 Mangal.Bhav . All rights reserved.',
    },

    hi: {
      welcomeLine: '🪔 जीवन के हर अवसर के लिए पवित्र अनुष्ठान',
      chooseStage: 'जीवन चरण चुनें...',

      rituals: 'अनुष्ठान',
      logoSub: '✦ शांति · समृद्धि · सुरक्षा ✦',
      logoTitle: 'मंगल.भाव',
      mins: 'मिनट',
      atHome: 'आपके घर पर',

      verifiedPandit: 'सत्यापित पंडित जी',
      samagriChecklist: 'सामग्री सूची प्रदान की जाएगी',

      findPandit: 'पंडित जी खोजें',

      veryGood: 'बहुत अच्छा',
      reviews: 'समीक्षाएँ',

      heroTagline: 'भारत का सबसे विश्वसनीय प्लेटफॉर्म पंडित जी बुक करने के लिए — जन्म से अंतिम संस्कार तक',

      samskaras: '16 संस्कार शामिल',
      verified: 'सत्यापित पंडित जी',
      doorstep: 'घर तक सेवा',
      trusted: 'परिवारों का भरोसा',

      statsRituals: 'अनुष्ठान',
      statsPandits: 'पंडित जी',
      statsFamilies: 'परिवार',
      statsCities: 'शहर',

      // ── How It Works ──────────────────────────────
      simpleProcess: 'सरल प्रक्रिया',
      howWorks: 'मंगल.भाव कैसे काम करता है',
      howSub: '3 आसान चरणों में पंडित जी से जुड़ें',

      step1: 'चरण 1',
      step2: 'चरण 2',
      step3: 'चरण 3',

      how1Title: 'अनुष्ठान चुनें',
      how1Desc: '30+ पवित्र हवन और पूजा समारोहों में से चुनें — जन्म से पितृ अनुष्ठान तक। अपनी आवश्यकता के अनुसार चुनें।',

      how2Title: 'पंडित जी चुनें',
      how2Desc: 'अपने क्षेत्र के सत्यापित और अनुभवी पंडित जी से मिलें। प्रोफ़ाइल, विशेषज्ञता, भाषा और रेटिंग देखें।',

      how3Title: 'घर पर अनुष्ठान',
      how3Desc: 'पंडित जी सभी आवश्यक सामग्री के साथ आपके घर आएंगे। अपने घर में ही प्रामाणिक वैदिक अनुष्ठान का अनुभव करें।',

      // ── For Whom ──────────────────────────────────
      builtFor: 'किसके लिए',
      twoSides: 'दो पक्ष, एक पवित्र सेतु',
      twoSidesSub: 'भक्त हों या पंडित जी — मंगल.भाव आपका घर है',

      yajman: 'यजमान',
      yajmanSubtitle: 'भक्त · The Devotee',
      forYou: 'आपके लिए',

      pandit: 'पंडित जी',
      panditSubtitle: 'पंडित जी · The Priest',
      joinUs: 'जुड़ें',

      // Yajman features
      yFeature1: 'जीवन चरण के अनुसार 30+ अनुष्ठान देखें',
      yFeature2: 'सत्यापित पंडित जी प्रोफ़ाइल और रेटिंग देखें',
      yFeature3: 'कुछ मिनटों में घर पर पूजा बुक करें',
      yFeature4: 'मुहूर्त (शुभ समय) सुझाव पाएं',
      yFeature5: 'अनुष्ठान की प्रगति और इतिहास ट्रैक करें',
      yFeature6: 'सामग्री सूची पहले से प्रदान की जाएगी',

      // Pandit features
      pFeature1: 'सत्यापित पेशेवर प्रोफ़ाइल बनाएं',
      pFeature2: 'अपने पास की बुकिंग अनुरोध प्राप्त करें',
      pFeature3: 'अपना शेड्यूल और उपलब्धता प्रबंधित करें',
      pFeature4: 'मुँह-ज़बानी से परे अपनी पहुँच बढ़ाएं',
      pFeature5: 'समीक्षाओं और रेटिंग से विश्वास अर्जित करें',
      pFeature6: 'सभी विशेषज्ञताएं और कौशल सूचीबद्ध करें',

      trustedByFamilies: 'भारत भर के परिवारों का विश्वास',

      // ── Testimonials ──────────────────────────────
      testimonials: 'परिवारों का विश्वास',
      whatFamilies: 'परिवार क्या कहते हैं',
      realExperiences: 'भारत भर के यजमानों के वास्तविक अनुभव',

      // ── Refer & Earn ──────────────────────────────
      referTitle: 'रेफर करें और कमाएँ',
      referSub: 'अपने परिवार और दोस्तों को आमंत्रित करें और साथ मिलकर पुरस्कार अर्जित करें',

      youGet: 'आपको मिलेगा',
      friendGets: 'मित्र को मिलेगा',
      referralCode: 'आपका रेफरल कोड',
      copy: 'कॉपी करें',
      copied: 'कॉपी हो गया!',
      share: 'साझा करें',

      explore: 'जीवन देखें',
      me: 'मैं',

      // ── Find Pandit Page ──────────────────────────
      sacredRitual: 'पवित्र वैदिक अनुष्ठान',

      // Info grid
      infoLabelDuration: 'अवधि',
      infoValueDuration: '90 – 120 मिनट',
      infoLabelFamily: 'परिवार के सदस्य',
      infoValueFamily: 'सभी आमंत्रित हैं',
      infoLabelVenue: 'स्थान',
      infoValueVenue: 'आपके घर पर',
      infoLabelBestTime: 'सर्वोत्तम समय',
      infoValueBestTime: 'प्रातः मुहूर्त',

      // Loading / empty
      loadingPandits: 'आपके लिए पंडित जी खोज रहे हैं...',
      noPanditsTitle: 'कोई पंडित जी नहीं मिला',
      noPanditsDesc: 'इस समय इस पूजा के लिए कोई पंडित जी उपलब्ध नहीं है।',

      // Pandit card
      verifiedBadge: '✓ सत्यापित',
      pendingBadge: '⏳ लंबित',
      yrsExp: 'वर्ष अनुभव',
      dakshina: 'दक्षिणा',
      bookNow: '🙏 अभी बुक करें →',

      // Pooja modal
      sevaDetails: 'सेवा विवरण',
      aboutSeva: '🪔 इस सेवा के बारे में',
      aboutSevaText: 'यह पवित्र अनुष्ठान हजारों वर्षों से हिंदू परिवारों द्वारा किया जाता रहा है। यह दिव्य आशीर्वाद प्रदान करता है, परिवेश को शुद्ध करता है और परिवार के सभी सदस्यों को शांति, समृद्धि और सुरक्षा देता है। हमारे सत्यापित पंडितों द्वारा पूर्ण वैदिक विधि और सामग्री के साथ संपन्न।',
      whatsIncluded: '✅ क्या शामिल है',
      included1: 'सत्यापित पंडित जी',
      included2: 'संपूर्ण वैदिक विधि',
      included3: 'सामग्री सूची प्रदान की जाएगी',
      included4: 'मुहूर्त परामर्श',
      included5: 'घर पर अनुष्ठान',

      // Pandit modal
      panditProfile: 'पंडित जी प्रोफ़ाइल',
      verifiedPanditBadge: '✓ सत्यापित पंडित जी',
      pendingPanditBadge: '⏳ सत्यापन लंबित',
      infoLabelExperience: 'अनुभव',
      infoLabelGender: 'लिंग',
      infoLabelLanguages: 'भाषाएँ',
      aboutPandit: '🙏 पंडित जी के बारे में',
      specializations: '📿 विशेषज्ञताएँ',
      spec1: 'वैदिक हवन और यज्ञ',
      spec2: 'ज्योतिष और मुहूर्त',
      spec3: 'गृह प्रवेश और वास्तु',
      spec4: 'विवाह संस्कार',

      // ── Book Pandit Page ──────────────────────────
      bookPanditTitle: 'पंडित जी बुक करें',
      bannerSub: 'खोजें और बुक करें',
      bannerTitle: 'अपने सेवा पंडित जी',
      searchPlaceholder: 'नाम, भाषा से खोजें...',

      scanQrTitle: 'QR कोड स्कैन करें',
      qrHint: 'मंगल.भाव QR कोड पर कैमरा रखें',

      availableServices: 'उपलब्ध सेवाएँ',

      statusAvailable: 'उपलब्ध',
      statusUnavailable: 'अनुपलब्ध',
      startingAt: 'शुरुआत',
      peopleBooked: 'लोगों ने बुक किया',

      tagHavan: '🔥 हवन',
      tagVedic: '📿 वैदिक',
      tagAtHome: '🏠 घर पर',

      viewSevaPhotos: 'सेवा फ़ोटो देखें',
      bookNowBtn: 'अभी बुक करें',
      notAvailable: 'उपलब्ध नहीं',

      emptyTitle: 'कोई सेवा नहीं मिली',
      emptySub: 'जल्द ही आपके पास उपलब्ध पंडित जी की जाँच करें',

      // Booking modal
      confirmBooking: '✅ बुकिंग की पुष्टि करें',
      summaryLabelPandit: 'पंडित जी',
      summaryLabelLocation: 'स्थान',
      summaryLabelDakshina: 'दक्षिणा',
      summaryLabelAboutSeva: 'इस सेवा के बारे में',
      noDescription: 'कोई विवरण उपलब्ध नहीं',
      selectPujaDate: '📅 पूजा तिथि चुनें',
      confirmBtn: 'बुकिंग की पुष्टि करें',

      // ── Footer ────────────────────────────────────
      footerTagline: 'भारत का सबसे विश्वसनीय प्लेटफॉर्म — जन्म से अंतिम संस्कार तक हर पवित्र अनुष्ठान के लिए सत्यापित पंडित बुक करें।',
      footerOm: 'ॐ नमः शिवाय',

      footerPlatform: '🙏 प्लेटफॉर्म',
      footerAbout: 'हमारे बारे में',
      footerHowWorks: 'कैसे काम करता है',
      footerAllRituals: 'सभी अनुष्ठान',
      footerCities: 'हम किन शहरों में हैं',

      footerForPandits: '🧘 पंडित जी के लिए',
      footerJoinPandit: 'पंडित जी के रूप में जुड़ें',
      footerDashboard: 'पंडित जी डैशबोर्ड',
      footerManageBookings: 'बुकिंग प्रबंधित करें',
      footerSupport: 'सहायता',

      footerLegal: '📜 कानूनी',
      footerPrivacy: 'गोपनीयता नीति',
      footerTerms: 'सेवा की शर्तें',
      footerRefund: 'धन-वापसी नीति',
      footerContact: 'संपर्क करें',

      footerCopy: '© 2026 मंगल.भाव . सर्वाधिकार सुरक्षित।',
    }
  };
  photosLoading = false;
  viewingServiceName = '';
  viewingServiceID: any = null;
  selectedBooking: any = null;
  isBookingModalOpen = false;
  BookingDate: any;
  minDate: string = new Date().toISOString();
  bookings: any = {
    BookingID: 0,
    TenantID: 0,
    PanditServiceID: 0,
    BhaktProfileID: 0,
    Status: '',
    TotalAmount: 0,
    PaymentStatus: '',
    PoojaDate: null,
    DateAdded: null,
    DateModified: null,
    UpdatedByUser: '',
  };
  Language: any;
  paramID: any;
  query!: string;
  pendingPanditUserID: any;
  pendingPanditCategoryID: any;
  pendingServiceID: any;
  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage, private route: ActivatedRoute,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) { }



  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }

  get t() {
    return this.Language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }

  async ngOnInit() {

    this.route.queryParams.subscribe(params => {
      console.log('Received ID:', params['id']);
      this.paramID = params['id'];
    });





    this.userDetails = await this.storage.get("account");
    this.Language = this.userDetails.Languages;

    if (this.paramID > 0) {

      await this.storage.remove('pendingPanditServiceID');
      this.query = `PanditServiceSelect?panditServiceID=${this.paramID}&tenantID=${this.userDetails.TenantID}`
      this.loadList();
    } else if (this.paramID == -1) {
      const rawUserID = await this.storage.get('pendingPanditUserID');
      const rawServiceID = await this.storage.get('pendingServiceID');
      this.pendingPanditCategoryID = await this.storage.get('pendingPanditCategoryID');

      console.log('rawUserID:', rawUserID);
      console.log('rawServiceID:', rawServiceID);

      this.pendingPanditUserID = rawUserID ? Number(rawUserID) : null;
      this.pendingServiceID = rawServiceID ? Number(rawServiceID) : null;

      if (this.pendingPanditUserID && this.pendingServiceID) {
        await this.storage.remove('pendingPanditUserID');
        await this.storage.remove('pendingPanditCategoryID');
        await this.storage.remove('pendingPanditServiceID');
        await this.storage.remove('pendingServiceID')
        this.query = `PanditServicesNUSelectByQuery?Query=ProfileId=${this.pendingPanditUserID} AND ServiceID=${this.pendingServiceID}`;
        console.log('Query:', this.query);
        this.loadList();
      } else {
        console.log('Missing values — UserID:', this.pendingPanditUserID, 'ServiceID:', this.pendingServiceID);
      }
    }

    else {
      this.query = `PanditServiceSelectAll?tenantID=${this.userDetails.TenantID}`;
      this.loadList();
    }
    // alert(this.Language)

    // this.api.post(`PanditServiceSelectAll?tenantID=${this.userDetails.TenantID}`,null)
    // .subscribe((res:any)=>{
    //   console.log(res.PanditServiceList)
    //   this.PanditServiceList = res.PanditServiceList;
    // })

  }

  bookingCountMap: { [key: string]: number } = {};

  // Call this after PanditServicesList is set
  loadAllBookingCounts() {
    this.PanditServicesList.forEach((item: any) => {
      this.api.post(`BookingsSelectAllByPanditServiceID?panditServiceID=${item.PanditServiceID}`, null)
        .subscribe((res: any) => {
          this.bookingCountMap[String(item.PanditServiceID)] = res.BookingList?.length || 0;
          console.log(`Service ${item.PanditServiceID} count:`, this.bookingCountMap[String(item.PanditServiceID)]);
        });
    });
  }

  // Call this once for each item after list loads
  loadBookingCount(panditServiceID: any) {
    const key = String(panditServiceID);
    if (this.bookingCountMap[key] !== undefined) return; // already loaded

    this.api.post(`BookingsSelectAllByPanditServiceID?panditServiceID=${panditServiceID}`, null)
      .subscribe((res: any) => {
        this.bookingCountMap[key] = res.BookingList?.length || 0;
        console.log(`Service ${panditServiceID} count:`, this.bookingCountMap[key]);
      });
  }

  // Called from HTML
  getBookingCount(panditServiceID: any): number {
    const key = String(panditServiceID);
    // Trigger load if not yet loaded
    if (this.bookingCountMap[key] === undefined) {
      this.bookingCountMap[key] = 0; // prevent multiple calls
      this.loadBookingCount(panditServiceID);
    }
    return this.bookingCountMap[key];
  }

  loadList() {
    //alert('bjhhvgh')

    this.api.post(
      this.query,
      null
    ).pipe(

      concatMap((res: any) => {

        const list = res?.PanditServiceList || [];

        if (!list.length) return of([]);

        // Create forkJoin call for each item
        const enrichedCalls = list.map((item: any) => {

          const service$ = this.api.post(
            `ServiceSelect?serviceID=${item.ServiceID}&tenantId=${item.TenantID}`,
            null
          );

          const location$ = this.api.post(
            `LocationSelect?locationID=${item.LocationID}&tenantID=${item.TenantID}`,
            null
          );

          const user$ = this.api.post(
            `ProfilesSelectAllByUserID?userId=${item.ProfileID}`,
            null
          );

          return forkJoin({
            serviceRes: service$,
            locationRes: location$,
            userRes: user$
          }).pipe(

            map((extra: any) => {

              const service = extra.serviceRes?.ServiceList?.[0];
              const location = extra.locationRes?.LocationList?.[0];
              const user = extra.userRes?.ProfileList?.[0];

              return {
                ...item,
                ServiceName: service ? service.Name : '',
                ServiceDescription: service ? service.Description : '',
                LocationName: location ? location.Name : '',
                UserName: user ? user.FullName : ''
              };

            })

          );

        });

        return forkJoin(enrichedCalls);

      })

    ).subscribe({

      next: (finalList: any) => {
        this.PanditServicesList = finalList;
        this.loadAllBookingCounts();
        console.log('Final Enriched List:', this.PanditServicesList);
      },

      error: (err) => {
        console.error('Error loading data:', err);
      }

    });

  }


  bookNow(item: any) {
    console.log(item)
    this.selectedBooking = item;
    console.log(this.selectedBooking)
    this.isBookingModalOpen = true;
  }

  confirmBooking() {


    // 🔥 Simple confirmation alert
    var date = this.BookingDate.split('T')[0];

    const isConfirmed = confirm(
      "Please confirm your booking:\n\n" +
      "🪔 Service: " + this.selectedBooking?.ServiceName + "\n" +
      "📍 Location: " + this.selectedBooking?.LocationName + "\n" +
      "📅 Date: " + date + "\n" +
      "💰 Dakshina: ₹ " + this.selectedBooking?.Price + "\n\n" +
      "Do you want to proceed?"
    );

    if (!isConfirmed) {
      return;
    }

    const payload = this.preparePayload();
    console.log(payload)

    date = this.BookingDate.split('T')[0]; // YYYY-MM-DD

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    this.api.post(`BookingsSelectByQuery?Query=PanditServiceID=${payload.panditServiceID} AND BhaktProfileID=${payload.bhaktProfileID} AND PoojaDate >= '${date}' AND PoojaDate < '${nextDateStr}'`,
      null
    )
      .subscribe((res: any) => {
        console.log(res.BookingList.length > 0);
        if (res.BookingList.length > 0) {
          alert('You have already booked');
        } else {
          const DBAction = 'BookingsInsert';
          this.api.post(DBAction, payload)
            .subscribe((res: any) => {
              if (res?.BookingID > 0) {
                alert('Booking Confirmed 🎉');
                this.isBookingModalOpen = false;
                //this.loadList();



                setTimeout(() => {
                  this.routerCtrl.navigateForward('/booking');
                }, 400); // delay in milliseconds
              } else {
                alert("Something went wrong ❌");
              }
            });
        }
      })
  }



  preparePayload() {
    return {
      bookingID: 0,
      tenantID: this.userDetails.TenantID,
      panditServiceID: this.selectedBooking.PanditServiceID ? Number(this.selectedBooking.PanditServiceID) : 0,
      bhaktProfileID: this.userDetails.UserID,
      status: 'REQUESTED',
      totalAmount: this.selectedBooking.Price
        ? Math.round(Number(this.selectedBooking.Price) * 100) / 100
        : 0,
      paymentStatus: 'PENDING',
      poojaDate: new Date(this.BookingDate).toISOString(),
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      updatedByUser: String(this.userDetails.UserID) || '',
    };
  }


  currentImageIndex: { [key: string]: number } = {};
  imageIntervals: { [key: string]: any } = {};

  getCleanName(serviceName: string): string {
    let cleanName = serviceName.split('/')[0].trim();
    cleanName = cleanName.replace(/\s+/g, '');
    cleanName = cleanName.replace(/[^a-zA-Z0-9]/g, '');
    return cleanName;
  }

  getServiceImages(serviceName: string): string[] {
    const cleanName = this.getCleanName(serviceName);

    return [
      `assets/img/${cleanName}.jfif`,
      `assets/img/${cleanName}2.jfif`,
      `assets/img/${cleanName}3.jfif`
    ];
  }

  startSlideshow(serviceName: string) {
    const key = this.getCleanName(serviceName);

    if (this.imageIntervals[key]) return; // avoid multiple intervals

    this.currentImageIndex[key] = 0;

    this.imageIntervals[key] = setInterval(() => {
      this.currentImageIndex[key] =
        (this.currentImageIndex[key] + 1) % 3;
    }, 300000); // change every 3 seconds
  }

  // Returns CSS class for booking status badge
  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'REQUESTED': return 'status-requested';
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-requested';
    }
  }

  // Returns CSS class for payment pill
  getPaymentClass(paymentStatus: string): string {
    switch (paymentStatus?.toUpperCase()) {
      case 'PAID': return 'payment-paid';
      case 'PENDING': return 'payment-pending';
      default: return '';
    }
  }
  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '../../assets/img/default.jpg';
    // If even default fails, use a CSS gradient placeholder
    img.onerror = null;
  }
  getCurrentImage(serviceName: string): string {
    const key = this.getCleanName(serviceName);
    const images = this.getServiceImages(serviceName);

    if (!(key in this.currentImageIndex)) {
      this.startSlideshow(serviceName);
    }

    return images[this.currentImageIndex[key] || 0];
  }


  viewServicePhotos(item: any) {
    // alert(item.PanditServiceID)
    this.viewingServiceID = item.PanditServiceID;  // adjust field if needed
    this.viewingServiceName = item.ServiceName?.split('/')[0]?.trim() || item.ServiceName;
    this.isPhotosModalOpen = true;
    this.loadServicePhotos();
  }

  closePhotosModal() {
    this.isPhotosModalOpen = false;
    this.serviceImages = [];
    this.viewingServiceID = null;
    this.viewingServiceName = '';
  }

  loadServicePhotos() {
    this.photosLoading = true;
    this.serviceImages = [];

    const query = `DocumentType = 'PanditService' and EntityType = 'PanditService' and EntityRefKey = ${this.viewingServiceID}`;

    this.api.post(`DocumentSelectByQuery?Query=${query}`, null).subscribe({
      next: (res: any) => {
        const documentList = res?.DocumentList || [];

        if (!documentList.length) {
          this.serviceImages = [];
          this.photosLoading = false;
          return;
        }

        const imageRequests = documentList.map((doc: any) =>
          this.api.getImage('DownloadImages', {
            imageName: doc.FileName,
            imagePurpose: 'PanditService'
          })
        );

        forkJoin(imageRequests).subscribe({
          next: (responses: any) => {
            this.serviceImages = responses.map((blob: any, index: number) => ({
              fileName: documentList[index].FileName,
              imageUrl: blob?.type?.startsWith('image/')
                ? URL.createObjectURL(blob)
                : 'assets/uploadfile.png'
            }));
            this.photosLoading = false;
          },
          error: (err) => {
            console.error('Error loading images:', err);
            this.photosLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
        this.photosLoading = false;
      }
    });
  }

  previewPhoto(photo: any) {
    this.previewUrl = photo.imageUrl;
    this.isPreviewOpen = true;
  }

  isExploreModalOpen = false;





  openQrScanner() {
    this.isScannerOpen = true;
  }

  closeQrScanner() {
    this.isScannerOpen = false;
  }

  onScanSuccess(result: string) {
    this.scannedQrData = result;
    this.isScannerOpen = false;

    // Parse "panditserviceid=2" → 2
    const match = result.toLowerCase().match(/panditserviceid=(\d+)/);

    if (match) {
      const serviceId = Number(match[1]);
      this.PanditServicesList = this.PanditServicesList.filter(
        (item: any) => item.PanditServiceID === serviceId
      );
    }

    console.log('Scanned QR:', this.scannedQrData);
  }

  onScanError(error: any) {
    console.error('Scan error:', error);
  }

}
