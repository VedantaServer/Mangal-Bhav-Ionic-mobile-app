using System;
namespace FaceUPAI.Models
{
	public class Booking
	{
		#region Fields

		private int bookingID;
		private int tenantID;
		private int panditServiceID;
		private int bhaktProfileID;
		private string status;
		private decimal totalAmount;
		private string paymentStatus;
		private DateTime poojaDate;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Booking class.
		/// </summary>
		public Booking()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Booking class.
		/// </summary>
		public Booking(int tenantID, int panditServiceID, int bhaktProfileID, string status, decimal totalAmount, string paymentStatus, DateTime poojaDate, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.panditServiceID = panditServiceID;
			this.bhaktProfileID = bhaktProfileID;
			this.status = status;
			this.totalAmount = totalAmount;
			this.paymentStatus = paymentStatus;
			this.poojaDate = poojaDate;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the Booking class.
		/// </summary>
		public Booking(int bookingID, int tenantID, int panditServiceID, int bhaktProfileID, string status, decimal totalAmount, string paymentStatus, DateTime poojaDate, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.bookingID = bookingID;
			this.tenantID = tenantID;
			this.panditServiceID = panditServiceID;
			this.bhaktProfileID = bhaktProfileID;
			this.status = status;
			this.totalAmount = totalAmount;
			this.paymentStatus = paymentStatus;
			this.poojaDate = poojaDate;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the BookingID value.
		/// </summary>
		public  int BookingID
		{
			get { return bookingID; }
			set { bookingID = value; }
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
		/// Gets or sets the PanditServiceID value.
		/// </summary>
		public  int PanditServiceID
		{
			get { return panditServiceID; }
			set { panditServiceID = value; }
		}

		/// <summary>
		/// Gets or sets the BhaktProfileID value.
		/// </summary>
		public  int BhaktProfileID
		{
			get { return bhaktProfileID; }
			set { bhaktProfileID = value; }
		}

		/// <summary>
		/// Gets or sets the Status value.
		/// </summary>
		public  string Status
		{
			get { return status; }
			set { status = value; }
		}

		/// <summary>
		/// Gets or sets the TotalAmount value.
		/// </summary>
		public  decimal TotalAmount
		{
			get { return totalAmount; }
			set { totalAmount = value; }
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
		/// Gets or sets the PoojaDate value.
		/// </summary>
		public  DateTime PoojaDate
		{
			get { return poojaDate; }
			set { poojaDate = value; }
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
