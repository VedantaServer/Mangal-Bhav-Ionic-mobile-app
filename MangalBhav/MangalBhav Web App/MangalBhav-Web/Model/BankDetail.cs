using System;
namespace FaceUPAI.Models
{
	public class BankDetail
	{
		#region Fields

		private int bankDetailsId;
		private int tenantId;
		private int userID;
		private string accountHolderName;
		private string bankName;
		private string accountNumber;
		private string iFSCCode;
		private string branchName;
		private string uPIId;
		private string accountType;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private int updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the BankDetail class.
		/// </summary>
		public BankDetail()
		{
		}

		/// <summary>
		/// Initializes a new instance of the BankDetail class.
		/// </summary>
		public BankDetail(int tenantId, int userID, string accountHolderName, string bankName, string accountNumber, string iFSCCode, string branchName, string uPIId, string accountType, bool isActive, DateTime dateAdded, DateTime dateModified, int updatedByUser)
		{
			this.tenantId = tenantId;
			this.userID = userID;
			this.accountHolderName = accountHolderName;
			this.bankName = bankName;
			this.accountNumber = accountNumber;
			this.iFSCCode = iFSCCode;
			this.branchName = branchName;
			this.uPIId = uPIId;
			this.accountType = accountType;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the BankDetail class.
		/// </summary>
		public BankDetail(int bankDetailsId, int tenantId, int userID, string accountHolderName, string bankName, string accountNumber, string iFSCCode, string branchName, string uPIId, string accountType, bool isActive, DateTime dateAdded, DateTime dateModified, int updatedByUser)
		{
			this.bankDetailsId = bankDetailsId;
			this.tenantId = tenantId;
			this.userID = userID;
			this.accountHolderName = accountHolderName;
			this.bankName = bankName;
			this.accountNumber = accountNumber;
			this.iFSCCode = iFSCCode;
			this.branchName = branchName;
			this.uPIId = uPIId;
			this.accountType = accountType;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the BankDetailsId value.
		/// </summary>
		public  int BankDetailsId
		{
			get { return bankDetailsId; }
			set { bankDetailsId = value; }
		}

		/// <summary>
		/// Gets or sets the TenantId value.
		/// </summary>
		public  int TenantId
		{
			get { return tenantId; }
			set { tenantId = value; }
		}

		/// <summary>
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the AccountHolderName value.
		/// </summary>
		public  string AccountHolderName
		{
			get { return accountHolderName; }
			set { accountHolderName = value; }
		}

		/// <summary>
		/// Gets or sets the BankName value.
		/// </summary>
		public  string BankName
		{
			get { return bankName; }
			set { bankName = value; }
		}

		/// <summary>
		/// Gets or sets the AccountNumber value.
		/// </summary>
		public  string AccountNumber
		{
			get { return accountNumber; }
			set { accountNumber = value; }
		}

		/// <summary>
		/// Gets or sets the IFSCCode value.
		/// </summary>
		public  string IFSCCode
		{
			get { return iFSCCode; }
			set { iFSCCode = value; }
		}

		/// <summary>
		/// Gets or sets the BranchName value.
		/// </summary>
		public  string BranchName
		{
			get { return branchName; }
			set { branchName = value; }
		}

		/// <summary>
		/// Gets or sets the UPIId value.
		/// </summary>
		public  string UPIId
		{
			get { return uPIId; }
			set { uPIId = value; }
		}

		/// <summary>
		/// Gets or sets the AccountType value.
		/// </summary>
		public  string AccountType
		{
			get { return accountType; }
			set { accountType = value; }
		}

		/// <summary>
		/// Gets or sets the IsActive value.
		/// </summary>
		public  bool IsActive
		{
			get { return isActive; }
			set { isActive = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		/// <summary>
		/// Gets or sets the DateModified value.
		/// </summary>
		public  DateTime DateModified
		{
			get { return dateModified; }
			set { dateModified = value; }
		}

		/// <summary>
		/// Gets or sets the UpdatedByUser value.
		/// </summary>
		public  int UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
