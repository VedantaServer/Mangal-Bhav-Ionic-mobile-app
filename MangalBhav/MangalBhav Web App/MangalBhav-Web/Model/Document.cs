using System;
namespace FaceUPAI.Models
{
	public class Document
	{
		#region Fields

		private int documentID;
		private int tenantID;
		private string documentType;
		private string entityType;
		private int entityRefKey;
		private string description;
		private string fileName;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Document class.
		/// </summary>
		public Document()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Document class.
		/// </summary>
		public Document(int tenantID, string documentType, string entityType, int entityRefKey, string description, string fileName, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.documentType = documentType;
			this.entityType = entityType;
			this.entityRefKey = entityRefKey;
			this.description = description;
			this.fileName = fileName;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the Document class.
		/// </summary>
		public Document(int documentID, int tenantID, string documentType, string entityType, int entityRefKey, string description, string fileName, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.documentID = documentID;
			this.tenantID = tenantID;
			this.documentType = documentType;
			this.entityType = entityType;
			this.entityRefKey = entityRefKey;
			this.description = description;
			this.fileName = fileName;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the DocumentID value.
		/// </summary>
		public  int DocumentID
		{
			get { return documentID; }
			set { documentID = value; }
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
		/// Gets or sets the DocumentType value.
		/// </summary>
		public  string DocumentType
		{
			get { return documentType; }
			set { documentType = value; }
		}

		/// <summary>
		/// Gets or sets the EntityType value.
		/// </summary>
		public  string EntityType
		{
			get { return entityType; }
			set { entityType = value; }
		}

		/// <summary>
		/// Gets or sets the EntityRefKey value.
		/// </summary>
		public  int EntityRefKey
		{
			get { return entityRefKey; }
			set { entityRefKey = value; }
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
		/// Gets or sets the FileName value.
		/// </summary>
		public  string FileName
		{
			get { return fileName; }
			set { fileName = value; }
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
