import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../services/api';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css'],
})
export class RegistrationFormComponent implements OnInit {
  @ViewChild('courseSearch', { static: false }) courseSearch: ElementRef;
  @ViewChild('searchedbatch', { static: false }) searchedbatch!: ElementRef;
  @ViewChild('formSection', { static: false }) formSection!: ElementRef;

  collegeId: any;
  courseGroupList: any;
  selectedCourseGroup: any = '';
  coursedropdown: any;
  selectedCourse: any;
  selectCourseGroupID: number;
  CoursePlanList: any[] = [];
  selectedPlan: any;
  finalSelectedCourse: any;
  finalSlectedCourseGroup: any;
  FinalselectedPlan: any;
  formSectionVisible: any = false;
  searchBatchVisible: any = false;
  registrationForm: FormGroup;
  courseSearchVisible: any = false;
  heroVisible: any = true;
  tenantId: number = 3019;
  InstructorName: any;
  startDate: any;
  classTiming: any;
  selectedFeeCategory: any;
  dayOfWeek: any;
  FeeCategoryList: any[] = [];
  selectedFeeCategoryId: number = 0;
  RegistrationID: any;
  showPopup: boolean = false;
  selectedTiming: string = '';
  filteredCoursePlanList: any[] = [];
  courseCardsVisible: boolean = false;
  selectedCategoryCode!: string;
  selectedFile: File = null;
  newFileName: string;
  selectedCourseGroupText: string = '';
  selectedInstructor: string = '';
  instructorList: string[] = [];
  timingList: string[] = [];  // timings shown only for selected instructor
  totalPaymentAmount: any;
  filteredFeeCategoryList: any[];
  RNo: any;
  showAlreadyRegistered: boolean = false;
  isLoading = false;

  constructor(private route: ActivatedRoute, private api: Api, private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.registrationForm = this.fb.group({
      studentName: ['', Validators.required],
      lastName: ['', Validators.required],
      teacherName: [''],
      classTime: [''],
      classDays: [''],
      presentAddress: ['', Validators.required],
      //  presentTel: ['', Validators.required],
      dob: ['', Validators.required],
      // permanentAddress: ['', Validators.required],
      mobileNo: ['', Validators.required],
      telNo: ['', Validators.required],
      //  guardianName: ['', Validators.required],
      //  guardianAddress: [' ', Validators.required],
      // guardianTel: ['', Validators.required],
      citizenStatus: ['', Validators.required],
      country: ['', Validators.required],
      // contactAddress: [''],
      //contactTel: [''],
      //contactMobile: [''],
      email: ['', [Validators.required, Validators.email]],
      //  feeCategory: ['', Validators.required]
      document: [null, Validators.required]
    });


    this.collegeId = this.route.snapshot.paramMap.get('id');

    this.initializeCourseGroup();
  }
  initializeFeeCategory() {
    console.log("callled")
    let url = `FeeCategorySelectAllByCollegeID?tenantID=3019&collegeID=${this.collegeId}`;

    this.api.postUrlData(url, null).subscribe((data: any) => {
      this.FeeCategoryList = data.FeeCategoryList;
      console.log("*****************", data)
    });
  }
  // onCategoryChange(event: any) {
  //   this.selectedFeeCategoryId = +event.target.value;

  //   const selectedObj = this.FeeCategoryList.find(
  //     c => c.FeeCategoryID === this.selectedFeeCategoryId
  //   );

  //   if (selectedObj) {
  //     this.selectedCategoryCode = selectedObj.CategoryCode;
  //   }

  //   //console.log("ID:", this.selectedFeeCategoryId);
  //   //console.log("Code:", this.selectedCategoryCode);
  // }


  onCategoryChange(event: any) {
    this.selectedFeeCategoryId = +event.target.value;



    let amountquery = `getTotalPayableAmount?CollegeID=${this.collegeId}&FeeCategoryID=${this.selectedFeeCategoryId}&CourseID=${this.selectedCourse}`;

    this.api.postUrlData(amountquery, null).subscribe((data: any) => {
      this.totalPaymentAmount = data[0].TotalPayableAmount;
      console.log(this.totalPaymentAmount)
    })



    const selectedObj = this.FeeCategoryList.find(
      c => c.FeeCategoryID === this.selectedFeeCategoryId
    );


    this.selectedCategoryCode = selectedObj ? selectedObj.CategoryCode : '';
    console.log(this.selectedCategoryCode)
    this.selectedTiming = ''; // reset timing
    this.filteredCoursePlanList = []; // reset filtered results

    console.log(this.CoursePlanList)
    // Build unique timings for this category
    if (this.selectedCategoryCode) {
      this.timingList = [
        ...new Set(
          this.CoursePlanList
            .filter(plan => plan.BatchType === this.selectedCategoryCode)
            .map(plan => plan.ClassTiming)
        ),
      ];
    } else {
      this.timingList = [];
    }

    // Optionally, you can auto-filter here if needed
    // this.applyFilter();
  }

