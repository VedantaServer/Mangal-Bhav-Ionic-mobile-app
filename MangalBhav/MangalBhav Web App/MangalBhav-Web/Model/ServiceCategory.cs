using System;
namespace FaceUPAI.Models
{
	public class ServiceCategory
	{
		#region Fields

		private int categoryID;
		private string categoryName;
		private string categoryName_HI;
		private string description;
		private string description_HI;
		private int minAge;
		private int maxAge;
		private string ageText;
		private string gender;
		private string ritualType;
		private bool isLifeEvent;
		private bool isFestivalRelated;
		private int tenantID;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ServiceCategory class.
		/// </summary>
		public ServiceCategory()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ServiceCategory class.
		/// </summary>
		public ServiceCategory(string categoryName, string categoryName_HI, string description, string description_HI, int minAge, int maxAge, string ageText, string gender, string ritualType, bool isLifeEvent, bool isFestivalRelated, int tenantID, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.categoryName = categoryName;
			this.categoryName_HI = categoryName_HI;
			this.description = description;
			this.description_HI = description_HI;
			this.minAge = minAge;
			this.maxAge = maxAge;
			this.ageText = ageText;
			this.gender = gender;
			this.ritualType = ritualType;
			this.isLifeEvent = isLifeEvent;
			this.isFestivalRelated = isFestivalRelated;
			this.tenantID = tenantID;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the ServiceCategory class.
		/// </summary>
		public ServiceCategory(int categoryID, string categoryName, string categoryName_HI, string description, string description_HI, int minAge, int maxAge, string ageText, string gender, string ritualType, bool isLifeEvent, bool isFestivalRelated, int tenantID, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.categoryID = categoryID;
			this.categoryName = categoryName;
			this.categoryName_HI = categoryName_HI;
			this.description = description;
			this.description_HI = description_HI;
			this.minAge = minAge;
			this.maxAge = maxAge;
			this.ageText = ageText;
			this.gender = gender;
			this.ritualType = ritualType;
			this.isLifeEvent = isLifeEvent;
			this.isFestivalRelated = isFestivalRelated;
			this.tenantID = tenantID;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the CategoryID value.
		/// </summary>
		public  int CategoryID
		{
			get { return categoryID; }
			set { categoryID = value; }
		}

		/// <summary>
		/// Gets or sets the CategoryName value.
		/// </summary>
		public  string CategoryName
		{
			get { return categoryName; }
			set { categoryName = value; }
		}

		/// <summary>
		/// Gets or sets the CategoryName_HI value.
		/// </summary>
		public  string CategoryName_HI
		{
			get { return categoryName_HI; }
			set { categoryName_HI = value; }
		}

		/// <summary>
		/// Gets or sets the Description value.
		/// </summary>
		public  string Description
		{
			get { return description; }
			set { description = value; }
		}

		/// <summary>
		/// Gets or sets the Description_HI value.
		/// </summary>
		public  string Description_HI
		{
			get { return description_HI; }
			set { description_HI = value; }
		}

		/// <summary>
		/// Gets or sets the MinAge value.
		/// </summary>
		public  int MinAge
		{
			get { return minAge; }
			set { minAge = value; }
		}

		/// <summary>
		/// Gets or sets the MaxAge value.
		/// </summary>
		public  int MaxAge
		{
			get { return maxAge; }
			set { maxAge = value; }
		}

		/// <summary>
		/// Gets or sets the AgeText value.
		/// </summary>
		public  string AgeText
		{
			get { return ageText; }
			set { ageText = value; }
		}

		/// <summary>
		/// Gets or sets the Gender value.
		/// </summary>
		public  string Gender
		{
			get { return gender; }
			set { gender = value; }
		}

		/// <summary>
		/// Gets or sets the RitualType value.
		/// </summary>
		public  string RitualType
		{
			get { return ritualType; }
			set { ritualType = value; }
		}

		/// <summary>
		/// Gets or sets the IsLifeEvent value.
		/// </summary>
		public  bool IsLifeEvent
		{
			get { return isLifeEvent; }
			set { isLifeEvent = value; }
		}

		/// <summary>
		/// Gets or sets the IsFestivalRelated value.
		/// </summary>
		public  bool IsFestivalRelated
		{
			get { return isFestivalRelated; }
			set { isFestivalRelated = value; }
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
