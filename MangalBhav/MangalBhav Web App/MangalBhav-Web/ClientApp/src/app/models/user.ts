export class User {

  userID: number;
  tenantID: number=0;
  schoolID: number=0;

  personID: number;

  username: string;
  fK_RoleID: number;

  password: string;
  isActive: boolean;
  dateDisabled: Date;
  iMEI: string;
 
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  iPAddress: string;
  paymentRefrenceNo: string;
  banksDetail: string;
  dateAdded: Date;
  dateModified: Date;
  updatedByUser: string;


  token: string;
}