  initializeCourseGroup() {

    let query = `CollegeID=${this.collegeId}`;
    let url = `CourseGroupSelectAllByQuery?tenantID=0&collegeID=0&Query=${query}`;

    this.api.postUrlData(url, null).subscribe((data: any) => {
      this.courseGroupList = data.CourseGroupList;
    });
  }
  loadCourseDetails(id: number) {
    // Example API call
    let query = `FK_CourseGroupID=${id}`;
    let url = `CourseSelectAllByQuery?tenantID=0&Query=${query}`;
    this.api.postUrlData(url, null).subscribe((data: any) => {
      //  console.log("Course Details:", data);

      this.coursedropdown = data.CourseList;
      console.log(this.coursedropdown)
    });

  }
  onCourseGroupChange(event: any) {
    // 1️⃣ ID for API
    this.selectedCourseGroup = +event.target.value;
    this.selectCourseGroupID = this.selectedCourseGroup; // your existing logic

    // 2️⃣ Displayed text
    this.selectedCourseGroupText = event.target.selectedOptions[0].text;

    // 3️⃣ Call your function
    this.loadCourseDetails(this.selectedCourseGroup);
  }
  searchCoursePlan(courseID) {
    this.selectedCourse = courseID;
    console.log("Selected Course ID:", this.selectedCourse);
    console.log(this.selectedFeeCategoryId)


    // let amountquery = `getTotalPayableAmount?CollegeID=${this.collegeId}&FeeCategoryID=${this.selectedFeeCategoryId}&CourseID=${this.selectedCourse}`;

    // this.api.postUrlData(amountquery, null).subscribe((data: any) => {
    //   this.totalPaymentAmount = data[0].TotalPayableAmount;
    //   console.log(this.totalPaymentAmount)
    // })

    this.initializeFeeCategory();
    this.searchBatchVisible = true;
    let query = `FK_CourseGroupID=${this.selectedCourse}`;
    let url = `CoursePlanSelectAllByQuery?tenantID=3019&Query=${query}`;
    this.api.postUrlData(url, null).subscribe((data: any) => {
      //   console.log("Course Plan Details:", data);
      this.CoursePlanList = data.CoursePlanList;
      // Assuming you already have these lists:
      console.log(this.CoursePlanList);
      console.log(this.FeeCategoryList);

      // Extract all batch types from course plan list
      const batchTypes = this.CoursePlanList.map(plan => plan.BatchType);

      // Filter fee categories based on matching category codes
      this.filteredFeeCategoryList = this.FeeCategoryList.filter(
        cat => batchTypes.includes(cat.CategoryCode)
      );

      console.log(this.filteredFeeCategoryList);

      // Initially show none
      this.filteredCoursePlanList = [];
    });

    setTimeout(() => {
      this.scrollToSearchedBatch();
    }, 100);

    this.courseCardsVisible = false;




  }
  // onInstructorChange() {
  //   // Reset timing when instructor changes
  //   this.selectedTiming = '';

  //   if (this.selectedInstructor) {
  //     // Build timings only for selected instructor and matching batch type
  //     this.timingList = [
  //       ...new Set(
  //         this.CoursePlanList
  //           .filter(plan =>
  //             plan.InstructorName === this.selectedInstructor &&
  //             plan.BatchType === this.selectedCategoryCode
  //           )
  //           .map(plan => plan.ClassTiming)
  //       )
  //     ];
  //   } else {
  //     this.timingList = [];
  //   }
  // }

  // applyFilter() {
  //   let filtered = [...this.CoursePlanList];

  //   if (this.selectedInstructor) {
  //     filtered = filtered.filter(plan => plan.InstructorName === this.selectedInstructor);
  //   }

  //   if (this.selectedTiming) {
  //     filtered = filtered.filter(plan => plan.ClassTiming === this.selectedTiming);
  //   }

  //   this.filteredCoursePlanList = filtered;
  // }

  applyFilter() {
    let filtered = [...this.CoursePlanList];

    if (this.selectedCategoryCode) {
      filtered = filtered.filter(plan => plan.BatchType === this.selectedCategoryCode);
    }

    if (this.selectedTiming) {
      filtered = filtered.filter(plan => plan.ClassTiming === this.selectedTiming);
    }

    this.filteredCoursePlanList = filtered;
  }

