using System;
namespace FaceUPAI.Models
{
	public class ServiceCategoryMapping
	{
		#region Fields

		private int mappingID;
		private int serviceID;
		private int categoryID;
		private int tenantID;
		private bool isActive;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ServiceCategoryMapping class.
		/// </summary>
		public ServiceCategoryMapping()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ServiceCategoryMapping class.
		/// </summary>
		public ServiceCategoryMapping(int serviceID, int categoryID, int tenantID, bool isActive, DateTime dateAdded)
		{
			this.serviceID = serviceID;
			this.categoryID = categoryID;
			this.tenantID = tenantID;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the ServiceCategoryMapping class.
		/// </summary>
		public ServiceCategoryMapping(int mappingID, int serviceID, int categoryID, int tenantID, bool isActive, DateTime dateAdded)
		{
			this.mappingID = mappingID;
			this.serviceID = serviceID;
			this.categoryID = categoryID;
			this.tenantID = tenantID;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the MappingID value.
		/// </summary>
		public  int MappingID
		{
			get { return mappingID; }
			set { mappingID = value; }
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
		/// Gets or sets the CategoryID value.
		/// </summary>
		public  int CategoryID
		{
			get { return categoryID; }
			set { categoryID = value; }
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

		#endregion
	}
}
