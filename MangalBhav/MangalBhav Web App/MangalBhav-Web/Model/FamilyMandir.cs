using System;
namespace FaceUPAI.Models
{
	public class FamilyMandir
	{
		#region Fields

		private int familyMandirID;
		private int tenantID;
		private int familyID;
		private string mandirName;
		private string mandirDescription;
		private string godName;
		private string mandirPhoto1;
		private string mandirPhoto2;
		private string mandirPhoto3;
		private string aartiName1;
		private string aartiName2;
		private string aartiName3;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the FamilyMandir class.
		/// </summary>
		public FamilyMandir()
		{
		}

		/// <summary>
		/// Initializes a new instance of the FamilyMandir class.
		/// </summary>
		public FamilyMandir(int tenantID, int familyID, string mandirName, string mandirDescription, string godName, string mandirPhoto1, string mandirPhoto2, string mandirPhoto3, string aartiName1, string aartiName2, string aartiName3, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.familyID = familyID;
			this.mandirName = mandirName;
			this.mandirDescription = mandirDescription;
			this.godName = godName;
			this.mandirPhoto1 = mandirPhoto1;
			this.mandirPhoto2 = mandirPhoto2;
			this.mandirPhoto3 = mandirPhoto3;
			this.aartiName1 = aartiName1;
			this.aartiName2 = aartiName2;
			this.aartiName3 = aartiName3;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the FamilyMandir class.
		/// </summary>
		public FamilyMandir(int familyMandirID, int tenantID, int familyID, string mandirName, string mandirDescription, string godName, string mandirPhoto1, string mandirPhoto2, string mandirPhoto3, string aartiName1, string aartiName2, string aartiName3, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.familyMandirID = familyMandirID;
			this.tenantID = tenantID;
			this.familyID = familyID;
			this.mandirName = mandirName;
			this.mandirDescription = mandirDescription;
			this.godName = godName;
			this.mandirPhoto1 = mandirPhoto1;
			this.mandirPhoto2 = mandirPhoto2;
			this.mandirPhoto3 = mandirPhoto3;
			this.aartiName1 = aartiName1;
			this.aartiName2 = aartiName2;
			this.aartiName3 = aartiName3;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FamilyMandirID value.
		/// </summary>
		public  int FamilyMandirID
		{
			get { return familyMandirID; }
			set { familyMandirID = value; }
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
		/// Gets or sets the MandirName value.
		/// </summary>
		public  string MandirName
		{
			get { return mandirName; }
			set { mandirName = value; }
		}

		/// <summary>
		/// Gets or sets the MandirDescription value.
		/// </summary>
		public  string MandirDescription
		{
			get { return mandirDescription; }
			set { mandirDescription = value; }
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
		/// Gets or sets the MandirPhoto1 value.
		/// </summary>
		public  string MandirPhoto1
		{
			get { return mandirPhoto1; }
			set { mandirPhoto1 = value; }
		}

		/// <summary>
		/// Gets or sets the MandirPhoto2 value.
		/// </summary>
		public  string MandirPhoto2
		{
			get { return mandirPhoto2; }
			set { mandirPhoto2 = value; }
		}

		/// <summary>
		/// Gets or sets the MandirPhoto3 value.
		/// </summary>
		public  string MandirPhoto3
		{
			get { return mandirPhoto3; }
			set { mandirPhoto3 = value; }
		}

		/// <summary>
		/// Gets or sets the AartiName1 value.
		/// </summary>
		public  string AartiName1
		{
			get { return aartiName1; }
			set { aartiName1 = value; }
		}

		/// <summary>
		/// Gets or sets the AartiName2 value.
		/// </summary>
		public  string AartiName2
		{
			get { return aartiName2; }
			set { aartiName2 = value; }
		}

		/// <summary>
		/// Gets or sets the AartiName3 value.
		/// </summary>
		public  string AartiName3
		{
			get { return aartiName3; }
			set { aartiName3 = value; }
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
