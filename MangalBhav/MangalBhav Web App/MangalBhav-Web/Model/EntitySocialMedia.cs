using System;
namespace FaceUPAI.Models
{
	public class EntitySocialMedia
	{
		#region Fields

		private int entitySocialMediaID;
		private int tenantID;
		private string entityType;
		private int entityID;
		private string platform;
		private string link;
		private string username;
		private string displayName;
		private bool isVerified;
		private bool isActive;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string addedByUser;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the EntitySocialMedia class.
		/// </summary>
		public EntitySocialMedia()
		{
		}

		/// <summary>
		/// Initializes a new instance of the EntitySocialMedia class.
		/// </summary>
		public EntitySocialMedia(int tenantID, string entityType, int entityID, string platform, string link, string username, string displayName, bool isVerified, bool isActive, DateTime dateAdded, DateTime dateModified, string addedByUser, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.entityType = entityType;
			this.entityID = entityID;
			this.platform = platform;
			this.link = link;
			this.username = username;
			this.displayName = displayName;
			this.isVerified = isVerified;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.addedByUser = addedByUser;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the EntitySocialMedia class.
		/// </summary>
		public EntitySocialMedia(int entitySocialMediaID, int tenantID, string entityType, int entityID, string platform, string link, string username, string displayName, bool isVerified, bool isActive, DateTime dateAdded, DateTime dateModified, string addedByUser, string updatedByUser)
		{
			this.entitySocialMediaID = entitySocialMediaID;
			this.tenantID = tenantID;
			this.entityType = entityType;
			this.entityID = entityID;
			this.platform = platform;
			this.link = link;
			this.username = username;
			this.displayName = displayName;
			this.isVerified = isVerified;
			this.isActive = isActive;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.addedByUser = addedByUser;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the EntitySocialMediaID value.
		/// </summary>
		public  int EntitySocialMediaID
		{
			get { return entitySocialMediaID; }
			set { entitySocialMediaID = value; }
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
		/// Gets or sets the EntityType value.
		/// </summary>
		public  string EntityType
		{
			get { return entityType; }
			set { entityType = value; }
		}

		/// <summary>
		/// Gets or sets the EntityID value.
		/// </summary>
		public  int EntityID
		{
			get { return entityID; }
			set { entityID = value; }
		}

		/// <summary>
		/// Gets or sets the Platform value.
		/// </summary>
		public  string Platform
		{
			get { return platform; }
			set { platform = value; }
		}

		/// <summary>
		/// Gets or sets the Link value.
		/// </summary>
		public  string Link
		{
			get { return link; }
			set { link = value; }
		}

		/// <summary>
		/// Gets or sets the Username value.
		/// </summary>
		public  string Username
		{
			get { return username; }
			set { username = value; }
		}

		/// <summary>
		/// Gets or sets the DisplayName value.
		/// </summary>
		public  string DisplayName
		{
			get { return displayName; }
			set { displayName = value; }
		}

		/// <summary>
		/// Gets or sets the IsVerified value.
		/// </summary>
		public  bool IsVerified
		{
			get { return isVerified; }
			set { isVerified = value; }
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
		/// Gets or sets the AddedByUser value.
		/// </summary>
		public  string AddedByUser
		{
			get { return addedByUser; }
			set { addedByUser = value; }
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
