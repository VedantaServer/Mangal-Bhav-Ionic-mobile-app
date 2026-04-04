import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Api, ApiNU } from '../../providers';
import { Capacitor } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { FcmService } from '../../providers/fcm/fcm';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonInput, NavController, Platform } from '@ionic/angular';
import { Network } from '@capacitor/network';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem } from '@capacitor/filesystem';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  @ViewChild(IonContent) content!: IonContent;


  @ViewChildren('phoneInput') phoneInputs!: QueryList<any>;

  phoneDigits = new Array(10).fill('');
  isPhoneComplete = false;
  isSevaModalOpen = false;
  selectedAge: number | null = null;
  selectedServiceType: string | null = null;
  sevaTypes = [
    { icon: '🔥', label: 'Havan / Yagna', value: 'Havan' },
    { icon: '🪔', label: 'Griha Pravesh', value: 'GrihaPravesh' },
    { icon: '💍', label: 'Vivah Sanskar', value: 'Vivah' },
    { icon: '👶', label: 'Namkaran', value: 'Namkaran' },
    { icon: '🌸', label: 'Satyanarayan Katha', value: 'Satyanarayan' },
    { icon: '🕉️', label: 'Other Seva', value: 'Other' }
  ];

  isLoading = false;
  LoginTitle: string = '';
  lblSchoolName: any;
  schoolLogo: any;
  account: { password: string, username: string } = {
    password: '',
    username: ''
  };

  username: any;
  password: any;

  profilePreview: string | null = null;

  showMainSection = true;

  signupName: string = '';
  signupAge: string = '';
  showAuthLanding = false;
  showLoginSection = false;
  showRegisterSection = false;

  registerStep: 'mobile' | 'otp' | 'form' | 'role' = 'mobile';
  data: any;
  lblMessage: string = '';
  loadingData: boolean = false;
  showLoginForm: boolean = false;
  forgetPassword: string = '';
  isOnline: any = true;
  responseText!: string;
  response!: string;
  tenantForImg: any = null;
  loginArea: any = false;
  showIntro: boolean = true;
  mobileNumber: any;
  otp: any;
  selectedRole: string = '';
  userDetails: any;
  generatedOTP!: string;
  pendingPanditUserID: any;
  pendingPanditCategoryID: any;
  loginUsername: string = '';
  loginOtp: string = '';
  loginOtpSent: boolean = false;
  loginGeneratedOtp: string = '';
  referCopied = false;
  userReferCode: string = '';
  Language: any = 'English';
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

      heroTagline: 'भारत का सबसे विश्वसनीय प्लेटफॉर्म  बुक करने के लिए — जन्म से अंतिम संस्कार तक',

      samskaras: '16 संस्कार शामिल',
      verified: 'सत्यापित ',
      doorstep: 'घर तक सेवा',
      trusted: 'परिवारों का भरोसा',

      statsRituals: 'अनुष्ठान',
      statsPandits: '',
      statsFamilies: 'परिवार',
      statsCities: 'शहर',

      // ── How It Works ──────────────────────────────
      simpleProcess: 'सरल प्रक्रिया',
      howWorks: 'मंगल.भाव कैसे काम करता है',
      howSub: '3 आसान चरणों में  से जुड़ें',

      step1: 'चरण 1',
      step2: 'चरण 2',
      step3: 'चरण 3',

      how1Title: 'अनुष्ठान चुनें',
      how1Desc: '30+ पवित्र हवन और पूजा समारोहों में से चुनें — जन्म से पितृ अनुष्ठान तक। अपनी आवश्यकता के अनुसार चुनें।',

      how2Title: ' चुनें',
      how2Desc: 'अपने क्षेत्र के सत्यापित और अनुभवी  से मिलें। प्रोफ़ाइल, विशेषज्ञता, भाषा और रेटिंग देखें।',

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

  categoryList: any[] = [];
  serviceList: any[] = [];
  servicecategoryMapList: any[] = [];
  enrichedCategories: any[] = [];  // ← this drives the HTML

  serviceBookingCountMap: { [key: string]: number } = {};
  constructor(public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private fcm: FcmService,
    private plt: Platform,
    private http: HttpClient,
    public apinu: ApiNU,
    private alertCtrl: AlertController
  ) {
    // this.lblSchoolName = this.api.SchoolName;
    // this.forgetPassword = this.api.getForgetPasswordLink();
    // this.schoolLogo = this.api.getSchoolLogo();

  }

  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }


  toggleLanguage() {

    // if (this.Language === 'English') {
    //   this.Language = 'Hindi';
    // } else {
    //   this.Language = 'English';
    // }

    // this.storage.set('language', this.Language);

    // console.log("Current Language:", this.Language);

  }


  get t() {
    return this.Language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }


  async logout() {

    await this.storage.clear();
    this.routerCtrl.navigateRoot('/login');
  }




  async ngOnInit() {



    this.userDetails = await this.storage.get("account");

    this.Language = this.userDetails.Languages;
    // alert(this.Language)
    //alert(typeof(this.Language))
    // console.log(this.userDetails);
    if (
      await this.storage.get("IsUserLoggedIn") &&
      this.userDetails?.Role !== 'PANDIT'
    ) {
      this.routerCtrl.navigateRoot('/login');
    }

    await this.storage.remove('pendingPanditUserID');
    await this.storage.remove('pendingPanditCategoryID');
    await this.storage.remove('pendingPanditServiceID');
    await this.storage.remove('pendingServiceID')


    this.getAllCategories();
    this.loadPujaSection();


  }


  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


  getServiceImagePath(serviceName: string): string {
    const englishName = serviceName.split('/')[0].trim().replace(/\s+/g, '');
    return `assets/img/${englishName}.jfif`;
  }

  loadPujaSection() {
    forkJoin({
      categories: this.api.post(`ServiceCategorySelectAll?tenantID=1`, null),
      services: this.api.post(`ServiceSelectAll?tenantID=1`, null),
      mapping: this.api.post(`ServiceCategoryMappingSelectAll?tenantID=1`, null)
    }).subscribe((res: any) => {

      const categories = res.categories.ServiceCategoryList;
      const services = res.services.ServiceList;               // ✅ fixed key
      const mapping = res.mapping.ServiceCategoryMappingList; // ✅ fixed key

      // Build each category with its services attached
      this.enrichedCategories = categories.map((cat: any) => {

        const serviceIDs = mapping
          .filter((m: any) => m.CategoryID === cat.CategoryID && m.IsActive)
          .map((m: any) => m.ServiceID);

        const catServices = services.filter((s: any) => serviceIDs.includes(s.ServiceID));

        return { ...cat, services: catServices };
      });

      console.log('Enriched Categories:', this.enrichedCategories);
      this.loadAllServiceCounts();
    });
  }

  // Extract English name for image lookup
  getServiceEnglishName(fullName: string): string {
    return fullName?.split('/')?.[0]?.trim() || fullName;
  }

  // Badge per service
  getServiceBadge(serviceName: string): string {
    const n = serviceName?.toLowerCase() || '';
    if (n.includes('havan') || n.includes('homa')) return '🔥 Havan';
    if (n.includes('katha') || n.includes('path')) return '📿 Katha';
    if (n.includes('naming') || n.includes('naamkaran')) return '📛 Naming';
    if (n.includes('mundan')) return '✂️ Mundan';
    if (n.includes('annaprash')) return '🍚 First Food';
    if (n.includes('upanayan') || n.includes('thread')) return '🧵 Sacred Thread';
    if (n.includes('wedding') || n.includes('vivah')) return '💍 Vivah';
    if (n.includes('griha')) return '🏡 Griha Pravesh';
    if (n.includes('vastu')) return '🏠 Vastu';
    if (n.includes('navagraha')) return '🪐 Navagraha';
    if (n.includes('lakshmi')) return '🌼 Lakshmi';
    if (n.includes('ganesh')) return '🐘 Ganesh';
    if (n.includes('durga')) return '🦁 Durga';
    if (n.includes('antim') || n.includes('sanskar') && n.includes('antim')) return '🕯️ Antyeshti';
    if (n.includes('shraddha') || n.includes('pitru')) return '🙏 Shraddha';
    return '🔥 Puja';
  }


  getAllCategories() {
    this.api.post(`ServiceCategorySelectAll?tenantID=1`, null)
      .subscribe((res: any) => {
        this.categoryList = res.ServiceCategoryList;

        this.selectedCategory = this.categoryList[3];
      })
  }
  getAllServices() {
    this.api.post(`ServiceSelectAll?tenantID=1`, null)
      .subscribe((res: any) => {
        this.serviceList = res.ServiceList;
        //  console.log(res.ServiceList)
      })
  }

  getAllCategoryMap() {
    this.api.post(`ServiceCategoryMappingSelectAll?tenantID=1`, null)
      .subscribe((res: any) => {
        this.servicecategoryMapList = res.ServiceCategoryMappingList;
        //console.log(res.ServiceCategoryMappingList)
      })
  }


  getCategoryIcon(name: string): string {
    const n = name?.toLowerCase() || '';
    if (n.includes('birth')) return '🌱';
    if (n.includes('childhood')) return '👶';
    if (n.includes('marriage')) return '💍';
    if (n.includes('house') || n.includes('property')) return '🏡';
    if (n.includes('dosha') || n.includes('special')) return '⭐';
    if (n.includes('antim') || n.includes('death')) return '🕯️';
    if (n.includes('health')) return '🏥';
    if (n.includes('navagraha')) return '🪐';
    if (n.includes('education')) return '📚';
    return '🪔';
  }

  gotToOpenPanditPage(categoryid: any, serviceid?: any) {
    //alert(categoryid);

    this.routerCtrl.navigateRoot('/loggedin-panditsearch', {
      queryParams: {
        categoryid: categoryid,
        serviceid: serviceid || null
      }
    });
  }


  getCategoryImage(name: string): string {
    const n = name?.toLowerCase() || '';
    if (n.includes('birth')) return 'assets/img/PunsavanSanskar2.jfif';
    if (n.includes('childhood')) return 'assets/img/AnnaprashanCeremony.jfif';
    if (n.includes('marriage')) return 'assets/img/WeddingCeremony(VivahSanskar).jfif';
    if (n.includes('house') || n.includes('property')) return 'assets/img/GrihaPraveshPuja.jfif';
    if (n.includes('dosha') || n.includes('special')) return 'assets/img/GaneshPuja.jfif';
    if (n.includes('antim') || n.includes('death')) return 'assets/img/AntimSanskar.jfif';
    if (n.includes('navagraha')) return 'assets/img/NavagrahaShantiPuja3.jfif';
    if (n.includes('education')) return 'assets/img/UpanayanCeremony.jfif';
    return 'assets/img/default.jpg';
  }
  slideCarousel(carouselId: string, direction: 'prev' | 'next') {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    const cardWidth = carousel.querySelector('.puja-card')?.clientWidth || 300;
    carousel.scrollBy({ left: direction === 'next' ? cardWidth + 20 : -(cardWidth + 20), behavior: 'smooth' });
  }


  poojaList = [
    {
      title: 'Specific Poojas at Ghat / Temple',
      experience: '4 year',
      description: 'These rituals are performed at a particular temple / place of pilgrimage.',
      count: 3,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtETvui1PCLoBiaEDAs-WZGsFqom6FK20IpQ&s'
    },
    {
      title: 'Regular Poojas at Home',
      experience: '4 year',
      description: 'This includes all the poojas which are performed at home without any hassle.',
      count: 3,
      image: 'data:image/jpeg;base64,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'
    },
    {
      title: 'Virtual / Online Pooja',
      experience: '4 year',
      description: 'All the poojas which are performed at home can also be performed online.',
      count: 3,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZb1BlAoLIco497PyyLY8AG08ZSiVtoVba5A&s'
    },
    {
      title: 'Katha Vachan',
      experience: '4 year',
      description: 'Katha vachan includes keertans, bhajans and spiritual discourses.',
      count: 3,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmAqKqXthvBDnKl-t4O_t8v0qKnIJDPxd9Fw&s'
    }
  ];




  getLoginOtp() {
    if (!this.loginUsername || this.loginUsername.toString().length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    this.api.post(`UsersNUSelectByQuery?Query=LoginID=${this.loginUsername}`, null)
      .subscribe((res: any) => {
        console.log(res);
        if (res.UserList.length === 0) {
          alert('Please register..');
          return;
        } else {
          // Generate OTP
          this.loginGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
          this.loginOtpSent = true;
          alert(this.loginGeneratedOtp)
          // Send via WhatsApp
          // const url = `https://sent.wbbox.in/pinwa/pinwav1.php?apikey=3480a5d0-031b-11f0-ad4f-92672d2d0c2d&from=918448971721&to=${this.loginUsername}&type=template&templateid=813743&placeholders=${this.loginGeneratedOtp}`;

          // console.log(url);

          // this.http.get(url).subscribe(
          //   (response: any) => {
          //     console.log('Login OTP Sent Successfully', response);
          //     this.loginOtpSent = true;
          //     alert('OTP sent on WhatsApp');
          //   },
          //   (error) => {
          //     console.error('Error sending Login OTP', error);
          //     alert('Failed to send OTP. Please try again.');
          //   }
          // );
        }
      })
  }

  resendLoginOtp() {
    this.loginOtp = '';
    this.loginOtpSent = false;
    this.getLoginOtp();
  }
  // Step 2 — verify OTP then call VedantaLogin
  verifyLoginOtp() {
    if (!this.loginOtp || this.loginOtp.toString().length < 4) {
      alert('Please enter the OTP');
      return;
    }

    if (this.loginOtp.toString() !== this.loginGeneratedOtp.toString()) {
      alert('Invalid OTP. Please try again.');
      return;
    }

    // OTP matched — call login API
    this.userLogin();
  }




  userLogin() {

    this.api.post(`VedantaLogin?UserName=${this.loginUsername}`, null)
      .subscribe(async (res: any) => {
        console.log(res)
        if (res) {
          if (res.Role == 'PANDIT') {
            await this.storage.set("account", res);
            await this.storage.set("IsUserLoggedIn", "true");
            await this.storage.set("Language", res.Languages);
            this.routerCtrl.navigateRoot('/tabs/tab1');
          } else {

            await this.storage.set("account", res);
            await this.storage.set("IsUserLoggedIn", "true");
            await this.storage.set("Language", res.Languages);
            this.routerCtrl.navigateRoot('/jajmandashboard');
          }
        }
      })
  }




  onProfileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.profilePreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }






  scrollToPandit() {
    this.isSevaModalOpen = true;
  }
  skipAndScroll() {
    this.isSevaModalOpen = false;
    setTimeout(() => {
      const el = document.getElementById('pandit-section');
      if (el) {
        const yOffset = el.getBoundingClientRect().top + window.scrollY - 70;
        this.content.scrollToPoint(0, yOffset, 600);
      }
    }, 400);
  }

  confirmAndScroll() {
    console.log('Age:', this.selectedAge);
    console.log('Service Type:', this.selectedServiceType);
    this.isSevaModalOpen = false;
    setTimeout(() => {
      const el = document.getElementById('pandit-section');
      if (el) {
        const yOffset = el.getBoundingClientRect().top + window.scrollY - 70;
        this.content.scrollToPoint(0, yOffset, 600);
      }
    }, 400);
  }

  doScroll() {
    setTimeout(() => {
      document.getElementById('pandit-section')?.scrollIntoView({
        behavior: 'smooth', block: 'start'
      });
    }, 350);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '../../assets/img/default.jpg';
    // If even default fails, use a CSS gradient placeholder
    img.onerror = null;
  }

  currentImageIndex: { [key: string]: number } = {};
  imageIntervals: { [key: string]: any } = {};

  getCurrentImage(serviceName: string): string {
    //console.log(serviceName)
    const key = serviceName;
    const images = this.getServiceImages(serviceName);

    if (!(key in this.currentImageIndex)) {
      this.startSlideshow(serviceName);
    }

    return images[this.currentImageIndex[key] || 0];
  }


  getServiceImages(serviceName: string): string[] {
    const cleanName = serviceName;

    return [
      `assets/img/${cleanName}.jfif`,
      `assets/img/${cleanName}2.jfif`,
      `assets/img/${cleanName}3.jfif`
    ];
  }

  startSlideshow(serviceName: string) {
    const key = serviceName;

    if (this.imageIntervals[key]) return; // avoid multiple intervals

    this.currentImageIndex[key] = 0;

    this.imageIntervals[key] = setInterval(() => {
      this.currentImageIndex[key] =
        (this.currentImageIndex[key] + 1) % 3;
    }, 1000000); // change every 3 seconds
  }

  async explorePooja(cat: any) {
    const el = document.getElementById(cat);
    if (!el) return;

    const scrollEl = await this.content.getScrollElement();
    const yOffset = el.offsetTop - 80;

    this.content.scrollToPoint(0, yOffset, 600);
  }


  openRegisterSection() {
    this.showMainSection = false;
    this.showLoginSection = false;
    this.showRegisterSection = true;

    this.registerStep = 'mobile';
  }

  // goToOtp() {
  //   // call API to send OTP here

  //   this.api.post(`UsersNUSelectByQuery?Query=LoginID=${this.mobileNumber}`, null)
  //     .subscribe((res: any) => {
  //       console.log(res.UserList);

  //       if (res.UserList.length > 0) {
  //         alert('User Already Exists.Please login or use different mobile no.');
  //       } else {
  //         alert('Otp sent on whatsapp on registered mobile number')
  //         this.registerStep = 'otp';
  //       }
  //     })
  // }



  // verifyOtp() {


  //   if (this.otp == '123') {
  //     // this.api.post('')
  //     this.registerStep = 'role';
  //   } else {
  //     alert('Otp did not matched.Please try again.')
  //   }

  // }


  goToOtp() {
    // call API to send OTP here

    this.api.post(`UsersNUSelectByQuery?Query=LoginID=${this.mobileNumber}`, null)
      .subscribe((res: any) => {
        console.log(res.UserList);

        if (res.UserList.length > 0) {
          alert('User Already Exists.Please login or use different mobile no.');
        } else {
          alert('Otp sent on whatsapp');
          this.generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

          // const url = `https://sent.wbbox.in/pinwa/pinwav1.php?apikey=3480a5d0-031b-11f0-ad4f-92672d2d0c2d&from=918448971721&to=${this.mobileNumber}&type=template&templateid=813743&placeholders=${this.generatedOTP}`;
          const url = `https://sent.wbbox.in/pinwa/pinwav1.php?apikey=3480a5d0-031b-11f0-ad4f-92672d2d0c2d&from=918448971721&to=${this.mobileNumber}&type=template&templateid=813743&placeholders=${this.generatedOTP}`;

          console.log(url)
          this.http.get(url).subscribe(
            (response: any) => {
              console.log('OTP Sent Successfully', response);

              alert('OTP sent successfully');
            },
            (error) => {
              console.error('Error sending OTP', error);
              alert('Failed to send OTP');
            }
          );
          this.registerStep = 'otp';
        }
      })
  }




  verifyOtp(): void {

    // alert('clicked')
    if (!this.otp) {
      alert('Please enter valid otp');
      return;
    }
    //console.log(this.otp)
    // console.log(this.generatedOTP)
    // console.log(typeof(this.otp))
    //console.log(typeof(this.generatedOTP))
    if (Number(this.otp) === Number(this.generatedOTP)) {
      //  alert('correct');
      this.registerStep = 'role';
    } else {
      alert('Incorrect Otp.')
    }

  }


  async selectRole(role: string) {

    const alert = await this.alertCtrl.create({
      header: 'Confirm Selection',
      message: `Are you sure you want to continue as ${role.toUpperCase()}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Yes, Continue',
          handler: () => {
            this.confirmRole(role);
            // this.selectedRole = role;
            // this.registerStep = 'form';
          }
        }
      ]
    });

    await alert.present();
  }


  confirmRole(role: string) {
    this.selectedRole = role;

    var body = {

      "TenantID": Number(1),
      "Role": String(role),
      "LoginID": String(this.mobileNumber),
      "PasswordHash": String('Pass@123'),
      "IsLocked": Boolean(0),
      "Status": String('ACTIVE'),
      "LastLoginAt": new Date(),
      "PasswordChangedAt": new Date(),
      "DateAdded": new Date(),
      "DateModified": new Date(),
      "UpdatedByUser": String(this.mobileNumber)
    }
    this.api.post('UsersInsert', body)
      .subscribe((res: any) => {
        // console.log(res);

        alert('User Created Successfully!');


        const body = {
          profileID: 0,
          tenantID: 1,
          userID: res.UserID,
          fullName: this.signupName || '',
          dOB: new Date().toISOString(),
          gender: '',
          phoneNumber: this.mobileNumber || '',
          email: '',
          experienceYears: 0,
          bio: '',
          languages: '',
          basePrice: 0,
          profilePhotoUrl: '',
          verificationStatus: 'PENDING',
          isActive: Boolean(1),
          dateAdded: new Date().toISOString(),
          dateModified: new Date().toISOString(),
          updatedByUser: ''
        }
        this.api.post('ProfilesInsert', body).subscribe((res: any) => {
          this.api.post(`VedantaLogin?UserName=${this.mobileNumber}`, null)
            .subscribe(async (res: any) => {
              console.log(res)
              if (res) {
                if (res.Role == 'PANDIT') {
                  await this.storage.set("account", res);
                  await this.storage.set("IsUserLoggedIn", "true");
                  await this.storage.set("Language", res.Languages);
                  this.routerCtrl.navigateRoot('/tabs/tab1');
                } else {

                  await this.storage.set("account", res);
                  await this.storage.set("IsUserLoggedIn", "true");
                  await this.storage.set("Language", res.Languages);
                  this.routerCtrl.navigateRoot('/jajmandashboard');
                }
              }
            })

        })

        //  const url = `https://sent.wbbox.in/pinwa/pinwav1.php?apikey=3480a5d0-031b-11f0-ad4f-92672d2d0c2d&from=918448971721&to=${this.mobileNumber}&type=template&templateid=813743&placeholders=${this.generatedOTP}`;
        //   this.http.get(url).subscribe(
        //     (response: any) => {
        //       alert('Username and password sent on whatsapp!');
        //     },
        //     (error) => {
        //       console.error('Error sending OTP', error);
        //       alert('Failed to send OTP');
        //     }
        //   )
        // this.routerCtrl.navigateRoot('/login');
        //   this.showRegisterSection = false;
        // this.showMainSection = true;
        //this.registerStep = 'form';
      })


  }




  backToMobile() {
    this.registerStep = 'mobile';
  }

  openAuthLanding() {
    this.showMainSection = false;
    this.showAuthLanding = true;
    this.showLoginSection = false;
    this.showRegisterSection = false;
  }

  openLoginSection() {
    this.routerCtrl.navigateRoot('/jajmandashboard');
  }



  loadAllServiceCounts() {
    this.enrichedCategories.forEach((cat: any) => {
      cat.services.forEach((svc: any) => {

        this.serviceBookingCountMap[String(svc.ServiceID)] = 10; // ← default 10

        this.api.post(`PanditServicesSelectAllByServiceID?serviceID=${svc.ServiceID}`, null)
          .subscribe({
            next: (res: any) => {

              const panditServiceIDs = res.PanditServiceList?.map((p: any) => p.PanditServiceID) || [];

              if (panditServiceIDs.length === 0) {
                this.serviceBookingCountMap[String(svc.ServiceID)] = 10; // ← no pandits = 10
                return;
              }

              const bookingCalls = panditServiceIDs.map((psid: any) =>
                this.api.post(`BookingsSelectAllByPanditServiceID?panditServiceID=${psid}`, null)
              );

              forkJoin(bookingCalls).subscribe({
                next: (results: any) => {
                  const totalCount = results.reduce((sum: number, r: any) => {
                    return sum + (r?.BookingList?.length || 0);
                  }, 0);

                  // ← real count + 10
                  this.serviceBookingCountMap[String(svc.ServiceID)] = totalCount + 10;
                },
                error: () => {
                  this.serviceBookingCountMap[String(svc.ServiceID)] = 10; // ← error = 10
                }
              });
            },
            error: () => {
              this.serviceBookingCountMap[String(svc.ServiceID)] = 10; // ← error = 10
            }
          });
      });
    });
  }


  async backToMain() {
    //  this.routerCtrl.navigateRoot('/jajmandashboard')
    setTimeout(() => {
      this.content.scrollToTop(500);
    }, 100);
  }

  copyReferCode() {
    const code = `MANGAL${this.userReferCode}`;
    navigator.clipboard.writeText(code).then(() => {
      this.referCopied = true;
      setTimeout(() => this.referCopied = false, 2500);
    });
  }

  shareReferCode() {
    const code = `MANGAL${this.userReferCode}`;
    const msg = `🪔 Join me on Mangal.Bhav — India's most trusted Pandit booking app!\nUse my referral code *${code}* and get ₹50 off your first booking.\n\nDownload now: https://mangalbhav.com`;

    if (navigator.share) {
      navigator.share({ title: 'Mangal.Bhav Referral', text: msg });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  }

  isCategoryDropdownOpen = false;
  selectedCategory: any = null;

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(cat: any) {
    this.selectedCategory = cat;
    this.isCategoryDropdownOpen = false;
    // same as before — scroll to that section
    this.explorePooja(cat.CategoryName);
  }

}
