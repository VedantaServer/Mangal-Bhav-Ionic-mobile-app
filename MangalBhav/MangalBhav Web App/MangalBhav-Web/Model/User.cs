using System;
namespace FaceUPAI.Models
{
	public class User
	{
		#region Fields

		private int userID;
		private int tenantID;
		private string role;
		private string loginID;
		private string passwordHash;
		private bool isLocked;
		private string status;
		private DateTime lastLoginAt;
		private DateTime passwordChangedAt;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the User class.
		/// </summary>
		public User()
		{
		}

		/// <summary>
		/// Initializes a new instance of the User class.
		/// </summary>
		public User(int tenantID, string role, string loginID, string passwordHash, bool isLocked, string status, DateTime lastLoginAt, DateTime passwordChangedAt, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.role = role;
			this.loginID = loginID;
			this.passwordHash = passwordHash;
			this.isLocked = isLocked;
			this.status = status;
			this.lastLoginAt = lastLoginAt;
			this.passwordChangedAt = passwordChangedAt;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the User class.
		/// </summary>
		public User(int userID, int tenantID, string role, string loginID, string passwordHash, bool isLocked, string status, DateTime lastLoginAt, DateTime passwordChangedAt, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.userID = userID;
			this.tenantID = tenantID;
			this.role = role;
			this.loginID = loginID;
			this.passwordHash = passwordHash;
			this.isLocked = isLocked;
			this.status = status;
			this.lastLoginAt = lastLoginAt;
			this.passwordChangedAt = passwordChangedAt;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
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
		/// Gets or sets the Role value.
		/// </summary>
		public  string Role
		{
			get { return role; }
			set { role = value; }
		}

		/// <summary>
		/// Gets or sets the LoginID value.
		/// </summary>
		public  string LoginID
		{
			get { return loginID; }
			set { loginID = value; }
		}

		/// <summary>
		/// Gets or sets the PasswordHash value.
		/// </summary>
		public  string PasswordHash
		{
			get { return passwordHash; }
			set { passwordHash = value; }
		}

		/// <summary>
		/// Gets or sets the IsLocked value.
		/// </summary>
		public  bool IsLocked
		{
			get { return isLocked; }
			set { isLocked = value; }
		}

		/// <summary>
		/// Gets or sets the Status value.
		/// </summary>
		public  string Status
		{
			get { return status; }
			set { status = value; }
		}

		/// <summary>
		/// Gets or sets the LastLoginAt value.
		/// </summary>
		public  DateTime LastLoginAt
		{
			get { return lastLoginAt; }
			set { lastLoginAt = value; }
		}

		/// <summary>
		/// Gets or sets the PasswordChangedAt value.
		/// </summary>
		public  DateTime PasswordChangedAt
		{
			get { return passwordChangedAt; }
			set { passwordChangedAt = value; }
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
