import { Component, AfterViewInit, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';
import { User } from '../../app/models/user'
import { GridComponent, Smart, GridColumn } from 'smart-webcomponents-angular/grid';
import { AccordionComponent, AccordionItemComponent, AccordionExpandMode } from 'smart-webcomponents-angular/accordion';
import { SplitterComponent } from 'smart-webcomponents-angular/splitter';
import { Api, keys } from '../services/api';
import { DomSanitizer } from '@angular/platform-browser';
import { DropDownListComponent } from 'smart-webcomponents-angular/dropdownlist';
import { GlobalSelectedOrg, OrganizationService } from '../services/organization.service';
import { BreadcrumbService } from '../breadcrum/breadcrumbService';

export interface UserService {
  ServiceName: any;
  name: string;
  // Add other properties as needed
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']

})
export class DashboardComponent implements AfterViewInit, OnInit {
  @ViewChild('accordion', { read: AccordionComponent, static: false }) accordion: AccordionComponent;
  @ViewChild('grid', { read: GridComponent, static: false }) grid: GridComponent;
  @ViewChild('splitter', { read: SplitterComponent, static: false }) splitter: SplitterComponent;
  @ViewChild('dropdownlist', { read: DropDownListComponent, static: false }) dropdownlist!: DropDownListComponent;

  currentUser: User;
  globalOrg: GlobalSelectedOrg;
  Location = [];
  ServiceList = [];
  running: boolean = false;
  UserServiceList: UserService[] = [];
  filteredUserServiceList: UserService[] = [];
  search: string = '';
  placeholder: 'Search Subscribe Softwares';
  IsAdminUser = localStorage.getItem('IsAdminUser');
  originalUserServiceList: any;
  showGarph: any;
  selectedSchool: any;
  ServiceCatalogID: any;
  StudentData: any = [];
  CollegeData: any[] = [];
  StaffData: any = [];
  ActiveUserData: any = [];
  ExamData: any = [];
  dataSourceStudentGraph: {};
  UserRoleData: any = [];
  schoolWiseRoleData: any;
  StandardSectionData: any = [];
  sectionWisegroupedData: { ClassName: string; ClassSection: string; StudentCount: number; }[];
  dataSourceSectionWiseStrengthGraph: {};
  GenderWisegroupedData: any;
  dummySourceSubjectGraph: { chart: { caption: string; subCaption: string; numberPrefix: string; showPercentInTooltip: string; decimals: string; useDataPlotColorForLabels: string; theme: string; }; data: { label: string; value: string; }[]; };
  selectedSchoolPerormance: any;
  schoolWiseStudentCount: { SchoolID: number; SchoolName: string; StudentCount: number; }[];
  schoolWiseUserRoleData: { SchoolID: number; SchoolName: string; RoleID: number; RoleName: string; RoleCount: number; }[];
  dataSourceStaffGraph: { chart: { caption: string; subCaption: string; numberPrefix: string; showPercentInTooltip: string; decimals: string; useDataPlotColorForLabels: string; theme: string; }; data: { label: string; value: string; }[]; };
  StudentGraphSection: boolean = true;
  StaffGraphSection: boolean = false;
  StaffSchoolWiseGroupedData: any = [];
  dataSourceRoleGraph: { chart: { caption: string; subCaption: string; numberPrefix: string; showPercentInTooltip: string; decimals: string; useDataPlotColorForLabels: string; theme: string; }; data: { label: string; value: string; }[]; };
  UserData: any = [];
  selectedSchoolName: any;
  selectedCollege: any;
  CollegeCount: any = 0;
  studentAttendanceCount: any;
  studentAttendanceData: any;
  totalStudent: any;
  TotalMale: number;
  TotalFemale: number;
  groupedData: {};
  chartDataByType: any[];
  fusionChartsDataByType: any;
  dataSourceStudentAttendance: { chart: { caption: string; subCaption: string; xAxisName: string; yAxisName: string; theme: string; paletteColors: string; showValues: string; numberSuffix: string; chartBottomMargin: string; }; data: { label: string; value: any; }[]; };
  periodGroups: {};
  dataSourcePeriodAttendance: { chart: { caption: string; xAxisName: string; yAxisName: string; theme: string; paletteColors: string; showValues: string; numberSuffix: string; }; data: { label: string; value: number; }[]; };
  fusionChartsDataBySubject: { subjectName: string; dataSource: { chart: { caption: string; xAxisName: string; yAxisName: string; theme: string; }; data: { label: string; value: string; }[]; }; }[];
  fusionChartDataBySubject: {
    chart: { caption: string; xAxisName: string; yAxisName: string; theme: string; }; categories: { category: { label: string; }[]; }[]; dataset: {
      seriesname: string; data: { value: number; }[]; color: string; // customize colors
    }[];
  };


