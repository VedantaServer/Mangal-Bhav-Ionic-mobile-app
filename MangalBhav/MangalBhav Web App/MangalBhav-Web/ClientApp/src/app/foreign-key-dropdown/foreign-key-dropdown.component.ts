import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DropDownListComponent } from 'smart-webcomponents-angular/dropdownlist';
import { Api } from '../services/api';

@Component({
  selector: 'app-foreign-key-dropdown',
  templateUrl: './foreign-key-dropdown.component.html',
  styleUrls: ['./foreign-key-dropdown.component.css']
})
export class ForeignKeyDropdownComponent implements AfterViewInit, OnInit {
  @ViewChild('foreignkeyDropDown', { read: DropDownListComponent, static: false }) foreignkeyDropDown!: DropDownListComponent;
  @Input() disabled: false;
  @Input() tableName: string;
  @Input() keyColumn: string;
  @Input() nameColumns: string;
  @Input() filter: string;
  @Input() model: any; // Ensure this type matches the data type used in foreignKeyData 
  @Output() modelChangedEvent = new EventEmitter<any>();

  foreignKeyData: any[] = [];
  ValueName: any;
  selIndex: number=0;
  selectedItem = [];
  constructor(private api: Api, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
      
  }

  ngAfterViewInit(): void {
   this.loadForeignKeyData();

  }

  onChange($event: CustomEvent) {
    //this.modelChangedEvent.emit(this.modelLocal); // Emit the new selected value to the parent
    //this.cdr.detectChanges();
    this.updateDropdownSelection();
  }

  private loadForeignKeyData() {
    this.api.getForeignKeyData(this.tableName, this.keyColumn, this.nameColumns, this.filter).subscribe((data: any) => {
      this.foreignKeyData = data.foreignkeyList;
      this.foreignkeyDropDown.dataSource = this.foreignKeyData;
      this.foreignkeyDropDown.displayLoadingIndicator = false;
      this.updateDropdownSelection();
    });
  }

  private updateDropdownSelection() {
    if (this.foreignkeyDropDown && this.foreignKeyData.length > 0) {
      this.selIndex = this.foreignKeyData.findIndex(item => item.Key == this.model); 
      this.foreignkeyDropDown.placeholder = this.foreignKeyData[this.selIndex].Value;
      if (this.foreignKeyData.length == 1)
        this.model = this.foreignKeyData[0].Key;
      this.selectedItem.push(this.selIndex);
      this.modelChangedEvent.emit(this.model);
      this.cdr.detectChanges();
    } 
  }
  
}
