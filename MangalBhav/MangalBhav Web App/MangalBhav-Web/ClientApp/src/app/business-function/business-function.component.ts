import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, CUSTOM_ELEMENTS_SCHEMA,ChangeDetectorRef} from '@angular/core';
import { Api, OperationType, keys, Tables } from '../services/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Smart } from 'smart-webcomponents-angular/validator';
import { DropDownListComponent } from 'smart-webcomponents-angular/dropdownlist';
import { GridColumn, GridComponent } from 'smart-webcomponents-angular/grid';
import { ListBoxComponent } from 'smart-webcomponents-angular/listbox';
import { DatePipe } from '@angular/common'; 
import { MenuComponent, MenuItem } from 'smart-webcomponents-angular/menu';
import { BreadcrumbService } from '../breadcrum/breadcrumbService';
declare function printdata(type: any)

@Component({
  selector: 'app-business-function',
  templateUrl: './business-function.component.html',
  styleUrls: ['./business-function.component.css']
})
export class BusinessFunctionComponent implements AfterViewInit, OnInit {
  @ViewChild('grid', { read: GridComponent, static: false }) grid!: GridComponent;
  @ViewChild('griddata', { read: GridComponent, static: false }) griddata!: GridComponent;
  @ViewChild('listbox', { read: ListBoxComponent, static: false }) listbox!: ListBoxComponent;
  @ViewChild('menu', { read: MenuComponent, static: false }) menu2: MenuComponent;
  @ViewChild('SystemInfoIDDropdownlist', { read: DropDownListComponent, static: false }) SystemInfoIDDropdownlist!: DropDownListComponent;
SystemInfoName :any;
QRCode: any;
BusinessFunctionData: any;
BusinessFunctionListData: any; 
query: any;
id: any;
txtSearch: any;
 ReportView: any;
ShowList: boolean = false;
visibileMode: boolean = false;
currentUser: any


isPanelVisible: boolean = false;
isFormReadOnly: boolean = true; 
 HideList: boolean = false;
 HideAddEdit: boolean = true;
 HideDelete: boolean = true;
  handleClick(event: Event,type:any) {
    this.grid.exportData(type);
  }
  OperationType = OperationType;
  oType: OperationType = OperationType.list;

  //table variables
  dataSourceSettings = {
    sanitizeHTML: 'all',
    sanitizeHTMLRender: 'html'
  }

  sorting = {
    enabled: true,
    sortMode: 'one'
  }

  filtering = {
    enabled: true,
    filter: []
  }

paging = {
enabled: true,
 pageSize: 10,
 pageIndex: 0
}
 pager = {
  position: 'far',
visible: true
 }
  appearance = {
    alternationCount: 2,
    alternationStart: -1
  }

  RecordStatus = {
    Message: 'Create a new record',
    Color: "Blue",
    Disabled: false
  };
 lblMessage = {
        Message: '',
  Color: "Red",
 Disabled: false
 };
  formCaption: string="BusinessFunction View";
  BusinessFunction = {
	//loop all columns here.
    BusinessFunctionID: "-1", 
    SystemInfoID:'',
    FunctionName:'',
    IconName:'',
    Description:'',
    IsActive:true,
    DateAdded:new Date(),
    DateModified:new Date(), 
    UpdatedByUser:localStorage.getItem(keys.updatedByUser)
  }
  validator: any;
 rules = [
]
  dataSource: any;