  constructor(private route: ActivatedRoute, private router: Router, private api: Api, private cdr: ChangeDetectorRef,
    private authenticationService: AuthService, private sanitizer: DomSanitizer, private OrganizationS: OrganizationService, private breadcrumbService: BreadcrumbService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    title: 'Grade Book';
    this.OrganizationS.currentOrg.subscribe(item => this.globalOrg = item);
  }

  ngOnInit(): void {

    this.StudentCountData();
    this.CollegeCountData();
    this.StaffCountData();
    this.ActiveUserCountData();
    this.ExamCountData();
    this.AttendanceCountData();
    this.loadAttendanceSummary();

    //this.RoleCountData();

    //this.StandardSection();
    //this.SchoolGenderWiseData();
    //this.DummySchoolWiseSubjectAnalysisGraphData();
    this.showGarph = 'StudentGraph';
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  ngAfterViewInit(): void {
    this.init();
    this.getInstallationData();
    this.breadcrumbService.clearBreadcrumbs();
    this.running = false;
  }

  init(): void {

  }

  Imageuploadpage(orgID: any) {
    this.router.navigate(['image-upload/Organization/' + orgID]);
  }

  getLogoImage(imageUrl: string) {
    return this.api.prepareImagePath(imageUrl, "logo");
  }

  getInstallationData() {
    this.running = true;
    //this.api.postUrlData('UserServiceSelectAllByUserInfoID?userInfoID=' + localStorage.getItem(keys.userInfoID), null)
    //  .subscribe(result => {
    //    this.UserServiceList = result.UserServiceList;//Original Loaded data
    //    this.filteredUserServiceList = this.UserServiceList; // Initialize filtered list
    //    this.running = false;
    //  });
  }
  searchData(event: any) {
    this.running = true;
    //this.filteredUserServiceList = this.UserServiceList.filter((userService: UserService) => {
    //  this.running = false;
    //  if (this.search) {
    //    return userService.ServiceName.toLowerCase().includes(this.search.toLowerCase());
    //  } else {
    //    return userService.ServiceName;
    //  }

    // });
  }

  viewComponent(id: any) {
    //this.api.postUrlData("ServiceCatalogSelect?ServiceCatalogID=" + id, null)
    //  .subscribe((data: any) => {
    //    data.ServiceCatalogList.forEach(item => this.ServiceList.push({ label: item.ComponentName }));
    //    const firstItem = this.ServiceList[0];
    //    if (firstItem) {
    //      this.api.setbreadCrumb(0, 'Dashboard', '/dashboard', 0);
    //      this.router.navigate([firstItem.label]);
    //    }
    //  });
    this.ServiceList = [];
  }

  ShowGraphData(graphType: any) {
    this.showGarph = graphType;
    if (this.showGarph === 'StudentGraph') {
      //this.StudentGraphSection = true;
      this.StudentCountData();
      //  this.StaffGraphSection = false;
    } else if (this.showGarph === 'StaffGraph') {
      this.StaffGraphSection = true;
      this.StaffCountData();
      this.StudentGraphSection = false;
    }
  }

  CollegeCountData() {
    this.api.postUrlData("CollegeSelectAllByTenantID?TenantID=" + this.currentUser.tenantID, null)
      .subscribe((data: any) => {
        this.CollegeData = data.CollegeList;
        this.CollegeCount = this.CollegeData.length;
        if (this.CollegeData.length > 0) {
          this.selectedCollege = this.CollegeData[0].CollegeID;
          this.selectedCollege = this.CollegeData.find(item => item.CollegeID === parseInt(this.selectedCollege)).ShortName;
        }
      });
  }

  StandardSection() {
    this.api.postUrlData("StandardSelectAllByTenantID?TenantID=" + this.currentUser.tenantID, null).subscribe((data: any) => {
      this.StandardSectionData = data.StandardList;
    })
  }

  StudentCountData() {
    /*console.log(localStorage.getItem('IsHeadOffice'));*/
    let query = "TenantID=" + this.currentUser.tenantID;
    this.api.postUrlData("StudentSelectAllByQuery?Query=" + query, null).subscribe((data: any) => {
      console.log(data)
      this.StudentData = data.StudentList;
      //  const groupedData = this.groupStudentCountBySchool(this.StudentData);
      //this.schoolWiseStudentCount = groupedData;
      //this.sectionWisegroupedData = this.groupStudentCountBySchoolAndSection(this.StudentData);
      this.GenderWisegroupedData = this.SchoolGenderWiseData();
    });
  }

  groupStudentCountBySchool(studentList: any[]): { SchoolID: number; SchoolName: string; StudentCount: number }[] {
    if (!Array.isArray(studentList)) {
      console.error('Invalid data format received from API');
      return [];
    }

    // Group students by SchoolID and calculate the count
    const groupedData = studentList.reduce((acc, student) => {

      let schoolName = this.CollegeData.find(item => item.SchoolID === student.SchoolID);
      const school = acc.find(item => item.SchoolID === student.SchoolID);
      if (school) {
        school.StudentCount += 1;
      } else {
        acc.push({ SchoolID: student.SchoolID, SchoolName: schoolName.ShortName, StudentCount: 1 });
      }
      return acc;
    }, [] as { SchoolID: number; SchoolName: string; StudentCount: number }[]);

    return groupedData;
  }

  StaffCountData() {
    let query = "TenantID=" + this.currentUser.tenantID;
    this.api.postUrlData("StaffSelectAllByQuery?Query=" + query, null).subscribe((data: any) => {
      this.StaffData = data.StaffList;
      const groupedData = this.groupStaffCountBySchool(this.StaffData);
      this.StaffSchoolWiseGroupedData = groupedData;
      this.dataSourceStaffGraph = {
        "chart": {
          "caption": "School Wise Staff Strength",
          "subCaption": "",
          "numberPrefix": "",
          "showPercentInTooltip": "0",
          "decimals": "1",
          "useDataPlotColorForLabels": "1",
          "theme": "fusion"
        },
        data: groupedData.map(item => ({
          label: item.SchoolName,
          value: item.StaffCount.toString()
        }))
      }
    });
  }

  groupStaffCountBySchool(staffData: any[]): { SchoolID: number; SchoolName: string; StaffCount: number }[] {
    let SchoolWiseStaffData = staffData.reduce((array, data) => {
      const schoolName = this.CollegeData.find(item => item.SchoolID === data.SchoolID);
      const school = array.find(item => item.SchoolID === data.SchoolID);

      if (school) {
        school.StaffCount += 1;
      } else {
        array.push({ SchoolID: data.SchoolID, SchoolName: schoolName.ShortName, StaffCount: 1 });
      }
      return array;
    }, [] as { SchoolID: number; SchoolName: string; StaffCount: number }[]);

    return SchoolWiseStaffData;
  }


  ActiveUserCountData() {
    let query = "TenantID=" + this.currentUser.tenantID;
    this.api.postUrlData("UserSelectAllByQuery?Query=" + query, null).subscribe((data: any) => {
      this.ActiveUserData = data.UserList;

    });
  }

  AttendanceCountData() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    const todayDate = `${yyyy}-${mm}-${dd}`;

    // Build the query string
    let query = `TenantID=${this.currentUser.tenantID} AND CONVERT(date, Date) = CONVERT(date,'${todayDate}')`;
    this.api.postUrlData("AttendanceSelectAllByQuery?Query=" + query, null).subscribe((data: any) => {
      this.studentAttendanceData = data.AttendanceList
    });



    let query1 = `CollegeID=${localStorage.getItem('CollegeID')}`;
    this.api.postUrlData(`rptDateWiseCourseAttendance?CollegeID=${localStorage.getItem('CollegeID')}`, null).subscribe((data: any) => {
      console.log(data)



      const grouped: Record<string, Record<string, number>> = {};

      data.forEach(item => {
        const subject = (item.SubjectName || 'Unknown').toString().trim();
        const course = (item.CoursePlanType || 'Unknown').toString().trim();

        // determine numeric value to sum
        const rawVal = item.StudentCount;
        const val = Number(rawVal);
        const add = Number.isFinite(val) ? val : 0;

        if (!grouped[subject]) grouped[subject] = {};
        if (!grouped[subject][course]) grouped[subject][course] = 0;
        grouped[subject][course] += add;
      });

      console.log(grouped)




      const subjects = Object.keys(grouped); // ["GynaeObstTheory", "PaediatricsTheory"]
      const labels = Object.keys(grouped[subjects[0]]); // ["MBBS-2021", "MBBS-2023"]

      // FusionCharts dataset like your Chart.js 'datasets'
      const datasets = labels.map((label, index) => ({
        seriesname: label,
        data: subjects.map(subject => ({ value: grouped[subject][label] })),
        color: ['#1f77b4', '#ff7f0e', '#2ca02c'][index % 3] // customize colors
      }));

      // Categories for x-axis
      const categories = [{
        category: subjects.map(subject => ({ label: subject }))
      }];

      // Complete FusionCharts data source
      this.fusionChartDataBySubject = {
        chart: {
          caption: "Subjects by Batch",
          xAxisName: "Subject",
          yAxisName: "Count",
          theme: "fusion"
        },
        categories: categories,
        dataset: datasets
      };













      this.groupedData = {};

      data.forEach(item => {
        const type = item.CoursePlanType;
        if (type) {
          if (!this.groupedData[type]) {
            this.groupedData[type] = [];
          }
          this.groupedData[type].push(item);
        }
      });


      this.periodGroups = {};

      // Loop through the data
      data.forEach(item => {
        const period = item.PeriodNumber;

        if (period != null) {
          // Initialize the array for this PeriodNumber if it doesn't exist
          if (!this.periodGroups[period]) {
            this.periodGroups[period] = [];
          }

          // Add the item to this PeriodNumber group
          this.periodGroups[period].push(item);
        }
      });

      console.log(this.periodGroups);

      const periodAttendance: { [key: string]: number } = {};


      this.studentAttendanceData.forEach(item => {
        const period = item.PeriodNumber;
        if (!periodAttendance[period]) {
          periodAttendance[period] = 0;
        }
        // Assuming each record represents one student present
        periodAttendance[period] += 1;
      });

      console.log(periodAttendance)
      // Convert to FusionCharts dataSource format
      this.dataSourcePeriodAttendance = {
        chart: {
          caption: "Period-wise Attendance",
          xAxisName: "Period Number",
          yAxisName: "Number of Students Present",
          theme: "fusion",
          paletteColors: "#0075c2,#1aaf5d,#f2c500,#f45b00,#8e0000",
          showValues: "1",
          numberSuffix: " students"
        },
        data: Object.keys(periodAttendance).map(period => ({
          label: `Period ${period}`,
          value: periodAttendance[period]
        }))
      };

      // Prepare FusionCharts data
      this.prepareFusionChartsData();
    });
  }

