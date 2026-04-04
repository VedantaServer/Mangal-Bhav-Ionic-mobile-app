using System;
namespace FaceUPAI.Models
{
	public class MasterData
	{
		#region Fields

		private int masterDataID;
		private int tenantID;
		private int parentItemID;
		private string description;
		private string domain;
		private string identifier;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;
		private string masterDataLevel;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the MasterData class.
		/// </summary>
		public MasterData()
		{
		}

		/// <summary>
		/// Initializes a new instance of the MasterData class.
		/// </summary>
		public MasterData(int tenantID, int parentItemID, string description, string domain, string identifier, DateTime dateAdded, DateTime dateModified, string updatedByUser, string masterDataLevel)
		{
			this.tenantID = tenantID;
			this.parentItemID = parentItemID;
			this.description = description;
			this.domain = domain;
			this.identifier = identifier;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
			this.masterDataLevel = masterDataLevel;
		}

		/// <summary>
		/// Initializes a new instance of the MasterData class.
		/// </summary>
		public MasterData(int masterDataID, int tenantID, int parentItemID, string description, string domain, string identifier, DateTime dateAdded, DateTime dateModified, string updatedByUser, string masterDataLevel)
		{
			this.masterDataID = masterDataID;
			this.tenantID = tenantID;
			this.parentItemID = parentItemID;
			this.description = description;
			this.domain = domain;
			this.identifier = identifier;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
			this.masterDataLevel = masterDataLevel;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the MasterDataID value.
		/// </summary>
		public  int MasterDataID
		{
			get { return masterDataID; }
			set { masterDataID = value; }
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
		/// Gets or sets the ParentItemID value.
		/// </summary>
		public  int ParentItemID
		{
			get { return parentItemID; }
			set { parentItemID = value; }
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
		/// Gets or sets the Domain value.
		/// </summary>
		public  string Domain
		{
			get { return domain; }
			set { domain = value; }
		}

		/// <summary>
		/// Gets or sets the Identifier value.
		/// </summary>
		public  string Identifier
		{
			get { return identifier; }
			set { identifier = value; }
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

		/// <summary>
		/// Gets or sets the MasterDataLevel value.
		/// </summary>
		public  string MasterDataLevel
		{
			get { return masterDataLevel; }
			set { masterDataLevel = value; }
		}

		#endregion
	}
}
