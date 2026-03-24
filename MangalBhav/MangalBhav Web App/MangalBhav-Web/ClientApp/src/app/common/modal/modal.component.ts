import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  constructor() { }

  @Input() isShow: boolean = false; // Modal ko show/hide karne ke liye
  @Input() title: string = ''; // Modal ka title
  @Output() closeModalEvent = new EventEmitter<void>(); // Modal close event
  @Output() submitFormEvent = new EventEmitter<void>(); // Form submit event

  closeModal() {
    this.closeModalEvent.emit();
  }

  submitForm() {
    this.submitFormEvent.emit();
  }


  ngOnInit() {
  }

}
