using System;
namespace FaceUPAI.Models
{
	public class Mandir
	{
		#region Fields

		private int tenantID;
		private int mandirID;
		private string mandirName;
		private string godName;
		private string frontImage;
		private string insideImage;
		private string pujariName;
		private string pujariPhoneNumber;
		private string history;
		private string address;
		private string city;
		private string state;
		private string pincode;
		private decimal latitude;
		private decimal longitude;
		private bool isVerified;
		private string verificationStatus;
		private int addedByUserID;
		private string addedByName;
		private DateTime dateAdded;
		private DateTime dateModified;
		private bool isActive;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Mandir class.
		/// </summary>
		public Mandir()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Mandir class.
		/// </summary>
		public Mandir(int tenantID, string mandirName, string godName, string frontImage, string insideImage, string pujariName, string pujariPhoneNumber, string history, string address, string city, string state, string pincode, decimal latitude, decimal longitude, bool isVerified, string verificationStatus, int addedByUserID, string addedByName, DateTime dateAdded, DateTime dateModified, bool isActive)
		{
			this.tenantID = tenantID;
			this.mandirName = mandirName;
			this.godName = godName;
			this.frontImage = frontImage;
			this.insideImage = insideImage;
			this.pujariName = pujariName;
			this.pujariPhoneNumber = pujariPhoneNumber;
			this.history = history;
			this.address = address;
			this.city = city;
			this.state = state;
			this.pincode = pincode;
			this.latitude = latitude;
			this.longitude = longitude;
			this.isVerified = isVerified;
			this.verificationStatus = verificationStatus;
			this.addedByUserID = addedByUserID;
			this.addedByName = addedByName;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.isActive = isActive;
		}

		/// <summary>
		/// Initializes a new instance of the Mandir class.
		/// </summary>
		public Mandir(int tenantID, int mandirID, string mandirName, string godName, string frontImage, string insideImage, string pujariName, string pujariPhoneNumber, string history, string address, string city, string state, string pincode, decimal latitude, decimal longitude, bool isVerified, string verificationStatus, int addedByUserID, string addedByName, DateTime dateAdded, DateTime dateModified, bool isActive)
		{
			this.tenantID = tenantID;
			this.mandirID = mandirID;
			this.mandirName = mandirName;
			this.godName = godName;
			this.frontImage = frontImage;
			this.insideImage = insideImage;
			this.pujariName = pujariName;
			this.pujariPhoneNumber = pujariPhoneNumber;
			this.history = history;
			this.address = address;
			this.city = city;
			this.state = state;
			this.pincode = pincode;
			this.latitude = latitude;
			this.longitude = longitude;
			this.isVerified = isVerified;
			this.verificationStatus = verificationStatus;
			this.addedByUserID = addedByUserID;
			this.addedByName = addedByName;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.isActive = isActive;
		}

		#endregion

		#region Properties
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
		/// Gets or sets the MandirName value.
		/// </summary>
		public  string MandirName
		{
			get { return mandirName; }
			set { mandirName = value; }
		}

		/// <summary>
		/// Gets or sets the GodName value.
		/// </summary>
		public  string GodName
		{
			get { return godName; }
			set { godName = value; }
		}

		/// <summary>
		/// Gets or sets the FrontImage value.
		/// </summary>
		public  string FrontImage
		{
			get { return frontImage; }
			set { frontImage = value; }
		}

		/// <summary>
		/// Gets or sets the InsideImage value.
		/// </summary>
		public  string InsideImage
		{
			get { return insideImage; }
			set { insideImage = value; }
		}

		/// <summary>
		/// Gets or sets the PujariName value.
		/// </summary>
		public  string PujariName
		{
			get { return pujariName; }
			set { pujariName = value; }
		}

		/// <summary>
		/// Gets or sets the PujariPhoneNumber value.
		/// </summary>
		public  string PujariPhoneNumber
		{
			get { return pujariPhoneNumber; }
			set { pujariPhoneNumber = value; }
		}

		/// <summary>
		/// Gets or sets the History value.
		/// </summary>
		public  string History
		{
			get { return history; }
			set { history = value; }
		}

		/// <summary>
		/// Gets or sets the Address value.
		/// </summary>
		public  string Address
		{
			get { return address; }
			set { address = value; }
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
		/// Gets or sets the State value.
		/// </summary>
		public  string State
		{
			get { return state; }
			set { state = value; }
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
		/// Gets or sets the IsVerified value.
		/// </summary>
		public  bool IsVerified
		{
			get { return isVerified; }
			set { isVerified = value; }
		}

		/// <summary>
		/// Gets or sets the VerificationStatus value.
		/// </summary>
		public  string VerificationStatus
		{
			get { return verificationStatus; }
			set { verificationStatus = value; }
		}

		/// <summary>
		/// Gets or sets the AddedByUserID value.
		/// </summary>
		public  int AddedByUserID
		{
			get { return addedByUserID; }
			set { addedByUserID = value; }
		}

		/// <summary>
		/// Gets or sets the AddedByName value.
		/// </summary>
		public  string AddedByName
		{
			get { return addedByName; }
			set { addedByName = value; }
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
		/// Gets or sets the IsActive value.
		/// </summary>
		public  bool IsActive
		{
			get { return isActive; }
			set { isActive = value; }
		}

		#endregion
	}
}
