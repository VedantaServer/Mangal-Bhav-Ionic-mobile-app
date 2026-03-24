using System;
namespace FaceUPAI.Models
{
	public class Location
	{
		#region Fields

		private int locationID;
		private int tenantID;
		private int userID;
		private string name;
		private string contactPerson;
		private string contactPhone;
		private string contactEmail;
		private string addressLine1;
		private string addressLine2;
		private string city;
		private string pincode;
		private string state;
		private string country;
		private decimal latitude;
		private decimal longitude;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Location class.
		/// </summary>
		public Location()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Location class.
		/// </summary>
		public Location(int tenantID, int userID, string name, string contactPerson, string contactPhone, string contactEmail, string addressLine1, string addressLine2, string city, string pincode, string state, string country, decimal latitude, decimal longitude, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.userID = userID;
			this.name = name;
			this.contactPerson = contactPerson;
			this.contactPhone = contactPhone;
			this.contactEmail = contactEmail;
			this.addressLine1 = addressLine1;
			this.addressLine2 = addressLine2;
			this.city = city;
			this.pincode = pincode;
			this.state = state;
			this.country = country;
			this.latitude = latitude;
			this.longitude = longitude;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the Location class.
		/// </summary>
		public Location(int locationID, int tenantID, int userID, string name, string contactPerson, string contactPhone, string contactEmail, string addressLine1, string addressLine2, string city, string pincode, string state, string country, decimal latitude, decimal longitude, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.locationID = locationID;
			this.tenantID = tenantID;
			this.userID = userID;
			this.name = name;
			this.contactPerson = contactPerson;
			this.contactPhone = contactPhone;
			this.contactEmail = contactEmail;
			this.addressLine1 = addressLine1;
			this.addressLine2 = addressLine2;
			this.city = city;
			this.pincode = pincode;
			this.state = state;
			this.country = country;
			this.latitude = latitude;
			this.longitude = longitude;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the LocationID value.
		/// </summary>
		public  int LocationID
		{
			get { return locationID; }
			set { locationID = value; }
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
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the Name value.
		/// </summary>
		public  string Name
		{
			get { return name; }
			set { name = value; }
		}

		/// <summary>
		/// Gets or sets the ContactPerson value.
		/// </summary>
		public  string ContactPerson
		{
			get { return contactPerson; }
			set { contactPerson = value; }
		}

		/// <summary>
		/// Gets or sets the ContactPhone value.
		/// </summary>
		public  string ContactPhone
		{
			get { return contactPhone; }
			set { contactPhone = value; }
		}

		/// <summary>
		/// Gets or sets the ContactEmail value.
		/// </summary>
		public  string ContactEmail
		{
			get { return contactEmail; }
			set { contactEmail = value; }
		}

		/// <summary>
		/// Gets or sets the AddressLine1 value.
		/// </summary>
		public  string AddressLine1
		{
			get { return addressLine1; }
			set { addressLine1 = value; }
		}

		/// <summary>
		/// Gets or sets the AddressLine2 value.
		/// </summary>
		public  string AddressLine2
		{
			get { return addressLine2; }
			set { addressLine2 = value; }
		}

		/// <summary>
		/// Gets or sets the City value.
		/// </summary>
		public  string City
		{
			get { return city; }
			set { city = value; }
		}

		/// <summary>
		/// Gets or sets the Pincode value.
		/// </summary>
		public  string Pincode
		{
			get { return pincode; }
			set { pincode = value; }
		}

		/// <summary>
		/// Gets or sets the State value.
		/// </summary>
		public  string State
		{
			get { return state; }
			set { state = value; }
		}

		/// <summary>
		/// Gets or sets the Country value.
		/// </summary>
		public  string Country
		{
			get { return country; }
			set { country = value; }
		}

		/// <summary>
		/// Gets or sets the Latitude value.
		/// </summary>
		public  decimal Latitude
		{
			get { return latitude; }
			set { latitude = value; }
		}

		/// <summary>
		/// Gets or sets the Longitude value.
		/// </summary>
		public  decimal Longitude
		{
			get { return longitude; }
			set { longitude = value; }
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
