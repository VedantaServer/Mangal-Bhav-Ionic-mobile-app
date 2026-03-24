using System;
namespace FaceUPAI.Models
{
	public class Tenant
	{
		#region Fields

		private int tenantID;
		private string tenantName;
		private string code;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Tenant class.
		/// </summary>
		public Tenant()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Tenant class.
		/// </summary>
		public Tenant(string tenantName, string code, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantName = tenantName;
			this.code = code;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the Tenant class.
		/// </summary>
		public Tenant(int tenantID, string tenantName, string code, bool isActive, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.tenantName = tenantName;
			this.code = code;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
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
		/// Gets or sets the TenantName value.
		/// </summary>
		public  string TenantName
		{
			get { return tenantName; }
			set { tenantName = value; }
		}

		/// <summary>
		/// Gets or sets the Code value.
		/// </summary>
		public  string Code
		{
			get { return code; }
			set { code = value; }
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
