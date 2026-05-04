using System;
namespace FaceUPAI.Models
{
	public class MandirTransaction
	{
		#region Fields

		private long transactionID;
		private int tenantID;
		private int mandirID;
		private int userID;
		private string transactionType;
		private string serviceName;
		private string donorName;
		private string phone;
		private string amount;
		private string paymentMode;
		private string orderID;
		private string uniqueReferenceNo;
		private string paymentStatus;
		private string paymentGatewayResponse;
		private string remarks;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the MandirTransaction class.
		/// </summary>
		public MandirTransaction()
		{
		}

		/// <summary>
		/// Initializes a new instance of the MandirTransaction class.
		/// </summary>
		public MandirTransaction(int tenantID, int mandirID, int userID, string transactionType, string serviceName, string donorName, string phone, string amount, string paymentMode, string orderID, string uniqueReferenceNo, string paymentStatus, string paymentGatewayResponse, string remarks, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.mandirID = mandirID;
			this.userID = userID;
			this.transactionType = transactionType;
			this.serviceName = serviceName;
			this.donorName = donorName;
			this.phone = phone;
			this.amount = amount;
			this.paymentMode = paymentMode;
			this.orderID = orderID;
			this.uniqueReferenceNo = uniqueReferenceNo;
			this.paymentStatus = paymentStatus;
			this.paymentGatewayResponse = paymentGatewayResponse;
			this.remarks = remarks;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the MandirTransaction class.
		/// </summary>
		public MandirTransaction(long transactionID, int tenantID, int mandirID, int userID, string transactionType, string serviceName, string donorName, string phone, string amount, string paymentMode, string orderID, string uniqueReferenceNo, string paymentStatus, string paymentGatewayResponse, string remarks, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.transactionID = transactionID;
			this.tenantID = tenantID;
			this.mandirID = mandirID;
			this.userID = userID;
			this.transactionType = transactionType;
			this.serviceName = serviceName;
			this.donorName = donorName;
			this.phone = phone;
			this.amount = amount;
			this.paymentMode = paymentMode;
			this.orderID = orderID;
			this.uniqueReferenceNo = uniqueReferenceNo;
			this.paymentStatus = paymentStatus;
			this.paymentGatewayResponse = paymentGatewayResponse;
			this.remarks = remarks;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the TransactionID value.
		/// </summary>
		public  long TransactionID
		{
			get { return transactionID; }
			set { transactionID = value; }
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
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the TransactionType value.
		/// </summary>
		public  string TransactionType
		{
			get { return transactionType; }
			set { transactionType = value; }
		}

		/// <summary>
		/// Gets or sets the ServiceName value.
		/// </summary>
		public  string ServiceName
		{
			get { return serviceName; }
			set { serviceName = value; }
		}

		/// <summary>
		/// Gets or sets the DonorName value.
		/// </summary>
		public  string DonorName
		{
			get { return donorName; }
			set { donorName = value; }
		}

		/// <summary>
		/// Gets or sets the Phone value.
		/// </summary>
		public  string Phone
		{
			get { return phone; }
			set { phone = value; }
		}

		/// <summary>
		/// Gets or sets the Amount value.
		/// </summary>
		public  string Amount
		{
			get { return amount; }
			set { amount = value; }
		}

		/// <summary>
		/// Gets or sets the PaymentMode value.
		/// </summary>
		public  string PaymentMode
		{
			get { return paymentMode; }
			set { paymentMode = value; }
		}

		/// <summary>
		/// Gets or sets the OrderID value.
		/// </summary>
		public  string OrderID
		{
			get { return orderID; }
			set { orderID = value; }
		}

		/// <summary>
		/// Gets or sets the UniqueReferenceNo value.
		/// </summary>
		public  string UniqueReferenceNo
		{
			get { return uniqueReferenceNo; }
			set { uniqueReferenceNo = value; }
		}

		/// <summary>
		/// Gets or sets the PaymentStatus value.
		/// </summary>
		public  string PaymentStatus
		{
			get { return paymentStatus; }
			set { paymentStatus = value; }
		}

		/// <summary>
		/// Gets or sets the PaymentGatewayResponse value.
		/// </summary>
		public  string PaymentGatewayResponse
		{
			get { return paymentGatewayResponse; }
			set { paymentGatewayResponse = value; }
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
