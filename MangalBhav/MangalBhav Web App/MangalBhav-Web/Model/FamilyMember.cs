using System;
namespace FaceUPAI.Models
{
	public class FamilyMember
	{
		#region Fields

		private int familyMembersID;
		private int tenantID;
		private int familyID;
		private int userID;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the FamilyMember class.
		/// </summary>
		public FamilyMember()
		{
		}

		/// <summary>
		/// Initializes a new instance of the FamilyMember class.
		/// </summary>
		public FamilyMember(int tenantID, int familyID, int userID, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.familyID = familyID;
			this.userID = userID;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the FamilyMember class.
		/// </summary>
		public FamilyMember(int familyMembersID, int tenantID, int familyID, int userID, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.familyMembersID = familyMembersID;
			this.tenantID = tenantID;
			this.familyID = familyID;
			this.userID = userID;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FamilyMembersID value.
		/// </summary>
		public  int FamilyMembersID
		{
			get { return familyMembersID; }
			set { familyMembersID = value; }
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
		/// Gets or sets the FamilyID value.
		/// </summary>
		public  int FamilyID
		{
			get { return familyID; }
			set { familyID = value; }
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