  loadAttendanceSummary() {
    this.api.postUrlData(`rptAttendanceSummary?TenantID=${this.currentUser.tenantID}`, null)
      .subscribe((data: any) => {
        console.log(data); // check the output

        // Assuming data is an array of objects as you showed
        const attendance = data[0];

        // Prepare FusionCharts dataSource
        this.dataSourceStudentAttendance = {
          chart: {
            caption: `Attendance Summary - ${attendance.CourseName}`,
            subCaption: '',
            xAxisName: "Type",
            yAxisName: "Count",
            theme: "fusion",
            paletteColors: "#007bff,#28a745,#fd7e14",
            showValues: "1",
            numberSuffix: "",
            chartBottomMargin: "50"
          },
          data: [
            { label: "Today", value: attendance.DayCount },
            { label: "Week", value: attendance.WeekCount },
            { label: "Month", value: attendance.MonthCount }
          ]
        };
      });
  }

















  prepareFusionChartsData() {
    this.fusionChartsDataByType = [];

    for (const type in this.groupedData) {
      const chartData = this.groupedData[type].map(item => ({
        label: item.SubjectName,     // X-axis
        value: item.StudentCount     // Y-axis
      }));

      this.fusionChartsDataByType.push({
        coursePlanType: type,
        dataSource: {
          chart: {
            caption: `${type} - Student Attendance`,
            xAxisName: "Subjects",
            yAxisName: "Student Count",
            theme: "fusion",
            showValues: "1"
          },
          data: chartData
        }
      });
    }

    console.log(this.fusionChartsDataByType);
  }