  columns: GridColumn[] = [
    {
      label:' Business Function',
      dataField: 'BusinessFunctionID',
      dataType: 'string',
      allowEdit: false,
      visible: false
    }, 
    {
      label:' System Info',
      dataField: 'SystemInfoID',
      dataType: 'string',
      allowEdit: false,
      visible: false
    }, 
    {
      label:' Function Name',
      dataField: 'FunctionName',
      dataType: 'string',
      allowEdit: false,
      visible: true
    }, 
    {
      label:' Icon Name',
      dataField: 'IconName',
      dataType: 'string',
      allowEdit: false,
      visible: true
    }, 
    {
      label:' Description',
      dataField: 'Description',
      dataType: 'string',
      allowEdit: false,
      visible: false
    }, 
    {
      label:' Is Active',
      dataField: 'IsActive',
      dataType: 'string',
      allowEdit: false,
      visible: false
    }, 
    {
      label:' Date Added',
      dataField: 'DateAdded',
      dataType: 'string',
      allowEdit: false,
      visible: false
    }, 
    {
      label:' Date Modified',
      dataField: 'DateModified',
      dataType: 'string',
      allowEdit: false,
      visible: false
    }, 
    {
      label:' Updated By User',
      dataField: 'UpdatedByUser',
      dataType: 'string',
      allowEdit: false,
      visible: false
    }, 
  ];

constructor(private route: ActivatedRoute, private router: Router, private api: Api, private datePipe: DatePipe, private breadcrumbService: BreadcrumbService, private cdr: ChangeDetectorRef){}


  ngAfterViewInit(): void {
    this.validator = new Smart.Utilities.Validator(this.rules, '#validationsummary');
    this.startPage();
  }
togglePanel() {
    this.isPanelVisible = !this.isPanelVisible;
 }
  ngOnInit(): void { }

  startPage(): void {
 this.currentUser = localStorage.getItem('LoggedInUser');
  }

 loadSearch() {
     this.getObjectDataFromDB();
 }
DisableEditMode: boolean = true;
toggleEditMode() {
 this.DisableEditMode = !this.DisableEditMode;
 if (this.DisableEditMode) {
 this.isFormReadOnly = !this.isFormReadOnly;
 this.formCaption = "Edit BusinessFunction ";
 this.oType = OperationType.edit;
} else {
 this.isFormReadOnly = !this.isFormReadOnly;
this.formCaption = "Edit BusinessFunction";
}
 }

  GridEvents() {
    const that = this;
    if (that.grid) {
        this.grid.autoSizeRows();
        function HandleEdit(event: CustomEvent) {
        const detail = event.detail,
          cell = detail.cell,
          originalEvent = detail.originalEvent,
          id = detail.id,
          dataField = detail.dataField,
          isRightClick = detail.isRightClick,
          pageX = detail.pageX,
          pageY = detail.pageY;
        that.ActionClicked("edit", detail.cell.row.data.BusinessFunctionID);
        // event handling code goes here.
       /* that.grid.removeEventListener('cellClick', HandleEdit);*/
      }
      that.grid.addEventListener('cellClick', HandleEdit);

      const lookUpSystemInfoID = function () {
        const rows = that.grid.rows;
        that.grid.beginUpdate();
        for (let i = 0; i < rows.length; i++) {
          const cell = rows[i].cells[1];
          that.api.postUrlData("SystemInfoSelect?SystemInfoID=" + cell.row.data.SystemInfoID, null).subscribe((data: any) => {
            cell.value = data.SystemInfoList.length > 0 ? data.SystemInfoList[0].Name : '';
          });
        }
        that.grid.endUpdate();
      }

      that.grid.nativeElement.whenRendered(() => {
        lookUpSystemInfoID();
      });
    }
  }

  getObjectDataFromDB() {
    const that = this;
this.grid.behavior.columnResizeMode = 'growAndShrink';
this.grid.appearance = {
 alternationCount: 2,
showRowHeader: true,
 showRowHeaderSelectIcon: true,
showRowHeaderFocusIcon: true
};
this.grid.paging.enabled = true;
this.grid.pager.visible = true;
this.grid.sorting.enabled = true;
this.grid.editing.enabled = true;
this.grid.selection = {
  enabled: true,
  allowRowHeaderSelection: true,
 allowColumnHeaderSelection: true,
 mode: 'extended'
};
this.id = localStorage.getItem("SystemInfoID");
this.query = "SystemInfoID=" + this.id;
 this.query += (this.txtSearch == undefined ? "" : (" and (FunctionName like '%" + this.txtSearch + "%'"
 +" or IconName like '%" + this.txtSearch + "%'"
+")"));
    that.grid.dataSource = null;
    that.api.postUrlData("BusinessFunctionSelectAllByQuery?Query=" + this.query, null)
      .subscribe(
        data => {
          that.grid.dataSource = new Smart.DataAdapter({
            dataSource: data.BusinessFunctionList
          });
          that.GridEvents();
        });
  }

