using System;
namespace FaceUPAI.Models
{
	public class Service
	{
		#region Fields

		private int serviceID;
		private int tenantID;
		private string name;
		private string description;
		private int durationMinutes;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Service class.
		/// </summary>
		public Service()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Service class.
		/// </summary>
		public Service(int tenantID, string name, string description, int durationMinutes, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.name = name;
			this.description = description;
			this.durationMinutes = durationMinutes;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the Service class.
		/// </summary>
		public Service(int serviceID, int tenantID, string name, string description, int durationMinutes, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.serviceID = serviceID;
			this.tenantID = tenantID;
			this.name = name;
			this.description = description;
			this.durationMinutes = durationMinutes;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the ServiceID value.
		/// </summary>
		public  int ServiceID
		{
			get { return serviceID; }
			set { serviceID = value; }
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
		/// Gets or sets the Name value.
		/// </summary>
		public  string Name
		{
			get { return name; }
			set { name = value; }
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
		/// Gets or sets the DurationMinutes value.
		/// </summary>
		public  int DurationMinutes
		{
			get { return durationMinutes; }
			set { durationMinutes = value; }
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