  ExamCountData() {
    let query = "TenantID=" + this.currentUser.tenantID;
    this.api.postUrlData("ExamSelectAllByQuery?Query=" + query, null).subscribe((data: any) => {
      this.ExamData = data.ExamList;

    });
  }

  RoleCountData() {
    let query = "TenantID=" + this.currentUser.tenantID;
    this.api.postUrlData("UserRoleSelectAllByQuery?Query=" + query, null).subscribe((data: any) => {
      this.UserRoleData = data.UserRoleList;
      this.UserCountData();
    });
  }

  UserCountData() {
    let query = "TenantID=" + this.currentUser.tenantID;
    this.api.postUrlData("UserSelectAllByQuery?Query=" + query, null).subscribe((result: any) => {
      this.UserData = result.UserList;
      const groupedData = this.SchoolWiseRole(this.UserData);
      this.schoolWiseUserRoleData = groupedData;
      this.dataSourceRoleGraph = {
        "chart": {
          "caption": "School Wise Role Strength",
          "subCaption": "",
          "numberPrefix": "",
          "showPercentInTooltip": "0",
          "decimals": "1",
          "useDataPlotColorForLabels": "1",
          "theme": "fusion"
        },
        data: groupedData.map(item => ({
          label: item.RoleName,
          value: item.RoleCount.toString()
        }))
      }
    });
  }