  ActionClicked(operation: any, ID: any = -1) {
    this.RecordStatus.Disabled = false;
localStorage.setItem('BusinessFunctionID',ID);
          this.lblMessage.Message =" ";

localStorage.setItem('EntityID',ID);
localStorage.setItem('EntityName','BusinessFunction');
    if (operation == 'list') {
       this.HideList = false;
       this.HideAddEdit = true;
       this.HideDelete = true;
      this.oType = OperationType.list;
      this.getObjectDataFromDB();
    }

    if (operation == 'add') {
       this.HideList = true;
       this.HideAddEdit = false;
       this.HideDelete = true;
      this.formCaption = "New BusinessFunction";
    this.BusinessFunction.BusinessFunctionID= "-1"; 
      this.oType = OperationType.add;
  this.DisableEditMode = false;
      this.RecordStatus.Message = "Create New Record"
      this.LoadData("-1");
    }

    if (operation == 'edit') {
       this.HideAddEdit = false;
       this.HideDelete = true;
      this.formCaption = "View BusinessFunction";
      this.RecordStatus.Message = "Update BusinessFunction";
      this.oType = OperationType.edit;
      this.LoadData(ID);
      this.DisableEditMode = true;
    }

    if (operation == 'delete') {
       this.HideList = true;
       this.HideAddEdit = true;
       this.HideDelete = false;
      this.oType = OperationType.delete;
      this.formCaption = "Confirm & Delete  BusinessFunction";
      this.RecordStatus.Message = "Delete Record ";
      this.LoadData(ID);
    }
  }
  LoadData(ID: any) {
  this.visibileMode = true;
    this.SystemInfoName = this.api.getObjectName("SystemInfo");
this.api.postUrlData("BusinessFunctionSelect?BusinessFunctionID="+ID, null)
.subscribe(
  data => {
      this.BusinessFunction.BusinessFunctionID = this.oType == OperationType.add ? -1 : data.BusinessFunctionList[0].BusinessFunctionID;
      this.BusinessFunction.SystemInfoID = this.oType == OperationType.add ? '' : data.BusinessFunctionList[0].SystemInfoID;
      this.BusinessFunction.FunctionName = this.oType == OperationType.add ? '' : data.BusinessFunctionList[0].FunctionName;
      this.BusinessFunction.IconName = this.oType == OperationType.add ? '' : data.BusinessFunctionList[0].IconName;
      this.BusinessFunction.Description = this.oType == OperationType.add ? '' : data.BusinessFunctionList[0].Description;
      this.BusinessFunction.IsActive = this.oType == OperationType.add ? '' : data.BusinessFunctionList[0].IsActive;
      this.BusinessFunction.DateAdded =new Date();
      this.BusinessFunction.DateModified =new Date();
      this.BusinessFunction.UpdatedByUser=localStorage.getItem(keys.updatedByUser);
      this.api.SetObjectValueArray("BusinessFunction", ID, data.BusinessFunctionList[0].FunctionName);
      this.QRCode = this.api.getQRCode('BusinessFunction', data.BusinessFunctionList[0].FunctionName,ID);
  });
  }

