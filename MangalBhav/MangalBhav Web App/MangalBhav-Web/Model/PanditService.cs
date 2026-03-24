using System;
namespace FaceUPAI.Models
{
	public class PanditService
	{
		#region Fields

		private int panditServiceID;
		private int tenantID;
		private int profileID;
		private int serviceID;
		private int locationID;
		private decimal price;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the PanditService class.
		/// </summary>
		public PanditService()
		{
		}

		/// <summary>
		/// Initializes a new instance of the PanditService class.
		/// </summary>
		public PanditService(int tenantID, int profileID, int serviceID, int locationID, decimal price, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.profileID = profileID;
			this.serviceID = serviceID;
			this.locationID = locationID;
			this.price = price;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the PanditService class.
		/// </summary>
		public PanditService(int panditServiceID, int tenantID, int profileID, int serviceID, int locationID, decimal price, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.panditServiceID = panditServiceID;
			this.tenantID = tenantID;
			this.profileID = profileID;
			this.serviceID = serviceID;
			this.locationID = locationID;
			this.price = price;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the PanditServiceID value.
		/// </summary>
		public  int PanditServiceID
		{
			get { return panditServiceID; }
			set { panditServiceID = value; }
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
		/// Gets or sets the ProfileID value.
		/// </summary>
		public  int ProfileID
		{
			get { return profileID; }
			set { profileID = value; }
		}

		/// <summary>
		/// Gets or sets the ServiceID value.
		/// </summary>
		public  int ServiceID
		{
			get { return serviceID; }
			set { serviceID = value; }
		}

		/// <summary>
		/// Gets or sets the LocationID value.
		/// </summary>
		public  int LocationID
		{
			get { return locationID; }
			set { locationID = value; }
		}

		/// <summary>
		/// Gets or sets the Price value.
		/// </summary>
		public  decimal Price
		{
			get { return price; }
			set { price = value; }
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
		public  string UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