  SchoolWiseRole(UserRoleCount: any[]): { SchoolID: number; SchoolName: string; RoleID: number; RoleName: string; RoleCount: number }[] {
    let selectedSchoolUserRoleCount = UserRoleCount.filter(item => item.SchoolID === parseInt(this.selectedSchool));
    let SchoolWiseRoleData = selectedSchoolUserRoleCount.reduce((array, data) => {
      const schoolName = this.CollegeData.find(item => item.SchoolID === data.SchoolID);
      const roleSelected = this.UserRoleData.find(item => item.RoleID === data.FK_RoleID)
      const school = array.find(item => item.SchoolID === data.SchoolID && item.RoleID === data.FK_RoleID);

      if (school) {
        school.RoleCount += 1;
      } else {
        array.push({ SchoolID: data.SchoolID, SchoolName: schoolName.ShortName, RoleID: roleSelected.RoleID, RoleName: roleSelected.Role, RoleCount: 1 });
      }
      return array;
    }, [] as { SchoolID: number; SchoolName: string; RoleID: number; RoleName: string; RoleCount: number }[]);

    return SchoolWiseRoleData;
  }


  SchoolSectionWiseData() {
    //Group students by SchoolID and SectionID and calculate the count
    let studentListSelected = this.StudentData.filter(item => item.SchoolID === parseInt(this.selectedSchool));
    console.log(studentListSelected);
    const groupedData = studentListSelected.reduce((acc, student) => {
      const schoolName = this.CollegeData.find(item => item.SchoolID === parseInt(this.selectedSchool));
      const sectionName = this.StandardSectionData.find(item => item.StandardID === student.FK_StandardID);
      const existingEntry = acc.find(item => item.SchoolID === student.SchoolID && item.ClassName === sectionName.ClassName && item.ClassSection === sectionName.ClassSection);
      if (existingEntry) {
        existingEntry.StudentCount += 1;
      } else {
        acc.push({ SchoolID: student.SchoolID, SchoolName: schoolName.ShortName, ClassName: sectionName.ClassName, ClassSection: sectionName.ClassSection, StudentCount: 1 });
      }
      return acc;
    }, [] as { SchoolID: number; SchoolName: string; ClassName: string; ClassSection: string; StudentCount: number }[]);
    this.sectionWisegroupedData = groupedData;
    this.selectedSchoolName = this.CollegeData.find(item => item.SchoolID === parseInt(this.selectedSchool)).ShortName;
    this.SchoolGenderWiseData();
    this.UserCountData();
    return groupedData;
  }

  dataSourceGenderGraph: any;

  SchoolGenderWiseData() {
    if (!this.StudentData || this.StudentData.length === 0) {
      this.TotalMale = 0;
      this.TotalFemale = 0;
    } else {
      const genderCount = this.StudentData.reduce(
        (acc, student) => {
          if (student.Gender === 'Male') acc.male += 1;
          else if (student.Gender === 'Female') acc.female += 1;
          return acc;
        },
        { male: 0, female: 0 }
      );
      this.TotalMale = genderCount.male;
      this.TotalFemale = genderCount.female;
    }

    this.dataSourceGenderGraph = {
      chart: {
        caption: "Student Gender Distribution",
        theme: "fusion",
        showPercentValues: "1",
        pieRadius: "45%"
      },
      data: [
        { label: "Male", value: this.TotalMale },
        { label: "Female", value: this.TotalFemale }
      ]
    };
  }