  goToCourses() {
    if (this.selectedCourseGroup) {
      this.courseSearchVisible = false;
      this.courseCardsVisible = true;
    } else {
      alert("Please select a course group first!");
    }
  }
  selectPlan(plan: any) {
    this.FinalselectedPlan = plan;




    this.InstructorName = plan.InstructorName
    this.startDate = plan.StartDate;
    this.classTiming = plan.ClassTiming;
    this.dayOfWeek = plan.DayOfWeek;
    console.log(this.dayOfWeek)
    console.log(this.startDate);
    console.log(this.classTiming);
    console.log(this.dayOfWeek);
    console.log(this.InstructorName);


    // 1️⃣ Load course
    let query = `courseID=${this.selectedCourse}`;
    let url = `CourseSelectAllByQuery?tenantID=0&Query=${query}`;
    this.api.postUrlData(url, null).subscribe((data: any) => {
      this.finalSelectedCourse = data.CourseList[0];
    });

    // 2️⃣ Load course group
    let query2 = `courseGroupID=${this.selectCourseGroupID}`;
    let url2 = `CourseGroupSelectAllByQuery?tenantID=0&collegeID=0&Query=${query2}`;
    this.api.postUrlData(url2, null).subscribe((data: any) => {
      this.finalSlectedCourseGroup = data.CourseGroupList[0];
    });

    this.searchBatchVisible = false;
    this.formSectionVisible = true;


    setTimeout(() => {
      this.scrollToFormSection();
    }, 100);

  }
  get selectedCourseName(): string {
    const course = this.coursedropdown.find(c => c.CourseID === this.selectedCourse);
    return course ? course.CourseName : '';
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;
      console.log("Selected file:", this.selectedFile);

      // 👇 update reactive form control
      this.registrationForm.patchValue({
        document: file
      });

      this.registrationForm.get('document').updateValueAndValidity();
    }
  }


  onRegisterClick() {
    if (this.registrationForm.invalid) {
      // show errors and block submit
      this.registrationForm.markAllAsTouched();
      return;
    }
    // console.log("Selected course:", this.finalSelectedCourse);
    // console.log("Selected group:", this.finalSlectedCourseGroup);
    // console.log("Selected Plan:", this.FinalselectedPlan);
    // console.log("Form Data:", this.registrationForm.value);
    const body = {
      TenantID: this.tenantId || 3019,
      CollegeID: this.collegeId || 0,
      AcademicSessionID: this.FinalselectedPlan.AcademicSessionID,
      FK_CourseGroupID: this.finalSelectedCourse.CourseID,
      FirstName: this.registrationForm.value.studentName || '',
      MiddleName: '',
      LastName: this.registrationForm.value.lastName,
      PhotoImage: null,
      DateOfBirth: this.registrationForm.value.dob || null,
      RegistrationNumber: '',
      RegistrationDate: new Date().toISOString(),
      Gender: '',
      GuardianName: '',//this.registrationForm.value.guardianName
      FathersEducation: '',
      MothersEducation: '',
      RegistrationAmount: 0, // number not string
      AdmissionConsultantID: 0, // int not string
      Strengths: '',
      OtherInterests: '',
      AnyPhysicalDifficulty: '',
      PreviousCollege: '',
      PreviousCourse: '',
      IsHosteller: false, // boolean
      Address: this.registrationForm.value.presentAddress,
      Country: this.registrationForm.value.citizenStatus || ' ',
      State: '',
      City: '',
      ZipPostal: '',
      EmailAddress: this.registrationForm.value.email || ' ',
      HomeAddress: ' ',//this.registrationForm.value.guardianAddress 
      CompanyAddress: '',
      HomeCity: '',
      CompanyCity: '',
      HomeState: '',
      CompanyState: '',
      HomeCountry: '',
      CompanyCountry: '',
      HomeEmail: '',
      CompanyEmail: '',
      HomePhone: this.registrationForm.value.telNo,
      CompanyPhone: '',
      HomeMobile: '',//this.registrationForm.value.guardianTel
      CompanyMobile: '',
      CompanyName: '',
      FatherOccupation: '',
      HomeZip: '',
      CompanyZip: '',
      PhoneNumbers: this.registrationForm.value.mobileNo,
      Category: '',
      FK_FeeCategoryID: Number(this.selectedFeeCategoryId) || 0, // int
      AdminRemarks: '',
      RegistrationStatus: '',
      PastExperience: '',
      FirstLocationChoice: '',
      SecondLocationChoice: '',
      DateAdded: new Date().toISOString(),
      DateModified: new Date().toISOString(),
      UpdatedByUser: '',
      LeadID: 0, // int not ''
      CoursePlanID: this.FinalselectedPlan.CoursePlanID || 0,
      Religion: '',
      IsMinority: false, // boolean not string
      MinorityType: '',
      BankName: '',
      BankAccountNumber: '',
      BankIFSCCode: '',
      IsPhysicalChallenged: false, // boolean
      PhysicalChallengedType: '',
      Medium: '',
      IsDonor: false, // boolean
      DonorType: '',
      Quota: '',
      Aadharnumber: this.registrationForm.value.country || '',
      GeographicalArea: '',
      District: '',
      BankAccountholdername: '',
      RegistrationUniqueID: '',
      Fk_CourseSemesterID: 0, // int
      BirthTime: '',
      BirthHour: '',
      BirthMinute: '',
      IsDay: false, // boolean
      BirthMonth: '',
      BirthLagna: '',
      BirthLagnaVeda: '',
      Party: '',
      Wise: '',
      Gotra: '',
      Vedas: '',
      Language: '',
      ArmyNo: '',
      Armyrank: '',
      ArmyStatus: '',
      QualifyingTestDetail: '',
      BirthPlace: '',
      HighestQualification: '',
      RegistrationAcademicSessionID: this.FinalselectedPlan.AcademicSessionID || 0,
      Defence: '',
      UnivApplicationNo: '',
      IPRank: '',
      EnrollmentNo: '',
      FatherUniCorps: '',
      ARMSServes: '',
      WardofWarWidow: false, // boolean
      GallantryAward: '',
      PariticularsofArmy: '',
      MaritalStatus: false, // boolean
      BloodGroup: '',
      RegnNoExamType: '',
      ScoreRankPercentile: '',
      Educationalloan: false, // boolean
      regimentName: '',
      battalionName: ''
    };


    this.api.postUrlData(`RegistrationSelectAllByQuery?TenantID=${this.tenantId}&CollegeID=${this.collegeId}&Query=PhoneNumbers='${this.registrationForm.value.mobileNo}'`, null)
      .subscribe((res: any) => {
        //  console.log(res.RegistrationList.length);
        if (res.RegistrationList.length > 0) {
          this.showAlreadyRegistered = true;
          return;
        }
        this.isLoading = true;
        const url2 = `DocumentInsert`;
        const url = `RegistrationInsert`;
        // POST request
        this.api.postUrlData(url, body).subscribe(
          (res: any) => {
            //console.log(res)
            //console.log('Registration successful, ID:', res.RegistrationID);
            this.RegistrationID = res.RegistrationID;



            this.api.uploadFiles([this.selectedFile], 'Registration', this.RegistrationID, 'RegistrationForm').subscribe((res: any) => {

              const documentBody = {
                tenantID: this.tenantId || 3019,
                collegeID: this.collegeId || 0,
                documentType: 'Regitration Form',
                entityType: 'Regitration',
                entityRefKey: this.RegistrationID,
                description: 'Regitration',
                fileName: res.FileName,
                dateAdded: new Date().toISOString(),
                dateModified: new Date().toISOString(),
                updatedByUser: ' ',
              }

              this.api.postUrlData(url2, documentBody).subscribe((res: any) => {
                console.log(res)
              });
              this.showPopup = true; // show the popup
            })

            this.api.postUrlData(`RegistrationSelectAllByQuery?tenantID=${this.tenantId}&collegeID=${this.collegeId}&Query=RegistrationID=${this.RegistrationID}`, null).subscribe((res: any) => {
              console.log(res.RegistrationList[0].RegistrationNumber)
              this.RNo = res.RegistrationList[0].RegistrationNumber
            })

          },
          (err) => {
            console.error('Registration failed', err);
          }
        );
      })
  }

  closePopup() {
    this.showPopup = false;
  }
  makePayment() {
    window.location.href = `https://colleges.vedantaerpserver.com/pages/OnlineRegistrationPayment.aspx?RegistrationID=${this.RegistrationID}`;
  }
  goBackToCourseSearch() {
    this.selectedCourseGroup = '';
    this.selectedFeeCategoryId = null;
    this.courseSearchVisible = true;
    this.courseCardsVisible = false;
  }
  goBackToCourseCardsVisible() {
    this.filteredCoursePlanList = [];
    this.CoursePlanList = [];
    this.selectedInstructor = '';
    this.selectedTiming = '';
    this.selectedCourse = null;
    this.searchBatchVisible = false;
    this.courseCardsVisible = true;
  }
  goBackToSearchBatchVisible() {
    this.selectedInstructor = '';
    this.selectedTiming = '';
    this.formSectionVisible = false;
    this.searchBatchVisible = true;
  }
  onResetClick() {
    // Reload the current page
    window.location.reload();
  }
  scrollToSearchedBatch() {
    if (this.searchedbatch) {
      this.searchedbatch.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  scrollToFormSection() {
    if (this.formSection) {
      this.formSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  scrollToCourseSearch() {

    this.courseCardsVisible = true;

    setTimeout(() => {
      this.courseSearch.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100); // delay 100ms, you can adjust as needed


    this.heroVisible = false;

  }
}