  InsertUpdate() {
    if (!this.validator.validate()) return;  //keep trying untill data is validated..

    var body = {
      "BusinessFunctionID": this.BusinessFunction.BusinessFunctionID,
      "SystemInfoID": localStorage.getItem(keys.SystemInfoID),
      "FunctionName": this.BusinessFunction.FunctionName,
      "IconName": this.BusinessFunction.IconName,
      "Description": this.BusinessFunction.Description,
      "IsActive": this.BusinessFunction.IsActive,
      "DateAdded": this.BusinessFunction.DateAdded,
      "DateModified": this.BusinessFunction.DateModified,
      "UpdatedByUser": this.BusinessFunction.UpdatedByUser,
    }

    var functionName = this.oType == OperationType.add ? "BusinessFunctionInsert" : "BusinessFunctionUpdate";
    this.api.postUrlData(functionName, JSON.stringify(body))
      .subscribe(
        data => {
          if (Number(data.BusinessFunctionID) > 0) {
             this.lblMessage.Message = "Record Saved @ " + JSON.stringify(new Date());
            this.lblMessage.Disabled = true; //Don't allow user to save any more..
            this.lblMessage.Color = "Green";
            this.DisableEditMode = true;
            this.getObjectDataFromDB();
            }
            else
            {
                this.lblMessage.Message = "Record Not Saved @ " + JSON.stringify(new Date()); 
                this.lblMessage.Color = "Red";
            }
        });
  }
  Delete() {
    this.api.postUrlData("BusinessFunctionDelete?BusinessFunctionID=" + this.BusinessFunction.BusinessFunctionID, null)
      .subscribe(
        data => {
          //console.log(data);
this.ActionClicked('list');
          this.lblMessage.Message = "Record Deleted @ " + JSON.stringify(new Date());
          this.lblMessage.Disabled = true; //Don't allow user to save any more..
          this.lblMessage.Color = "Red";
        });
  }
  
  
 ListEvents() { 
 const that = this;
 if (that.listbox) {
const BusinessFunctionIDs = this.BusinessFunctionData.map(item => item.BusinessFunctionID);
  
function HandleEdit(event: CustomEvent) {
  const detail = event.detail, 
 disabled = detail.disabled, 
   index = detail.index,
   label = detail.label,
    selected = detail.selected,
    value = detail.value;
     const clickedBusinessFunctionID = BusinessFunctionIDs[index];
   if (clickedBusinessFunctionID !== undefined) {
   that.ActionClicked('edit', clickedBusinessFunctionID);
   }
  }
 this.listbox.addEventListener('itemClick', HandleEdit);
  console.log('BusinessFunction ID clicked:');
    }
    }
 printPage(type) {
  printdata(type);
}
 back() {
  this.ShowList = false;
}
loadlist() {
 this.ShowList = true;
 this.route.params.subscribe(params => {
this.id = params['id'];
});
this.query = "SystemInfoID=" + this.id;
 console.log(this.query);
    this.api.postUrlData("BusinessFunctionSelectAllByQuery?Query=" + this.query, null)
      .subscribe(
    data => {
     this.griddata.dataSource = data.OrganizationList
   });
 if (this.griddata) {
  this.griddata.autoSizeRows();
  this.griddata.autoSizeColumns();
 this.griddata.appearance = {
   alternationStart: 0,
  alternationCount: 2,
   showRowHeader: true,
  showRowHeaderSelectIcon: true,
   showRowHeaderFocusIcon: true
  };
 this.griddata.paging.enabled = true;
  this.griddata.pager.visible = true;
  this.griddata.sorting.enabled = true;
 this.griddata.editing.enabled = true;
 this.griddata.selection = {
    enabled: true,
   allowRowHeaderSelection: true,
   allowColumnHeaderSelection: true,
   mode: 'extended'
 };
 }
 }
  gotoPage(pageName) {
 var count = this.breadcrumbService.getIndexBreadcrumbs();
this.api.setbreadCrumb(count+1 , this.BusinessFunction.FunctionName+'(BusinessFunction)', '/business-function', this.BusinessFunction.BusinessFunctionID);
this.router.navigate(['/' + pageName ]);
  }
}
