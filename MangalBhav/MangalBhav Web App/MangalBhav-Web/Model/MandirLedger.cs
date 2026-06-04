using System;
namespace FaceUPAI.Models
{
	public class MandirLedger
	{
		#region Fields

		private long mandirLedgerID;
		private int tenantID;
		private int mandirID;
		private long transactionID;
		private string entryType;
		private string sourceType;
		private decimal amount;
		private int bankAccountID;
		private string paymentReferenceNo;
		private string remarks;
		private bool isPaid;
		private bool isCancelled;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the MandirLedger class.
		/// </summary>
		public MandirLedger()
		{
		}

		/// <summary>
		/// Initializes a new instance of the MandirLedger class.
		/// </summary>
		public MandirLedger(int tenantID, int mandirID, long transactionID, string entryType, string sourceType, decimal amount, int bankAccountID, string paymentReferenceNo, string remarks, bool isPaid, bool isCancelled, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.mandirID = mandirID;
			this.transactionID = transactionID;
			this.entryType = entryType;
			this.sourceType = sourceType;
			this.amount = amount;
			this.bankAccountID = bankAccountID;
			this.paymentReferenceNo = paymentReferenceNo;
			this.remarks = remarks;
			this.isPaid = isPaid;
			this.isCancelled = isCancelled;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the MandirLedger class.
		/// </summary>
		public MandirLedger(long mandirLedgerID, int tenantID, int mandirID, long transactionID, string entryType, string sourceType, decimal amount, int bankAccountID, string paymentReferenceNo, string remarks, bool isPaid, bool isCancelled, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.mandirLedgerID = mandirLedgerID;
			this.tenantID = tenantID;
			this.mandirID = mandirID;
			this.transactionID = transactionID;
			this.entryType = entryType;
			this.sourceType = sourceType;
			this.amount = amount;
			this.bankAccountID = bankAccountID;
			this.paymentReferenceNo = paymentReferenceNo;
			this.remarks = remarks;
			this.isPaid = isPaid;
			this.isCancelled = isCancelled;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the MandirLedgerID value.
		/// </summary>
		public  long MandirLedgerID
		{
			get { return mandirLedgerID; }
			set { mandirLedgerID = value; }
		}

		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the MandirID value.
		/// </summary>
		public  int MandirID
		{
			get { return mandirID; }
			set { mandirID = value; }
		}

		/// <summary>
		/// Gets or sets the TransactionID value.
		/// </summary>
		public  long TransactionID
		{
			get { return transactionID; }
			set { transactionID = value; }
		}

		/// <summary>
		/// Gets or sets the EntryType value.
		/// </summary>
		public  string EntryType
		{
			get { return entryType; }
			set { entryType = value; }
		}

		/// <summary>
		/// Gets or sets the SourceType value.
		/// </summary>
		public  string SourceType
		{
			get { return sourceType; }
			set { sourceType = value; }
		}

		/// <summary>
		/// Gets or sets the Amount value.
		/// </summary>
		public  decimal Amount
		{
			get { return amount; }
			set { amount = value; }
		}

		/// <summary>
		/// Gets or sets the BankAccountID value.
		/// </summary>
		public  int BankAccountID
		{
			get { return bankAccountID; }
			set { bankAccountID = value; }
		}

		/// <summary>
		/// Gets or sets the PaymentReferenceNo value.
		/// </summary>
		public  string PaymentReferenceNo
		{
			get { return paymentReferenceNo; }
			set { paymentReferenceNo = value; }
		}

		/// <summary>
		/// Gets or sets the Remarks value.
		/// </summary>
		public  string Remarks
		{
			get { return remarks; }
			set { remarks = value; }
		}

		/// <summary>
		/// Gets or sets the IsPaid value.
		/// </summary>
		public  bool IsPaid
		{
			get { return isPaid; }
			set { isPaid = value; }
		}

		/// <summary>
		/// Gets or sets the IsCancelled value.
		/// </summary>
		public  bool IsCancelled
		{
			get { return isCancelled; }
			set { isCancelled = value; }
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
		public  string UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