  groupStudentCountBySchoolAndSection(studentList: any[]): { ClassName: string; ClassSection: string; StudentCount: number }[] {

    //Group students by SchoolID and SectionID and calculate the count
    let studentListSelected = studentList.filter(item => item.SchoolID === this.selectedSchool);
    const groupedData = studentListSelected.reduce((acc, student) => {
      const schoolName = this.CollegeData.find(item => item.SchoolID === parseInt(this.selectedSchool));
      const sectionName = this.StandardSectionData.find(item => item.StandardID === student.FK_StandardID);
      const existingEntry = acc.find(item => item.SchoolID === student.SchoolID && item.ClassName === sectionName.ClassName && item.ClassSection === sectionName.ClassSection);
      if (existingEntry) {
        existingEntry.StudentCount += 1;
      } else {
        acc.push({ SchoolID: student.SchoolID, SchoolName: schoolName.ShortNames, ClassName: sectionName.ClassName, ClassSection: sectionName.ClassSection, StudentCount: 1 });
      }
      return acc;
    }, [] as { SchoolID: number; SchoolName: string; ClassName: string; ClassSection: string; StudentCount: number }[]);

    return groupedData;
  }

  dummyDataSubjectWise: any[] = [
    { label: "ART", value: "80.00" },
    { label: "AI", value: "57.40" },
    { label: "COMMERCIAL APPLICATIONS", value: "79.40" },
    { label: "COMPUTER APPLICATIONS", value: "95.00" },
    { label: "ECONOMIC APPLICATIONS", value: "95.60" },
    { label: "ENVIRONMENTAL APPLICATIONS", value: "95.00" },
    { label: "ENGLISH LANGUAGE", value: "73.89" },
    { label: "ENGLISH LITERATURE", value: "77.07" },
    { label: "HISTORY AND GEOGRAPHY - GEOGRAPHY", value: "70.06" },
    { label: "HISTORY AND GEOGRAPHY - HISTORY", value: "77.67" },
    { label: "HOME SCIENCE", value: "96.00" },
    { label: "INDIAN DANCE", value: "98.00" },
    { label: "MATHEMATICS", value: "98.00" },
    { label: "PHYSICAL EDUCATION", value: "98.00" },
    { label: "SCIENCE - BIOLOGY", value: "77.00" },
    { label: "SCIENCE - CHEMISTRY", value: "77.00" },
    { label: "SCIENCE - PHYSICS", value: "72.52" },
    { label: "TAMIL", value: "77.00" }
  ]

  DummySchoolWiseSubjectAnalysisGraphData() {
    this.dummySourceSubjectGraph = {
      "chart": {
        "caption": "School Wise Subject Average Marks",
        "subCaption": "",
        "numberPrefix": "",
        "showPercentInTooltip": "0",
        "decimals": "1",
        "useDataPlotColorForLabels": "1",
        "theme": "fusion"
      },
      data: [
        { label: "ART", value: "80.00" },
        { label: "AI", value: "57.40" },
        { label: "COMMERCIAL APPLICATIONS", value: "79.40" },
        { label: "COMPUTER APPLICATIONS", value: "95.00" },
        { label: "ECONOMIC APPLICATIONS", value: "95.60" },
        { label: "ENVIRONMENTAL APPLICATIONS", value: "95.00" },
        { label: "ENGLISH LANGUAGE", value: "73.89" },
        { label: "ENGLISH LITERATURE", value: "77.07" },
        { label: "HISTORY AND GEOGRAPHY - GEOGRAPHY", value: "70.06" },
        { label: "HISTORY AND GEOGRAPHY - HISTORY", value: "77.67" },
        { label: "HOME SCIENCE", value: "96.00" },
        { label: "INDIAN DANCE", value: "98.00" },
        { label: "MATHEMATICS", value: "98.00" },
        { label: "PHYSICAL EDUCATION", value: "98.00" },
        { label: "SCIENCE - BIOLOGY", value: "77.00" },
        { label: "SCIENCE - CHEMISTRY", value: "77.00" },
        { label: "SCIENCE - PHYSICS", value: "72.52" },
        { label: "TAMIL", value: "77.00" }
      ]
    };

  }
}
