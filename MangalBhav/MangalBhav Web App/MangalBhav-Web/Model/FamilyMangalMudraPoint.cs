using System;
namespace FaceUPAI.Models
{
	public class FamilyMangalMudraPoint
	{
		#region Fields

		private int familyMangalMudraPointsID;
		private int tenantID;
		private int familyID;
		private int userID;
		private string pointsCount;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the FamilyMangalMudraPoint class.
		/// </summary>
		public FamilyMangalMudraPoint()
		{
		}

		/// <summary>
		/// Initializes a new instance of the FamilyMangalMudraPoint class.
		/// </summary>
		public FamilyMangalMudraPoint(int tenantID, int familyID, int userID, string pointsCount, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.familyID = familyID;
			this.userID = userID;
			this.pointsCount = pointsCount;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the FamilyMangalMudraPoint class.
		/// </summary>
		public FamilyMangalMudraPoint(int familyMangalMudraPointsID, int tenantID, int familyID, int userID, string pointsCount, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.familyMangalMudraPointsID = familyMangalMudraPointsID;
			this.tenantID = tenantID;
			this.familyID = familyID;
			this.userID = userID;
			this.pointsCount = pointsCount;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FamilyMangalMudraPointsID value.
		/// </summary>
		public  int FamilyMangalMudraPointsID
		{
			get { return familyMangalMudraPointsID; }
			set { familyMangalMudraPointsID = value; }
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
		/// Gets or sets the PointsCount value.
		/// </summary>
		public  string PointsCount
		{
			get { return pointsCount; }
			set { pointsCount = value; }
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
