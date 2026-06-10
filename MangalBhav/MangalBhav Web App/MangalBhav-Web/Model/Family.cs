using System;
namespace FaceUPAI.Models
{
	public class Family
	{
		#region Fields

		private int familyID;
		private int tenantID;
		private int userID;
		private string familyName;
		private string familyDescription;
		private string familyAddress;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Family class.
		/// </summary>
		public Family()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Family class.
		/// </summary>
		public Family(int tenantID, int userID, string familyName, string familyDescription, string familyAddress, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.userID = userID;
			this.familyName = familyName;
			this.familyDescription = familyDescription;
			this.familyAddress = familyAddress;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the Family class.
		/// </summary>
		public Family(int familyID, int tenantID, int userID, string familyName, string familyDescription, string familyAddress, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.familyID = familyID;
			this.tenantID = tenantID;
			this.userID = userID;
			this.familyName = familyName;
			this.familyDescription = familyDescription;
			this.familyAddress = familyAddress;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FamilyID value.
		/// </summary>
		public  int FamilyID
		{
			get { return familyID; }
			set { familyID = value; }
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
		/// Gets or sets the FamilyName value.
		/// </summary>
		public  string FamilyName
		{
			get { return familyName; }
			set { familyName = value; }
		}

		/// <summary>
		/// Gets or sets the FamilyDescription value.
		/// </summary>
		public  string FamilyDescription
		{
			get { return familyDescription; }
			set { familyDescription = value; }
		}

		/// <summary>
		/// Gets or sets the FamilyAddress value.
		/// </summary>
		public  string FamilyAddress
		{
			get { return familyAddress; }
			set { familyAddress = value; }
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
